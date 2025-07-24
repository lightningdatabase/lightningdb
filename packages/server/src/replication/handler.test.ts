import { vi } from "vitest"
import { ClientInfo } from "../clientStore"
import { prismaMock } from "../singleton"
import { generateClientUpdates, GroupedChanges } from "./handler.js"
import WebSocket from "ws"
import { PrismaClient } from "@prisma/client"

const socket = {
  readyState: WebSocket.OPEN,
  send: vi.fn(),
} as unknown as WebSocket

vi.mock("@zenstackhq/runtime", () => ({
  enhance: (prisma: PrismaClient) => prisma,
}))

// Mock the schema module
vi.mock("../schema", () => ({
  tablesMap: {
    users: "users",
    posts: "posts",
  },
  includesMap: {},
}))

describe("generateClientUpdates", () => {
  test("no updates", async () => {
    const groupedChanges: GroupedChanges = {}
    const client: ClientInfo = {
      socket,
      queries: [],
      user: null,
    }
    const { data, deletes } = await generateClientUpdates(
      client,
      groupedChanges,
      prismaMock,
    )

    expect(data).toEqual({})
    expect(deletes).toEqual({})
  })

  test("basic update no queries", async () => {
    const groupedChanges: GroupedChanges = {
      users: [
        {
          kind: "update",
          table: "users",
          schema: "public",
          columnnames: ["name"],
          columnvalues: ["abc11"],
          columntypes: ["String"],
          oldkeys: {
            keynames: ["id"],
            keyvalues: [1],
            keytypes: ["Int"],
          },
        },
      ],
    }
    const client: ClientInfo = {
      socket,
      queries: [],
      user: null,
    }
    const { data, deletes } = await generateClientUpdates(
      client,
      groupedChanges,
      prismaMock,
    )

    expect(data).toEqual({})
    expect(deletes).toEqual({})
  })

  test("basic update matching query", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      { id: 1, name: "abc11", email: "abc@example.com" },
    ])

    const groupedChanges: GroupedChanges = {
      users: [
        {
          kind: "update",
          table: "users",
          schema: "public",
          columnnames: ["id", "name", "email"],
          columnvalues: [1, "abc11", "abc@example.com"],
          columntypes: ["Int", "String", "String"],
          oldkeys: {
            keynames: ["id"],
            keyvalues: [1],
            keytypes: ["Int"],
          },
        },
      ],
    }
    const client: ClientInfo = {
      socket,
      queries: [
        {
          table: "users",
          query: {
            where: {
              id: 1,
            },
          },
          includes: [],
        },
      ],
      user: null,
    }
    const { data, deletes } = await generateClientUpdates(
      client,
      groupedChanges,
      prismaMock,
    )

    expect(data).toEqual({
      users: [{ id: 1, name: "abc11", email: "abc@example.com" }],
    })
    expect(deletes).toEqual({})
  })

  test("basic update old values matching query", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      { id: 1, name: "abc12", email: "abc@example.com" },
    ])

    const groupedChanges: GroupedChanges = {
      users: [
        {
          kind: "update",
          table: "users",
          schema: "public",
          columnnames: ["id", "name", "email"],
          columnvalues: [1, "abc12", "abc@example.com"],
          columntypes: ["Int", "String", "String"],
          oldkeys: {
            keynames: ["id", "name", "email"],
            keyvalues: [1, "abc11", "abc@example.com"],
            keytypes: ["Int", "String", "String"],
          },
        },
      ],
    }
    const client: ClientInfo = {
      socket,
      queries: [
        {
          table: "users",
          query: {
            where: {
              id: 1,
            },
          },
          includes: [],
        },
      ],
      user: null,
    }
    const { data, deletes } = await generateClientUpdates(
      client,
      groupedChanges,
      prismaMock,
    )

    expect(data).toEqual({
      users: [{ id: 1, name: "abc12", email: "abc@example.com" }],
    })
    expect(deletes).toEqual({})
  })

  test("update old values matching query new values missing from enhanced prisma", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([])

    const groupedChanges: GroupedChanges = {
      users: [
        {
          kind: "update",
          table: "users",
          schema: "public",
          columnnames: ["id", "name", "email"],
          columnvalues: [1, "abc11", "abc@example.com"],
          columntypes: ["Int", "String", "String"],
          oldkeys: {
            keynames: ["id", "name", "email"],
            keyvalues: [1, "abc11", "abc@example.com"],
            keytypes: ["Int", "String", "String"],
          },
        },
      ],
    }
    const client: ClientInfo = {
      socket,
      queries: [
        {
          table: "users",
          query: {
            where: {
              id: 1,
            },
          },
          includes: [],
        },
      ],
      user: null,
    }
    const { data, deletes } = await generateClientUpdates(
      client,
      groupedChanges,
      prismaMock,
    )

    expect(data).toEqual({})
    expect(deletes).toEqual({
      users: [
        { id: 1, name: "abc11", email: "abc@example.com" }, // Will be reduced to ids later
      ],
    })
  })

  test("basic delete no queries", async () => {
    const groupedChanges: GroupedChanges = {
      users: [
        {
          kind: "delete",
          table: "users",
          schema: "public",
          oldkeys: {
            keynames: ["id"],
            keyvalues: [1],
            keytypes: ["Int"],
          },
        },
      ],
    }
    const client: ClientInfo = {
      socket,
      queries: [],
      user: null,
    }

    const { data, deletes } = await generateClientUpdates(
      client,
      groupedChanges,
      prismaMock,
    )

    expect(data).toEqual({})
    expect(deletes).toEqual({})
  })

  test("basic delete matching query", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([])

    const groupedChanges: GroupedChanges = {
      users: [
        {
          kind: "delete",
          table: "users",
          schema: "public",
          oldkeys: {
            keynames: ["id"],
            keyvalues: [1],
            keytypes: ["Int"],
          },
        },
      ],
    }
    const client: ClientInfo = {
      socket,
      queries: [
        {
          table: "users",
          query: {
            where: {
              id: 1,
            },
          },
          includes: [],
        },
      ],
      user: null,
    }
    const { data, deletes } = await generateClientUpdates(
      client,
      groupedChanges,
      prismaMock,
    )

    expect(data).toEqual({})
    expect(deletes).toEqual({
      users: [{ id: 1 }],
    })
  })

  test("delete matching query with new data", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      { id: 2, name: "xyz", email: "abc@example.com" },
    ])

    const groupedChanges: GroupedChanges = {
      users: [
        {
          kind: "delete",
          table: "users",
          schema: "public",
          oldkeys: {
            keynames: ["id"],
            keyvalues: [1],
            keytypes: ["Int"],
          },
        },
      ],
    }
    const client: ClientInfo = {
      socket,
      queries: [
        {
          table: "users",
          query: {
            take: 1,
          },
          includes: [],
        },
      ],
      user: null,
    }
    const { data, deletes } = await generateClientUpdates(
      client,
      groupedChanges,
      prismaMock,
    )

    expect(data).toEqual({
      users: [{ id: 2, name: "xyz", email: "abc@example.com" }],
    })
    expect(deletes).toEqual({
      users: [{ id: 1 }],
    })
  })

  test("update no longer returning", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([])

    const groupedChanges: GroupedChanges = {
      users: [
        {
          kind: "update",
          table: "users",
          schema: "public",
          columnnames: ["id", "name", "email"],
          columnvalues: [1, "xyz", "xyz"],
          columntypes: ["Int", "String", "String"],
          oldkeys: {
            keynames: ["id", "name", "email"],
            keyvalues: [1, "abc11", "abc@example.com"],
            keytypes: ["Int", "String", "String"],
          },
        },
      ],
    }
    const client: ClientInfo = {
      socket,
      queries: [
        {
          table: "users",
          query: {
            where: {
              id: 1,
            },
          },
          includes: [],
        },
      ],
      user: null,
    }
    const { data, deletes } = await generateClientUpdates(
      client,
      groupedChanges,
      prismaMock,
    )

    expect(data).toEqual({})
    expect(deletes).toEqual({
      users: [
        {
          id: 1,
          name: "xyz",
          email: "xyz",
        },
      ],
    })
  })

  test("complicate multiple queries", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      { id: 1, name: "abc11", email: "abc@example.com" },
    ])
    prismaMock.post.findMany.mockResolvedValueOnce([
      {
        id: 1,
        title: "xyz",
        content: "xyz",
        authorId: 1,
      },
    ])

    const groupedChanges: GroupedChanges = {
      posts: [
        {
          kind: "update",
          table: "posts",
          schema: "public",
          columnnames: ["id", "title", "content", "authorId"],
          columnvalues: [1, "xyz", "xyz", 1],
          columntypes: ["Int", "String", "String", "Int"],
          oldkeys: {
            keynames: ["id", "title", "content", "authorId"],
            keyvalues: [1, "abc11", "abc@example.com", 1],
            keytypes: ["Int", "String", "String", "Int"],
          },
        },
      ],
    }
    const client: ClientInfo = {
      socket,
      queries: [
        {
          table: "users",
          query: {
            where: {
              id: 1,
            },
          },
          includes: [],
        },
        {
          table: "posts",
          query: {
            where: {
              authorId: {
                in: [1],
              },
            },
          },
          includes: [],
        },
      ],
      user: null,
    }

    const { data, deletes } = await generateClientUpdates(
      client,
      groupedChanges,
      prismaMock,
    )

    expect(data).toEqual({
      posts: [
        {
          id: 1,
          title: "xyz",
          content: "xyz",
          authorId: 1,
        },
      ],
    })
    expect(deletes).toEqual({})
  })

  test("update not matching query", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      { id: 1, name: "abc11", email: "abc@example.com" },
    ])

    const groupedChanges: GroupedChanges = {
      users: [
        {
          kind: "update",
          table: "users",
          schema: "public",
          columnnames: ["id", "name", "email"],
          columnvalues: [2, "abc11", "abc@example.com"],
          columntypes: ["Int", "String", "String"],
          oldkeys: {
            keynames: ["id"],
            keyvalues: [2],
            keytypes: ["Int"],
          },
        },
      ],
    }
    const client: ClientInfo = {
      socket,
      queries: [
        {
          table: "users",
          query: {
            where: {
              id: 1,
            },
          },
          includes: [],
        },
      ],
      user: null,
    }
    const { data, deletes } = await generateClientUpdates(
      client,
      groupedChanges,
      prismaMock,
    )

    expect(data).toEqual({})
    expect(deletes).toEqual({})
  })
})
