import { PrismaClient } from "@prisma/client"
import http from "http"
import internal from "node:stream"

export abstract class AuthHandler<
  AuthResult = any,
  User extends Record<string, unknown> = {},
> {
  abstract onUpgrade(
    req: http.IncomingMessage,
    socket: internal.Duplex,
  ): Promise<AuthResult>
  abstract onMessage(
    input: AuthResult,
    client: PrismaClient,
  ): Promise<User | null>
}
