import { AuthHandler } from "@lightningdb/auth-base"

export type User = Record<string, unknown> | null

declare module "ws" {
  interface WebSocket {
    auth: Awaited<ReturnType<AuthHandler["onUpgrade"]>>
  }
}
