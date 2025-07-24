import { AliasQuery, QueryList, QueryParams, QueryType } from "../context"

const processQuery = ([key, conditions]: [
  string,
  QueryParams | AliasQuery,
]) => {
  if ("table" in conditions) return conditions

  if (key.endsWith("s"))
    return {
      table: key,
      ...conditions,
    }

  return {
    table: key + "s",
    take: 1,
    ...conditions,
  }
}

export const queryToQueryList = (query: QueryType): QueryList =>
  Object.entries(query).map(processQuery)
