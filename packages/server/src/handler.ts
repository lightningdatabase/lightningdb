import { z } from "zod"
import WebSocket from "ws"
import { lightningSchema } from "./schema"
import { recordsToIds } from "./replication/handler"
import runMutations from "./mutations"
import runQueries from "./queries"
import { clientStore, ClientInfo } from "./clientStore"
import prisma from "./client"
import { SetupOptions } from "./setup"
import { enhance } from "@zenstackhq/runtime"
import { User } from "./websocketTypes"

const basicSchema = z.object({
  queryId: z.number().optional(),
})

const generateHandler =
  (options: SetupOptions | undefined) => (ws: WebSocket) => {
    const clientInfo: ClientInfo = {
      socket: ws,
      queries: [],
      user: null,
    }
    clientStore.add(clientInfo)

    ws.on("close", () => {
      clientStore.delete(clientInfo)
    })

    ws.on("message", async message => {
      const user: User = options?.authHandler
        ? await options.authHandler.onMessage(ws.auth, prisma)
        : null

      clientInfo.user = user

      const enhancedPrisma = enhance(prisma, { user })

      const messageString = JSON.parse(message.toString())

      const basicResult = basicSchema.safeParse(messageString)

      if (!basicResult.success) {
        console.log("BasicResult failure")
        ws.send(JSON.stringify({ error: basicResult.error.errors }))
        return
      }

      const queryId = basicResult.data.queryId

      try {
        const result = lightningSchema.safeParse(messageString)

        if (!result.success) {
          console.log("Result failure")
          ws.send(JSON.stringify({ error: result.error.errors, queryId }))
          return
        }

        if ("queries" in result.data) {
          const queries = result.data.queries!

          const queryRes = await runQueries(queries, clientInfo, enhancedPrisma)

          ws.send(
            JSON.stringify({ data: queryRes, queryId: result.data?.queryId }),
          )
        }

        if ("mutations" in result.data) {
          const mutations = result.data.mutations!

          const { res, data, deletes } = await runMutations(
            mutations,
            enhancedPrisma,
          )

          ws.send(
            JSON.stringify({
              queryId: result.data?.queryId,
              res,
              data,
              deletes: recordsToIds(deletes),
            }),
          )
        }
      } catch (error) {
        if (queryId !== undefined) {
          ws.send(
            JSON.stringify({
              error: String(error),
              queryId,
              trace: (error as Error).stack,
            }),
          )
        } else {
          throw error
        }
      }
    })
  }

export default generateHandler
