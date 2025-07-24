import { ModelsType, ModelType, QueryParams, QueryType } from "./context.js"

export type QueryState<
  Q extends QueryType,
  M extends ModelsType,
  S extends ModelsType,
> = QueryStoreState & {
  data: Partial<QueryResponse<Q, M, S>> | undefined
}

export type QueryStoreState = {
  error: Error | undefined
  isLoading: boolean
}

// Helper type to extract the scalar fields from a model
type ScalarFields<T> = T extends { scalars: infer S } ? S : never

// Helper type to extract the object fields from a model
type ObjectFields<T> = T extends { objects: infer O } ? O : never

// Helper type to handle nested includes
type NestedInclude<T, I> = T extends ModelType
  ? ScalarFields<T> & {
      [P in keyof I]: P extends keyof ObjectFields<T>
        ? I[P] extends boolean
          ? ObjectFields<T>[P] extends ModelType
            ? ScalarFields<ObjectFields<T>[P]> &
                ObjectFields<ObjectFields<T>[P]>
            : ObjectFields<T>[P] extends Array<infer U>
              ? U extends ModelType
                ? Array<ScalarFields<U> & ObjectFields<U>>
                : ObjectFields<T>[P]
              : ObjectFields<T>[P]
          : I[P] extends object
            ? ObjectFields<T>[P] extends ModelType
              ? I[P] extends { include: infer NestedI }
                ? NestedInclude<ObjectFields<T>[P], NestedI>
                : ScalarFields<ObjectFields<T>[P]>
              : ObjectFields<T>[P] extends Array<infer U>
                ? U extends ModelType
                  ? I[P] extends { include: infer NestedI }
                    ? Array<NestedInclude<U, NestedI>>
                    : Array<ScalarFields<U>>
                  : ObjectFields<T>[P]
                : ObjectFields<T>[P]
            : never
        : never
    }
  : never

export type QueryResponse<
  Q extends QueryType,
  M extends ModelsType,
  S extends ModelsType,
> = {
  [K in keyof Q]: Q[K] extends { table: infer T } & Record<string, any>
    ? T extends keyof M
      ? NestedInclude<M[T], Q[K]["include"]>[]
      : never
    : K extends keyof M
      ? Q[K] extends QueryParams
        ? NestedInclude<M[K], Q[K]["include"]>[]
        : never
      : K extends keyof S
        ? Q[K] extends QueryParams
          ? NestedInclude<S[K], Q[K]["include"]>
          : never
        : never
}

export type SelectSubset<Query, TopLevelQueries, AliasQueries> = {
  [key in keyof Query]: key extends keyof TopLevelQueries
    ? Query[key]
    : key extends string
      ? Query[key] extends AliasQueries
        ? Query[key]
        : never
      : never
}
