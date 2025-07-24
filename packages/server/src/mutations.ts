import { z } from "zod"
import { lightningSchema } from "./schema"
import { PrismaClient } from "@prisma/client"
import singleModelName from "./helpers/singleModelName"

export type Mutations = NonNullable<
  z.infer<typeof lightningSchema>["mutations"]
>

const runMutations = async (mutations: Mutations, prisma: PrismaClient) => {
  const res: (
    | {
        count: number
      }
    | undefined
  )[] = []
  const data: Record<string, Record<string, any>[]> = {}
  const deletes: Record<string, Record<string, any>[]> = {}

  await prisma.$transaction(async (tx: any) => {
    for (const [index, mutation] of mutations.entries()) {
      for (const [modelName, mutationParams] of Object.entries(mutation)) {
        const sModelName = singleModelName(modelName)

        if (!(sModelName in prisma))
          throw new Error(`Model ${sModelName} not found`)

        // Type assertion to access prisma models dynamically
        const model = tx[sModelName]

        if ("create" in mutationParams) {
          const res = await model.create(mutationParams.create)

          if (!data[modelName]) data[modelName] = []
          data[modelName].push(res)
        }

        if ("createMany" in mutationParams) {
          res[index] = await model.createMany(mutationParams.createMany)
        }

        if ("update" in mutationParams) {
          const res = await model.update(mutationParams.update)

          if (!data[modelName]) data[modelName] = []
          data[modelName].push(res)
        }

        if ("updateMany" in mutationParams) {
          const res = await model.updateManyAndReturn(mutationParams.updateMany)

          if (!data[modelName]) data[modelName] = []
          data[modelName].push(...res)
        }

        if ("upsert" in mutationParams) {
          const res = await model.upsert(mutationParams.upsert)

          if (!data[modelName]) data[modelName] = []
          data[modelName].push(res)
        }

        if ("delete" in mutationParams) {
          const res = await model.delete(mutationParams.delete)

          if (!deletes[modelName]) deletes[modelName] = []

          deletes[modelName].push(res)
        }

        if ("deleteMany" in mutationParams) {
          res[index] = await model.deleteMany(mutationParams.deleteMany)
        }
      }
    }
  })

  return { res, data, deletes }
}

export default runMutations
