import { z } from "zod"

// export type NestedIntFilter = {
//   equals?: number
//   in?: number[]
//   notIn?: number[]
//   lt?: number
//   lte?: number
//   gt?: number
//   gte?: number
//   not?: NestedIntFilter | number
// }

// const NestedIntFilter = (z.ZodType<NestedIntFilter> = z.lazy(() =>
//   z.object({
//     equals: z.number().optional(),
//     in: z.array(z.number()).optional(),
//     notIn: z.array(z.number()).optional(),
//     lt: z.number().optional(),
//     lte: z.number().optional(),
//     gt: z.number().optional(),
//     gte: z.number().optional(),
//     not: z.union([z.number(), NestedIntFilter]).optional(),
//   }),
// ))

export const IntFilter = z.object({
  equals: z.number().optional(),
  in: z.array(z.number()).optional(),
  notIn: z.array(z.number()).optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  // not: z.union([z.number(), NestedIntFilter]).optional(),
})

export type IntFilter = z.infer<typeof IntFilter>

export const IntNullableFilter = z.object({
  equals: z.number().optional(),
  in: z.array(z.number()).optional(),
  notIn: z.array(z.number()).optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  // not: z.union([z.number(), IntNullableFilter]).optional(),
})

export type IntNullableFilter = z.infer<typeof IntNullableFilter>

export const StringFilter = z.object({
  equals: z.string().optional(),
  in: z.array(z.string()).optional(),
  notIn: z.array(z.string()).optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.enum(["default", "insensitive"]).optional(),
  // not: z.union([z.string(), NestedStringFilter]).optional(),
})

export type StringFilter = z.infer<typeof StringFilter>

export const StringNullableFilter = z.object({
  equals: z.string().optional(),
  in: z.array(z.string()).optional(),
  notIn: z.array(z.string()).optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.enum(["default", "insensitive"]).optional(),
  // not: z.union([z.string(), NestedStringNullableFilter]).optional(),
})

export type StringNullableFilter = z.infer<typeof StringNullableFilter>

// export type NestedStringFilter = {
//   equals?: string
//   in?: string[]
//   notIn?: string[]
//   lt?: string
//   lte?: string
//   gt?: string
//   gte?: string
//   contains?: string
//   startsWith?: string
//   endsWith?: string
//   not?: NestedStringFilter | string
// }

// export type NestedStringNullableFilter = {
//   equals?: string | null
//   in?: string[] | null
//   notIn?: string[] | null
//   lt?: string
//   lte?: string
//   gt?: string
//   gte?: string
//   contains?: string
//   startsWith?: string
//   endsWith?: string
//   not?: NestedStringNullableFilter | string | null
// }

export const StringNullableListFilter = z.object({
  equals: z.array(z.string()).optional(),
  has: z.string().optional(),
  hasEvery: z.array(z.string()).optional(),
  hasSome: z.array(z.string()).optional(),
  isEmpty: z.boolean().optional(),
})

export type StringNullableListFilter = z.infer<typeof StringNullableListFilter>

export const DateTimeFilter = z.object({
  equals: z.coerce.date().optional(),
  in: z.array(z.coerce.date()).optional(),
  notIn: z.array(z.coerce.date()).optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  // not: z.union([z.coerce.date(), DateTimeFilter]).optional(),
})

export type DateTimeFilter = z.infer<typeof DateTimeFilter>

export const BoolFilter = z.object({
  equals: z.boolean().optional(),
  // not: z.union([z.boolean(), BoolFilter]).optional(),
})

export type BoolFilter = z.infer<typeof BoolFilter>

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

export const QueryMode = {
  default: "default",
  insensitive: "insensitive",
}

export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]

export const SortOrder = z.enum(["asc", "desc"]).optional()

export type SomeFilter = {
  some?: Record<string, any>
}

export type EveryFilter = {
  every?: Record<string, any>
}

export type NoneFilter = {
  none?: Record<string, any>
}
