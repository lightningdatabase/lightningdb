import { createContext, useContext } from "react"
import { QueryStoreState } from "./types.js"
import { Cache } from "./cache.js"
import { ExclusiveOneOf, Includes } from "./baseTypes.js"

type IncludeType = {
  [key: string]:
    | {
        where?: object
        take?: number
        skip?: number
        orderBy?: object
        include?: IncludeType
      }
    | boolean
}

export type QueryType = {
  [key: string]: QueryParams | AliasQuery
}

export type QueryList = AliasQuery[]

export type AliasQuery = QueryParams & {
  table: string
}

export type QueryParams = {
  where?: object
  include?: IncludeType
  take?: number
  skip?: number
  orderBy?: object
}

export type MutationInputType = Record<
  string,
  | ExclusiveOneOf<{
      create: {
        data: object
      }
      createMany: {
        data: object[]
      }
      update?: {
        where: {
          id?: number | string
        }
        data: object
      }
      updateMany?: {
        where?: object
        data: object
        limit?: number
      }
      upsert?: {
        where: {
          id?: number | string
        }
        create: object
        update: object
      }
      delete?: {
        where: {
          id?: number | string
        }
      }
      deleteMany?: {
        where?: object
        limit?: number
      }
    }>
  | undefined
>

export type ModelsType = Record<string, ModelType>

export type ModelType = {
  name: string
  objects: Record<string, ModelType | ModelType[]>
  scalars: Record<string, any>
}

type DBContextType = {
  includesMap: Includes
  cache: Cache
  internalCache: Cache
  updateCache: React.Dispatch<React.SetStateAction<Cache>>
  sendQuery: (query: QueryList) => number
  sendMutation: (mutation: MutationInputType | MutationInputType[]) => number
  queryStates: Map<number, QueryStoreState>
  mutationStates: Map<number, { isLoading: boolean; error?: Error }>
}

export const DBContext = createContext<DBContextType | null>(null)

export const useDB = () => {
  const context = useContext(DBContext)
  if (!context) throw new Error("useDB must be used within DBProvider")
  return context
}
