import { BuiltinType } from "@zenstackhq/sdk/ast"
import { Field } from "./modelParser"

export const fieldToZod = (
  field: Field,
  params?: { optional?: boolean; nullable?: boolean; filters?: boolean },
): string =>
  field.array && params?.filters
    ? `${field.name}: StringNullableListFilter.optional(),`
    : `${field.name}: ${fieldToZodType(field, params?.filters)}${
        params?.optional ? ".optional()" : ""
      }${params?.nullable || field.optional ? ".nullable()" : ""},`

const fieldToZodType = (field: Field, filters?: boolean): string => {
  if (filters) return fieldToFilterType(field)

  if (field.array) return `z.array(${fieldTypeToZodType(field.type)})`

  return fieldTypeToZodType(field.type)
}

const fieldTypeToZodType = (type: BuiltinType | undefined) => {
  if (type === "Int" || type === "Float") return "z.number()"
  if (type === "Boolean") return "z.boolean()"
  if (type === "DateTime") return "z.coerce.date()"
  if (type === "Json") return "z.any()"

  return "z.string()"
}

const fieldToFilterType = (field: Field): string => {
  if (field.type === "Int" || field.type === "Float")
    return `z.union([z.number(), Int${field.optional ? "Nullable" : ""}Filter])`
  if (field.type === "Boolean")
    return `z.union([z.boolean(), Bool${
      field.optional ? "Nullable" : ""
    }Filter])`
  if (field.type === "DateTime")
    return `z.union([z.coerce.date(), DateTime${
      field.optional ? "Nullable" : ""
    }Filter])`
  return `z.union([z.string(), String${
    field.optional ? "Nullable" : ""
  }Filter])`
}

export const filterIdFields = (field: Field): boolean =>
  field.id || field.unique
