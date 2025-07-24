import { ClientInfo, Includes, QueryParams } from "../clientStore"
import { Includes as IncludesMapType } from "../types"

type QueryRes = Record<string, Record<string, any>[] | Record<string, any>>

export const generateIncludes = (
  query: QueryParams,
  tableName: string,
  queryRes: QueryRes,
  includesMap: IncludesMapType,
): Includes => {
  if (!query.include) return []

  const includes: Includes = []

  Object.entries(query.include).forEach(([includeName, value]) => {
    const queryResult = queryRes[tableName]

    if (!queryResult) return

    const include = includesMap[tableName]?.[includeName]

    if (!include) {
      console.log("include not found", includeName)
      return
    }

    const subWhere = Array.isArray(queryResult)
      ? {
          [include.type === "oneToMany" ? include.field : "id"]: {
            in: Array.from(
              new Set(
                queryResult.map(item =>
                  include.type === "oneToMany"
                    ? item.id
                    : item[includeName]?.id,
                ),
              ),
            ),
          },
        }
      : { [include.field]: queryResult.id }

    // Add the current include
    includes.push({
      table: include.model,
      query: {
        ...value,
        where: { ...value.where, ...subWhere },
      },
    })

    // Handle nested includes recursively and add them to the top level
    if (value.include) {
      const nestedIncludes = generateIncludes(
        { include: value.include },
        includeName,
        {
          [includeName]: queryResult
            .map((item: Record<string, any>) => item[includeName])
            .flat(),
        },
        includesMap,
      )
      includes.push(...nestedIncludes)
    }
  })

  return includes
}

export const addQueryToStore = (
  clientInfo: ClientInfo,
  table: string,
  query: QueryParams,
  queryRes: QueryRes,
  includesMap: IncludesMapType,
) => {
  clientInfo.queries.push({
    table,
    query,
    includes: generateIncludes(query, table, queryRes, includesMap),
  })
}
