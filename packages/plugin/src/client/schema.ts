import { BuiltinType } from "@zenstackhq/sdk/ast"
import { Field, Model, Table } from "../modelParser"
import { fieldToZod, filterIdFields } from "../shared"

const relationToZod = (field: Field) => {
  if (field.relation && field.array)
    return `${field.name}: z.array(${field.relation.relationTable.name}Model).optional(),`

  if (field.relation)
    return `${field.name}: ${
      field.relation.relationTable.name
    }Model.optional()${field.optional ? ".nullable()" : ""},`

  // Handle non-relation fields
  return fieldToZod(field)
}

const fieldToType = (
  field: Field,
  params?: {
    nullable?: boolean
    optional?: boolean
    filters?: boolean
  },
) =>
  field.array && params?.filters
    ? `${field.name}?: StringNullableListFilter`
    : `${field.name}${params?.optional ? "?" : ""}: ${
        params?.filters ? fieldToFilterType(field) : ""
      }${fieldToTypeType(field)}${
        params?.nullable || field.optional ? " | null" : ""
      }`

const fieldToFilterType = (field: Field) => {
  if (field.type === "Int")
    return `Int${field.optional ? "Nullable" : ""}Filter | `
  if (field.type === "String")
    return `String${field.optional ? "Nullable" : ""}Filter | `
  if (field.type === "Boolean")
    return `Bool${field.optional ? "Nullable" : ""}Filter | `
  if (field.type === "DateTime")
    return `DateTime${field.optional ? "Nullable" : ""}Filter | `
  return ""
}

const fieldToTypeType = (field: Field) => {
  if (field.array) return typeToTypeType(field.type) + "[]"

  return typeToTypeType(field.type)
}

const typeToTypeType = (type: BuiltinType | undefined) => {
  if (type === "Int" || type === "Float") return "number"
  if (type === "Boolean") return "boolean"
  if (type === "DateTime") return "Date"
  if (type === "Json") return "any"

  return "string"
}

const schemaToArgs = (tables: Table[]): string =>
  tables
    .map(table =>
      table.fields
        .filter(field => field.relation)
        .map(
          field => `type ${table.name}$${field.name}Args = {
    where?: ${field.relation?.relationTable.name}WhereInput
    include?: ${field.relation?.relationTable.name}Include${
      field.array ? "\n    take?: number\n    skip?: number" : ""
    }
  }`,
        )
        .join("\n\n  "),
    )
    .join("\n\n  ")

const generateWhereInput = (table: Table): string => {
  const sections: string[] = []

  sections.push(
    ...table.fields
      .filter(field => !field.relation)
      .map(field => fieldToType(field, { optional: true, filters: true })),
  )

  sections.push(
    ...table.fields
      .filter(field => field.relation && field.array)
      .map(
        field =>
          `${field.name}?: ${field.relation?.relationTable.name}ListRelationFilter`,
      ),
  )

  sections.push(
    ...table.fields
      .filter(field => field.relation && !field.array)
      .map(
        field =>
          `${field.name}?: ${field.relation?.relationTable.name}WhereInput${
            field.optional ? " | null" : ""
          }`,
      ),
  )

  return `type ${table.name}WhereInput = {
    ${sections.join("\n    ")}
  }`
}

