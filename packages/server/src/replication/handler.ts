import prisma from "../client"
import { StoredQuery, ClientInfo, clientStore } from "../clientStore"
import { includesMap, tablesMap } from "../schema"
import {
  DeleteChange,
  InsertChange,
  ReplicationChange,
  ReplicationLog,
  UpdateChange,
} from "./types"
import { enhance } from "@zenstackhq/runtime"
import { PrismaClient } from "@prisma/client"
import { applyWhereClause } from "./where"
import { splitResult } from "src/queries/split"
import { generateIncludes } from "src/queries/store"
import singleModelName from "src/helpers/singleModelName"

const forEachOpenClient = (fn: (client: ClientInfo) => Promise<void>) =>
  Promise.all(
    Array.from(clientStore).map(async client => {
      if (client.socket.readyState === WebSocket.OPEN) await fn(client)
    }),
  )

export const recordsToIds = (records: Record<string, Record<string, any>[]>) =>
  Object.entries(records).reduce<Record<string, { id: number }[]>>(
    (acc, [table, rows]) => {
      acc[table] = rows.map(row => ({ id: row.id }))
      return acc
    },
    {},
  )

const getRowFromChange = (
  change: InsertChange | UpdateChange,
): Record<string, any> =>
  change.columnnames.reduce<Record<string, any>>((acc, column, index) => {
    acc[column] = change.columnvalues[index]
    return acc
  }, {})

const getOldRowFromChange = (change: UpdateChange | DeleteChange) =>
  change.oldkeys.keynames.reduce<Record<string, any>>((acc, column, index) => {
    acc[column] = change.oldkeys.keyvalues[index]
    return acc
  }, {})

type ChangeValues = Record<string, any>

export type GroupedChanges = Record<string, ReplicationChange[]>

const groupChangesByTable = (changes: ReplicationChange[]): GroupedChanges =>
  changes.reduce<GroupedChanges>((acc, change) => {
    const key = tablesMap[change.table]
    if (!acc[key]) {
      acc[key] = [change]
    } else {
      acc[key].push(change)
    }
    return acc
  }, {})

const handler = async (lsn: string, log: ReplicationLog) => {
  // console.log(lsn)
  // console.log(log)
  // console.log(log.change[0])

  const groupedChanges = groupChangesByTable(log.change)

  await forEachOpenClient(client => handleClient(client, groupedChanges))
}

const handleClient = async (
  client: ClientInfo,
  groupedChanges: GroupedChanges,
) => {
  const { data, deletes } = await generateClientUpdates(
    client,
    groupedChanges,
    prisma,
  )

  if (Object.keys(data).length > 0 || Object.keys(deletes).length > 0)
    sendClientUpdates(client, data, recordsToIds(deletes))
}

const getRowsFromChanges = (
  changes: ReplicationChange[],
): Record<string, any>[] =>
  changes
    .filter(change => change.kind === "insert" || change.kind === "update")
    .map(getRowFromChange)

const getDeletesFromChanges = (changes: ReplicationChange[]) =>
  changes
    .filter(change => change.kind === "delete")
    .map(change =>
      change.oldkeys.keynames.reduce<Record<string, any>>(
        (acc, column, index) => {
          acc[column] = change.oldkeys.keyvalues[index]
          return acc
        },
        {},
      ),
    )

const generateFilterChange =
  (where: object, query: StoredQuery, enhancedPrisma: PrismaClient) =>
  async (change: ReplicationChange): Promise<boolean> => {
    if (change.kind === "insert") {
      const row = getRowFromChange(change)

      return (
        applyWhereClause(where, row) &&
        (await checkRow(row, query, enhancedPrisma))
      )
    }

    if (change.kind === "update") {
      const row = getRowFromChange(change)
      const oldRow = getOldRowFromChange(change)

      return (
        (applyWhereClause(where, oldRow) &&
          (await checkRow(oldRow, query, enhancedPrisma))) ||
        (applyWhereClause(where, row) &&
          (await checkRow(row, query, enhancedPrisma)))
      )
    }

    if (change.kind === "delete") {
      const row = getOldRowFromChange(change)

      return (
        applyWhereClause(where, row) &&
        (await checkRow(row, query, enhancedPrisma))
      )
    }

    return false
  }

const checkRow = async (
  row: Record<string, any>,
  query: StoredQuery,
  enhancedPrisma: PrismaClient,
): Promise<boolean> =>
  enhancedPrisma[singleModelName(query.table)].check({
    operation: "read",
    where: row,
  })

async function someAsync<T>(
  arr: T[],
  predicate: (item: T) => Promise<boolean | undefined>,
): Promise<boolean> {
  for (const item of arr) {
    if (await predicate(item)) {
      return true
    }
  }
  return false
}

