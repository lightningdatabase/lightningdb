import { useEffect, useMemo, useRef } from "react"
import { QueryState, QueryResponse } from "./types"
import { Includes } from "./baseTypes.js"
import {
  ModelsType,
  AliasQuery,
  QueryParams,
  QueryType,
  useDB,
} from "./context"
import { Cache } from "./cache"
import { applyWhere } from "./whereClauses"
import { queryToQueryList } from "./helpers/queries"

export const processIncludes = (
  item: Record<string, any>,
  includes: Record<string, any>,
  cache: Cache,
  includesMap: Includes,
  parentKey: string,
): void =>
  Object.entries(includes).forEach(([includeKey, includeConditions]) => {
    const includeMap = includesMap[parentKey][includeKey]

    // Get the related items from cache
    const relatedItems = cache[includeMap.model]
      ?.filter(row =>
        includeMap.type === "oneToMany"
          ? row[includeMap.field] === item.id
          : row.id === item[includeMap.field],
      )
      .map(item => ({ ...item }))

    if (!relatedItems?.length) {
      item[includeKey] = includeMap.type === "manyToOne" ? null : []
      return
    }

    if (typeof includeConditions === "boolean") {
      item[includeKey] =
        includeMap.type === "manyToOne" ? relatedItems[0] : relatedItems
      return
    }

    // Apply where conditions
    let filteredItems = relatedItems
    if (includeConditions.where) {
      filteredItems = filteredItems.filter(i =>
        Object.entries(includeConditions.where).every(([field, value]) =>
          applyWhere(
            parentKey,
            field,
            value as any,
            i as Record<string, any>,
            includesMap,
            cache,
          ),
        ),
      )
    }

    // Apply ordering
    if (includeConditions.orderBy) {
      for (const [field, direction] of Object.entries(
        includeConditions.orderBy,
      )) {
        filteredItems.sort((a, b) => {
          const aValue = a[field as keyof typeof a]
          const bValue = b[field as keyof typeof b]
          if (aValue === bValue) return 0
          return (aValue < bValue ? -1 : 1) * (direction === "asc" ? 1 : -1)
        })
      }
    }

    // Apply pagination
    if (includeConditions.skip) {
      filteredItems = filteredItems.slice(includeConditions.skip)
    }
    if (includeConditions.take) {
      filteredItems = filteredItems.slice(0, includeConditions.take)
    }

    // Process nested includes
    if (includeConditions.include) {
      filteredItems.forEach(relatedItem => {
        processIncludes(
          relatedItem,
          includeConditions.include,
          cache,
          includesMap,
          includeMap.model,
        )
      })
    }

    // Set the result
    item[includeKey] =
      includeMap.type === "manyToOne" ? filteredItems[0] : filteredItems
  })

const getCacheKey = (
  conditions: QueryParams | AliasQuery,
  cacheKey: string,
) => {
  if ("table" in conditions)
    return { cacheKey: conditions.table, single: false }

  if (!cacheKey.endsWith("s")) return { cacheKey: `${cacheKey}s`, single: true }

  return { cacheKey, single: false }
}

const useQuery = <
  Q extends QueryType,
  M extends ModelsType,
  S extends ModelsType,
>(
  query: Q,
): QueryState<Q, M, S> => {
  const { sendQuery, queryStates, cache, includesMap } = useDB()

  const queryList = queryToQueryList(query)
  const queryKeyRef = useRef<number | null>(null)
  const prevQueryKeyRef = useRef<string | null>(null)

  const queryKey = useMemo(() => JSON.stringify(query), [query])

  useEffect(() => {
    if (prevQueryKeyRef.current !== queryKey) {
      const queryId = sendQuery(queryList)
      queryKeyRef.current = queryId
      prevQueryKeyRef.current = queryKey
    }
  }, [queryKey, queryList, sendQuery])

  const queryState = (queryKeyRef.current &&
    queryStates.get(queryKeyRef.current)) || {
    error: undefined,
    isLoading: true,
  }

  // Calculate data from cache
  const data = useMemo(() => {
    if (queryState.error) return undefined

    const queryResponse = Object.entries(query).reduce<
      Partial<QueryResponse<Q, M, S>>
    >((acc, [key, conditions]) => {
      // Determine the cache key to use - either the table property or the query key
      const { cacheKey, single } = getCacheKey(conditions, key)

      if (cache[cacheKey]) {
        let filteredValues = cache[cacheKey].filter(item => {
          const where = conditions.where
          if (!where) return true
          return Object.entries(where).every(([field, value]) =>
            applyWhere(cacheKey, field, value, item, includesMap, cache),
          )
        })

        const orderBy = conditions.orderBy
        if (orderBy) {
          for (const [field, direction] of Object.entries(orderBy)) {
            filteredValues = filteredValues.sort((a, b) => {
              const aValue = a[field as keyof typeof a]
              const bValue = b[field as keyof typeof b]
              if (aValue === bValue) return 0
              return (aValue < bValue ? -1 : 1) * (direction === "asc" ? 1 : -1)
            })
          }
        }

        if (conditions.skip) {
          filteredValues = filteredValues.slice(conditions.skip)
        }

        if (conditions.take) {
          filteredValues = filteredValues.slice(0, conditions.take)
        }

        const includes = conditions.include
        if (includes) {
          filteredValues = filteredValues.map(item => {
            const clonedItem = { ...item }
            processIncludes(clonedItem, includes, cache, includesMap, cacheKey)
            return clonedItem
          })
        }

        acc[key as keyof Q] = single
          ? filteredValues[0]
          : (filteredValues as any)
      }

      return acc
    }, {})

    return Object.keys(queryResponse).length > 0 ? queryResponse : undefined
  }, [cache, query, queryState])

  return {
    ...queryState,
    data,
  }
}

export default useQuery

export type { QueryType }