export const generateClientSchema = (dataModel: Model) => {
  const schema = generateClientLightningSchema(dataModel.tables)

  const clientSchema = `////////////////////////////////////////////////////////////////////////////////////////////////////
// DO NOT MODIFY THIS FILE                                                                        //
// This file is automatically generated by LightningDB Plugin and should not be manually updated. //
////////////////////////////////////////////////////////////////////////////////////////////////////

import { z } from "zod"
import type {
  AliasQuery,
  AtLeast,
  BoolFilter,
  DateTimeFilter,
  IntFilter,
  IntNullableFilter,
  SortOrder,
  StringFilter,
  StringNullableFilter,
  StringNullableListFilter,
  Includes,
  ExclusiveOneOf,
} from "@lightningdb/client/baseTypes"

export namespace LightningDB {
  ${schema}

  export type TopLevelQueries = {
    ${dataModel.tables
      .map(table => `${table.pluralName}?: ${table.name}sQueryParams`)
      .join("\n    ")}
    ${dataModel.tables
      .map(table => `${table.name.toLowerCase()}?: ${table.name}sQueryParams`)
      .join("\n    ")}
  }

  export type AliasQueries =
    ${dataModel.tables
      .map(
        table =>
          `| AliasQuery<${table.name}sQueryParams, "${table.pluralName}">`,
      )
      .join("\n    ")}

  ${dataModel.tables
    .map(
      table => `type ${table.name}sQueryParams = {
    where?: ${table.name}WhereInput
    include?: ${table.name}Include
    take?: number
    skip?: number
    orderBy?: ${table.name}OrderBy
  }`,
    )
    .join("\n\n  ")}

  ${dataModel.tables.map(generateWhereInput).join("\n\n  ")}

  ${dataModel.tables
    .map(
      table => `// @ts-ignore TS6196
  type ${table.name}ListRelationFilter = {
    every?: ${table.name}WhereInput
    some?: ${table.name}WhereInput
    none?: ${table.name}WhereInput
  }`,
    )
    .join("\n\n  ")}

  ${dataModel.tables
    .map(
      table => `type ${table.name}Include = {
    ${table.fields
      .filter(field => field.relation)
      .map(field => `${field.name}?: boolean | ${table.name}$${field.name}Args`)
      .join("\n    ")}
  }`,
    )
    .join("\n\n  ")}

  ${dataModel.tables
    .map(
      table => `type ${table.name}OrderBy = {
    ${table.fields
      .filter(field => !field.relation)
      .map(field => `${field.name}?: SortOrder`)
      .join("\n    ")}
  }`,
    )
    .join("\n\n  ")}

  ${schemaToArgs(dataModel.tables)}

  export type Models = {
    ${dataModel.tables
      .map(table => `${table.pluralName}: $${table.name}Payload`)
      .join("\n    ")}
  }

  export type SingleModels = {
    ${dataModel.tables
      .map(table => `${table.name.toLowerCase()}?: $${table.name}Payload`)
      .join("\n    ")}
  }

  ${dataModel.tables
    .map(
      table => `type $${table.name}Payload = {
    name: "${table.name}"
    objects: {
      ${table.fields
        .filter(field => field.relation)
        .map(
          field =>
            `${field.name}: $${field.relation?.relationTable.name}Payload${
              field.array ? "[]" : ""
            }`,
        )
        .join("\n      ")}
    }
    scalars: {
      ${table.fields
        .filter(field => !field.relation && !field.omit)
        .map(field => fieldToType(field))
        .join("\n      ")}
    }
  }`,
    )
    .join("\n\n  ")}

  export type MutationInput = ExclusiveOneOf<{
    ${dataModel.tables
      .map(
        model => `${model.pluralName}: ExclusiveOneOf<${model.name}Mutation>`,
      )
      .join("\n    ")}
  }>

  ${dataModel.tables
    .map(
      model => `type ${model.name}Mutation = {
    create?: ${model.name}CreateArgs
    createMany?: ${model.name}CreateManyArgs
    update?: ${model.name}UpdateArgs
    updateMany?: ${model.name}UpdateManyArgs
    upsert?: ${model.name}UpsertArgs
    delete?: ${model.name}DeleteArgs
    deleteMany?: ${model.name}DeleteManyArgs
  }

  type ${model.name}CreateArgs = {
    data: {
      ${model.fields
        .filter(field => !field.relation)
        .map(field =>
          fieldToType(field, {
            optional: field.default || field.optional || field.array,
          }),
        )
        .join("\n      ")}
    }
  }

  type ${model.name}CreateManyArgs = {
    data: {
      ${model.fields
        .filter(field => !field.relation)
        .map(field =>
          fieldToType(field, {
            optional: field.default || field.optional || field.array,
          }),
        )
        .join("\n      ")}
    }[]
    skipDuplicates?: boolean
  }

  type ${model.name}UpdateArgs = {
    where: ${model.name}WhereUniqueInput
    data: {
      ${model.fields
        .filter(field => !field.relation)
        .map(field => fieldToType(field, { optional: true }))
        .join("\n      ")}
    }
  }

  type ${model.name}UpdateManyArgs = {
    where?: ${model.name}WhereInput
    data: {
      ${model.fields
        .filter(field => !field.relation)
        .map(field => fieldToType(field, { optional: true }))
        .join("\n      ")}
    }
    limit?: number
  }

  type ${model.name}UpsertArgs = {
    where: ${model.name}WhereUniqueInput
    create: {
      ${model.fields
        .filter(field => !field.relation)
        .map(field =>
          fieldToType(field, {
            optional: field.default || field.optional || field.array,
          }),
        )
        .join("\n      ")}
    }
    update: {
      ${model.fields
        .filter(field => !field.relation)
        .map(field => fieldToType(field, { optional: true }))
        .join("\n      ")}
    }
  }

  type ${model.name}DeleteArgs = {
    where: ${model.name}WhereUniqueInput
  }

  type ${model.name}DeleteManyArgs = {
    where?: ${model.name}WhereInput
  }

  type ${model.name}WhereUniqueInput = AtLeast<
    {
      ${model.fields
        .filter(filterIdFields)
        .map(field => fieldToType(field, { optional: true }))
        .join("\n      ")}
    },
    ${model.fields
      .filter(filterIdFields)
      .map(field => `"${field.name}"`)
      .join(" | ")}
  >`,
    )
    .join("\n\n  ")}

  export const includesMap: Includes = {
    ${dataModel.tables
      .map(
        table => `${table.pluralName}: {
      ${table.fields
        .filter(field => field.relation)
        .map(
          field => `${field.name}: {
        type: "${field.relation?.type}",
        model: "${field.relation?.relationTable.pluralName}",
        field: "${field.relation?.fields?.[0]}",
      },`,
        )
        .join("\n      ")}
    },`,
      )
      .join("\n    ")}
  }
}
`

  return clientSchema
}

const generateClientLightningSchema = (tables: Table[]): string =>
  `${tables
    .map(
      table => `const ${table.name}Model: z.ZodType<any> = z.lazy(() =>
    z.object({
      ${table.fields
        .filter(field => !field.omit)
        .map(field => relationToZod(field))
        .join("\n      ")}
    }),
  )`,
    )
    .join("\n\n  ")}

  export const lightningSchema = z.object({
    error: z.any().optional(),
    data: z
      .object({
        ${tables
          .map(
            table =>
              `${table.pluralName}: z.array(${table.name}Model).optional(),`,
          )
          .join("\n        ")}
      })
      .optional(),
    deletes: z
      .object({
        ${tables
          .map(
            table =>
              `${table.pluralName}: z.array(z.object({ id: z.number() })).optional(),`,
          )
          .join("\n        ")}
      })
      .optional(),
    queryId: z.number().optional(),
  })`