const generateFilterQuery =
  (groupedChanges: GroupedChanges, enhancedPrisma: PrismaClient) =>
  async (query: StoredQuery): Promise<boolean> => {
    //Check if any changes match query table
    const changes: ReplicationChange[] | undefined = groupedChanges[query.table]

    if (changes) {
      const where = query.query.where

      if (!where)
        return someAsync(changes, async change => {
          if (change.kind === "insert")
            return checkRow(getRowFromChange, query, change)

          if (change.kind === "update") {
            return (
              (await checkRow(
                getRowFromChange(change),
                query,
                enhancedPrisma,
              )) ||
              (await checkRow(
                getOldRowFromChange(change),
                query,
                enhancedPrisma,
              ))
            )
          }

          if (change.kind === "delete")
            return checkRow(getOldRowFromChange(change), query, enhancedPrisma)
        })

      const matchChanges = await someAsync(
        changes,
        generateFilterChange(where, query, enhancedPrisma),
      )

      if (matchChanges) return true
    }

    const includes = query.includes

    if (includes)
      return includes.some(include => {
        const changes = groupedChanges[include.table]

        if (!changes) return false

        const where = include.query.where

        if (!where) return true

        return someAsync(
          changes,
          generateFilterChange(where, query, enhancedPrisma),
        )
      })

    return false
  }

type QueryRow = Record<string, any>

const runQuery = async (
  query: StoredQuery,
  enhancedPrisma: PrismaClient,
): Promise<Record<string, QueryRow[]>> => {
  const res = (await enhancedPrisma[singleModelName(query.table)].findMany(
    query.query,
  )) as QueryRow[]

  query.includes = generateIncludes(
    query.query,
    query.table,
    { [query.table]: res },
    includesMap,
  )

  return splitResult(query.table, res, query.query)
}

async function filterAsync<T>(
  arr: T[],
  predicate: (item: T) => Promise<boolean>,
): Promise<T[]> {
  const results = await Promise.all(arr.map(predicate))
  return arr.filter((_, i) => results[i])
}

export const generateClientUpdates = async (
  client: ClientInfo,
  groupedChanges: GroupedChanges,
  prismaClient: PrismaClient,
): Promise<{
  data: Record<string, ChangeValues[]>
  deletes: Record<string, ChangeValues[]>
}> => {
  const enhancedPrisma = enhance(prismaClient, { user: client.user })

  // Get matching queries based on table name and where clause
  const matchingQueries = await filterAsync(
    client.queries,
    generateFilterQuery(groupedChanges, enhancedPrisma),
  )

  const results: Record<string, QueryRow[]>[] = await Promise.all(
    matchingQueries.map(query => runQuery(query, enhancedPrisma)),
  )

  const data = results.reduce<Record<string, QueryRow[]>>((acc, result) => {
    Object.entries(result).forEach(([table, rows]) => {
      if (rows.length === 0) return

      if (acc[table]) {
        // Merge with existing rows, avoiding duplicates based on id
        const existingIds = new Set(acc[table].map(row => row.id))
        const newRows = rows.filter(row => !existingIds.has(row.id))
        acc[table] = [...acc[table], ...newRows]
      } else {
        acc[table] = rows
      }
    })
    return acc
  }, {})

  const deletes = Object.entries(groupedChanges).reduce<
    Record<string, Record<string, any>[]>
  >((acc, [table, changes]) => {
    // Get matching queries based on table name
    const filteredQueries = matchingQueries.filter(
      query => query.table === table,
    )

    const tableRows = table in data ? data[table] : undefined

    // Fetch rows for insert and update changes
    const rows = getRowsFromChanges(changes)

    // Add rows that are not in the tableRows
    const missingRows =
      matchingQueries.length > 0
        ? rows.filter(r => !tableRows?.some(tr => tr.id === r.id))
        : []

    // Fetch rows for delete changes
    const deletes = getDeletesFromChanges(changes)

    // Add deletes that match a where clause
    const filteredDeletes = deletes.filter(d =>
      filteredQueries.some(query => applyWhereClause(query.query.where!, d)),
    )

    // Set deletes in acc to deletes by table name
    const finalDeletes = filteredDeletes.concat(missingRows)
    if (finalDeletes.length > 0) acc[table] = finalDeletes

    return acc
  }, {})

  return {
    data,
    deletes,
  }
}

const sendClientUpdates = (
  client: ClientInfo,
  data: Record<string, ChangeValues[]>,
  deletes: Record<string, { id: number }[]>,
) => {
  const message = JSON.stringify({
    data,
    deletes,
  })
  client.socket.send(message)
}

export default handler
