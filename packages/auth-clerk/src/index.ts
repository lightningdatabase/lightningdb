import { ClerkClient, createClerkClient } from "@clerk/backend"
import { AuthHandler } from "@lightningdb/auth-base"
import { PrismaClient } from "@prisma/client"
import http from "http"
import internal from "node:stream"
import {
  SignedInAuthObject,
  SignedOutAuthObject,
} from "@clerk/backend/internal"
import { enhance } from "@zenstackhq/runtime"

export type ClerkAuthOptions<U extends object = object> = {
  secretKey?: string | undefined
  publishableKey?: string | undefined
  authToUser?: (
    auth: SignedInAuthObject,
    client: PrismaClient,
  ) => Promise<U | null>
}

class ClerkAuthHandler<User extends object = object> extends AuthHandler<
  SignedInAuthObject | SignedOutAuthObject | null
> {
  private clerkClient: ClerkClient

  constructor(private options?: ClerkAuthOptions<User>) {
    super()

    const secretKey = options?.secretKey || process.env.CLERK_SECRET_KEY
    const publishableKey =
      options?.publishableKey || process.env.CLERK_PUBLISHABLE_KEY

    if (!secretKey || !publishableKey)
      throw new Error("secretKey and publishableKey must be set")

    this.clerkClient = createClerkClient({
      secretKey,
      publishableKey,
    })

    console.log("ClerkAuthHandler initialized")
  }

  async onUpgrade(req: http.IncomingMessage, socket: internal.Duplex) {
    const auth = await this.clerkClient.authenticateRequest(
      convertIncomingMessageToRequest(req),
    )

    if (auth === undefined) return null

    return auth.toAuth()
  }

  async onMessage(
    input: SignedInAuthObject | SignedOutAuthObject | null,
    client: PrismaClient,
  ) {
    if (!input || !input.userId) return null

    if (this.options?.authToUser)
      return await this.options.authToUser(input, client)

    return { id: input.userId }
  }
}

export { ClerkAuthHandler }

function convertIncomingMessageToRequest(req: http.IncomingMessage) {
  const { method } = req
  const origin = `http://${req.headers.host ?? "localhost"}`
  const fullUrl = new URL(req.url!, origin)

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || Array.isArray(value)) {
      continue
    }
    headers.set(key, value)
  }

  return new Request(fullUrl, {
    method,
    headers,
  })
}
