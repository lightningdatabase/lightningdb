import WebSocket from "ws"
import { lightningSchema } from "./schema"
import { z } from "zod"
import { User } from "./websocketTypes"

export type Queries = NonNullable<z.infer<typeof lightningSchema>["queries"]>
export type Query = Queries[number]
export type QueryParams = Omit<Query, "table">

// Define the structure for storing client and query information
export type StoredQuery = {
  table: string
  query: QueryParams
  includes: Includes
}

export type Include = {
  table: string
  query: Query
}

export type Includes = Include[]

export type ClientInfo = {
  socket: WebSocket
  queries: StoredQuery[]
  user: User
}

// Single set to store all client information
export const clientStore = new Set<ClientInfo>()
