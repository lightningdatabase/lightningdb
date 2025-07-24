import http from "http"
import { WebSocketServer } from "ws"
import generateHandler from "./handler"
import { AuthHandler } from "@lightningdb/auth-base"
import setupReplication from "./replication"
import { SetupOptions } from "./setup"
import "./types"

export const setupLightningDB = (
  server: http.Server,
  options?: SetupOptions,
) => {
  const wss = new WebSocketServer({ noServer: true })

  server.on("upgrade", async (req, socket, header) => {
    const auth = await options?.authHandler?.onUpgrade(req, socket)

    wss.handleUpgrade(req, socket, header, ws => {
      ws.auth = auth
      wss.emit("connection", ws, req)
    })
  })

  const handler = generateHandler(options)

  wss.on("connection", handler)

  setupReplication(options)
}

export type { AuthHandler }
