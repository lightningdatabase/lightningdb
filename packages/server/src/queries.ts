import { ClientInfo, Queries } from "./clientStore"
import { splitResult } from "./queries/split"
import { addQueryToStore } from "./queries/store"
import { PrismaClient } from "@prisma/client"
import { includesMap } from "./schema"
import { generateIncludes } from "./queries/includes"
import singleModelName from "./helpers/singleModelName"

type QueryResult = Record<string, Record<string, any>[]>

const mergeResults = (queryRes: QueryResult, result: QueryResult) => {
  // Merge results and remove duplicates based on id
  Object.entries(result).forEach(([key, items]) => {
    if (Array.isArray(items)) {
      const existingItems = queryRes[key] || []
      const mergedItems = [...existingItems, ...items]

      // Remove duplicates based on id
      const uniqueItems = mergedItems.filter(
        (item, index, self) => index === self.findIndex(t => t.id === item.id),
      )

      queryRes[key] = uniqueItems
    } else {
      queryRes[key] = items
    }
  })
}
const runQueries = async (
  queries: Queries,
  clientInfo: ClientInfo,
  prisma: PrismaClient,
) => {
  let queryRes: QueryResult = {}

  // Dynamically handle queries for any model
  for (const query of queries) {
    const { table, ...queryWithoutTable } = query

    const rows = await prisma[singleModelName(table)].findMany({
      ...queryWithoutTable,
      include: generateIncludes(query),
    })

    addQueryToStore(clientInfo, table, queryWithoutTable, rows, includesMap)

    const result = splitResult(table, rows, query)

    mergeResults(queryRes, result)
  }

  return queryRes
}

export default runQueries
