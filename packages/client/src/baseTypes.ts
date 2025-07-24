// cause typescript not to expand types and preserve names
export type NoExpand<T> = T extends unknown ? T : never

// this type assumes the passed object is entirely optional
export type AtLeast<O extends object, K extends string> = NoExpand<
  O extends unknown
    ?
        | (K extends keyof O ? { [P in K]: O[P] } & O : O)
        | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
    : never
>

export type QueryMode = "default" | "insensitive"

export type StringFilter = {
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

export type StringNullableFilter = {
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

export type IntFilter = {
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

export type DateTimeFilter = {
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

export type BoolFilter = {
  equals?: boolean
  not?: NestedBoolFilter | boolean
}

type NestedBoolFilter = {
  equals?: boolean
  not?: NestedBoolFilter | boolean
}

export type IntNullableFilter = {
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

export type SortOrder = "asc" | "desc"

export type SortOrderInput = {
  sort: SortOrder
  nulls?: NullsOrder
}

export type NullsOrder = "first" | "last"

export type SomeFilter = {
  some?: Record<string, any>
}

export type EveryFilter = {
  every?: Record<string, any>
}

export type NoneFilter = {
  none?: Record<string, any>
}

export type Includes = Record<
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

export type AliasQuery<Query, Alias extends string> = Query & {
  table: Alias
}

export type ExclusiveOneOf<T> = {
  [K in keyof T]: {
    [P in K]: T[P]
  } & {
    [P in Exclude<keyof T, K>]?: never
  }
}[keyof T]
