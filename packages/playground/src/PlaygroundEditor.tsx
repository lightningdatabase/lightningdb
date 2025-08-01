import React from "react"
import CodeEditor from "./CodeEditor"

const TYPE_DEFS_START = `
declare function useQuery<Query extends LightningDB.TopLevelQueries>(query: SelectSubset<
    Query,
    LightningDB.TopLevelQueries,
    LightningDB.AliasQueries
  >): void
declare function useMutation(mutation: LightningDB.MutationInput | LightningDB.MutationInput[]): void

type SelectSubset<Query, TopLevelQueries, AliasQueries> = {
  [key in keyof Query]: key extends keyof TopLevelQueries
    ? Query[key]
    : key extends string
      ? Query[key] extends AliasQueries
        ? Query[key]
        : never
      : never
}

// cause typescript not to expand types and preserve names
type NoExpand<T> = T extends unknown ? T : never

// this type assumes the passed object is entirely optional
type AtLeast<O extends object, K extends string> = NoExpand<
  O extends unknown
    ?
        | (K extends keyof O ? { [P in K]: O[P] } & O : O)
        | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
    : never
>

type QueryMode = "default" | "insensitive"

type StringFilter = {
  equals?: string
  in?: string[]
  notIn?: string[]
  lt?: string
  lte?: string
  gt?: string
  gte?: string
  contains?: string
  startsWith?: string
  endsWith?: string
  mode?: QueryMode
  not?: NestedStringFilter | string
}

type NestedStringFilter = {
  equals?: string
  in?: string[]
  notIn?: string[]
  lt?: string
  lte?: string
  gt?: string
  gte?: string
  contains?: string
  startsWith?: string
  endsWith?: string
  not?: NestedStringFilter | string
}

type StringNullableFilter = {
  equals?: string | null
  in?: string[] | null
  notIn?: string[] | null
  lt?: string | null
  lte?: string | null
  gt?: string | null
  gte?: string | null
  contains?: string | null
  startsWith?: string | null
  endsWith?: string | null
  mode?: QueryMode
  not?: NestedStringNullableFilter | string | null
}

type NestedStringNullableFilter = {
  equals?: string | null
  in?: string[] | null
  notIn?: string[] | null
  lt?: string | null
  lte?: string | null
  gt?: string | null
  gte?: string | null
  contains?: string | null
  startsWith?: string | null
  endsWith?: string | null
  mode?: QueryMode
  not?: NestedStringNullableFilter | string | null
}

type StringNullableListFilter = {
  equals?: string[] | null
  has?: string | null
  hasEvery?: string[] | null
  hasSome?: string[] | null
  isEmpty?: boolean
}

type IntFilter = {
  equals?: number
  in?: number[]
  notIn?: number[]
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  not?: NestedIntFilter | number
}

type NestedIntFilter = {
  equals?: number
  in?: number[]
  notIn?: number[]
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  not?: NestedIntFilter | number
}

type DateTimeFilter = {
  equals?: Date | string
  in?: Date[] | string[]
  notIn?: Date[] | string[]
  lt?: Date | string
  lte?: Date | string
  gt?: Date | string
  gte?: Date | string
  not?: NestedDateTimeFilter | Date | string
}

type NestedDateTimeFilter = {
  equals?: Date | string
  in?: Date[] | string[]
  notIn?: Date[] | string[]
}

type BoolFilter = {
  equals?: boolean
  not?: NestedBoolFilter | boolean
}

type NestedBoolFilter = {
  equals?: boolean
  not?: NestedBoolFilter | boolean
}

type IntNullableFilter = {
  equals?: number | null
  in?: number[] | null
  notIn?: number[] | null
  lt?: number | null
  lte?: number | null
  gt?: number | null
  gte?: number | null
  not?: NestedIntNullableFilter | number | null
}

type NestedIntNullableFilter = {
  equals?: number | null
  in?: number[] | null
  notIn?: number[] | null
  lt?: number | null
  lte?: number | null
  gt?: number | null
  gte?: number | null
  not?: NestedIntNullableFilter | number | null
}

type SortOrder = "asc" | "desc"

type SortOrderInput = {
  sort: SortOrder
  nulls?: NullsOrder
}

type NullsOrder = "first" | "last"

type SomeFilter = {
  some?: Record<string, any>
}

type EveryFilter = {
  every?: Record<string, any>
}

type NoneFilter = {
  none?: Record<string, any>
}

type Includes = Record<
  string,
  Record<
    string,
    {
      type: "oneToMany" | "manyToOne"
      model: string
      field: string
    }
  >
>

type AliasQuery<Query, Alias extends string> = Query & {
  table: Alias
}

type ExclusiveOneOf<T> = {
  [K in keyof T]: {
    [P in K]: T[P]
  } & {
    [P in Exclude<keyof T, K>]?: never
  }
}[keyof T]
`

type PlaygroundEditorProps = {
  types: string
  value: string
  onChange: (value: string) => void
}

const PlaygroundEditor: React.FC<PlaygroundEditorProps> = ({
  types,
  value,
  onChange,
}) => {
  const typeDefs =
    TYPE_DEFS_START +
    types
      .replace(
        /import\s+(type\s+)?{[^}]*}\s+from\s+["'][^"']+["']\s*;?\s*/gs,
        "",
      )
      .replace(/export\s+/g, "")
      .replace("type TopLevelQueries", "export type TopLevelQueries")
      .replace("type AliasQueries", "export type AliasQueries")
      .replace("type MutationInput", "export type MutationInput")

  return <CodeEditor value={value} onChange={onChange} typeDefs={typeDefs} />
}

export default PlaygroundEditor
