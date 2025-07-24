import { z } from "zod"
import { Includes } from "./types"
const ext = process.env.NODE_ENV === "production" ? "js" : "ts"
const schemaModule = await import(`${process.cwd()}/lightningdb/schema.${ext}`)

type QueryType = {
  table: string
  where?: Record<string, object | number | string | boolean | null>
  include?: Record<string, any>
  take?: number
  skip?: number
  orderBy?: Record<string, "asc" | "desc">
}

type Schema = {
  lightningSchema: z.ZodType<{
    queries?: QueryType[]
    mutations?: Array<
      Record<
        string,
        {
          create?: { data: Record<string, any> }
          createMany?: { data: Record<string, any>[] }
          update?: {
            where: {
              id?: number | string
            }
            data: Record<string, any>
          }
          updateMany?: {
            where?: Record<string, object | number | string | boolean | null>
            data: Record<string, any>
            limit?: number
          }
          upsert?: {
            where: {
              id?: number | string
            }
            create: Record<string, any>
            update: Record<string, any>
          }
          delete?: {
            where: {
              id?: number | string
            }
          }
          deleteMany?: {
            where?: Record<string, object | number | string | boolean | null>
            limit?: number
          }
        }
      >
    >
    queryId?: number
  }>
  tablesMap: Record<string, string>
  includesMap: Includes
}

export const { lightningSchema, tablesMap, includesMap } =
  schemaModule as Schema
