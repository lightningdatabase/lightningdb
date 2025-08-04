import { AuthHandler } from "@lightningdb/auth-base"
import { PrismaClient } from "@prisma/client"
import http from "http"
import internal from "node:stream"

type User = {
  ip: string | null
}

class IpAuthHandler extends AuthHandler<User> {
  constructor() {
    super()

    console.log("IpAuthHandler initialized")
  }

  async onUpgrade(req: http.IncomingMessage, socket: internal.Duplex) {
    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
      req.socket.remoteAddress ||
      null

    return { ip }
  }

  async onMessage(input: User | null) {
    return input
  }
}

export { IpAuthHandler }
