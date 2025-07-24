import runQueries from "./queries"
import { prismaMock } from "./singleton"
import { WebSocket } from "ws"

vi.mock("./schema", () => ({
  includesMap: {
    users: {
      posts: {
        type: "oneToMany",
        model: "posts",
        field: "authorId",
      },
      profile: {
        type: "oneToOne",
        model: "profiles",
        field: "userId",
      },
    },
    posts: {
      author: {
        type: "manyToOne",
        model: "users",
        field: "authorId",
      },
      comments: {
        type: "oneToMany",
        model: "comments",
        field: "postId",
      },
    },
  },
}))

const mockClientInfo = {
  socket: {} as unknown as WebSocket,
  queries: [],
  user: null,
}

describe("runQueries", () => {
  test("basic", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      { id: 1, name: "John Doe", email: "john.doe@example.com" },
    ])

    const result = await runQueries(
      [
        {
          table: "users",
        },
      ],
      mockClientInfo,
      prismaMock,
    )

    expect(result).toEqual({
      users: [{ id: 1, name: "John Doe", email: "john.doe@example.com" }],
    })
  })

  test("empty", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([])

    const result = await runQueries(
      [
        {
          table: "users",
        },
      ],
      mockClientInfo,
      prismaMock,
    )

    expect(result).toEqual({
      users: [],
    })
  })

  test("include", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        posts: [
          {
            id: 1,
            title: "Post 1",
            content: "Content 1",
            authorId: 1,
          },
        ],
      },
    ])

    const result = await runQueries(
      [
        {
          table: "users",
          include: {
            posts: true,
          },
        },
      ],
      mockClientInfo,
      prismaMock,
    )

    expect(result).toEqual({
      users: [{ id: 1, name: "John Doe", email: "john.doe@example.com" }],
      posts: [{ id: 1, title: "Post 1", content: "Content 1", authorId: 1 }],
    })
  })

  test("multiple models", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      { id: 1, name: "John Doe", email: "john.doe@example.com" },
    ])
    prismaMock.post.findMany.mockResolvedValueOnce([
      { id: 1, title: "Post 1", content: "Content 1" },
    ])

    const result = await runQueries(
      [
        {
          table: "users",
        },
        {
          table: "posts",
        },
      ],
      mockClientInfo,
      prismaMock,
    )

    expect(result).toEqual({
      users: [
        {
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com",
        },
      ],
      posts: [{ id: 1, title: "Post 1", content: "Content 1" }],
    })
  })

  test("multiple models over lapping", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        posts: [
          {
            id: 1,
            title: "Post 1",
            content: "Content 1",
          },
        ],
      },
    ])
    prismaMock.post.findMany.mockResolvedValueOnce([
      { id: 1, title: "Post 1", content: "Content 1" },
    ])

    const result = await runQueries(
      [
        {
          table: "users",
          include: {
            posts: true,
          },
        },
        {
          table: "posts",
        },
      ],
      mockClientInfo,
      prismaMock,
    )

    expect(result).toEqual({
      users: [{ id: 1, name: "John Doe", email: "john.doe@example.com" }],
      posts: [{ id: 1, title: "Post 1", content: "Content 1" }],
    })
  })

  test("multiple models not over lapping", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        posts: [
          {
            id: 2,
            title: "Post 2",
            content: "Content 2",
          },
        ],
      },
    ])
    prismaMock.post.findMany.mockResolvedValueOnce([
      { id: 1, title: "Post 1", content: "Content 1" },
    ])

    const result = await runQueries(
      [
        {
          table: "users",
          include: {
            posts: true,
          },
        },
        {
          table: "posts",
        },
      ],
      mockClientInfo,
      prismaMock,
    )

    expect(result).toEqual({
      users: [{ id: 1, name: "John Doe", email: "john.doe@example.com" }],
      posts: [
        { id: 2, title: "Post 2", content: "Content 2" },
        { id: 1, title: "Post 1", content: "Content 1" },
      ],
    })
  })

  test("not included object", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        tags: [{ name: "t1" }],
      },
    ])

    const result = await runQueries(
      [
        {
          table: "users",
        },
      ],
      mockClientInfo,
      prismaMock,
    )

    expect(result).toEqual({
      users: [
        {
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com",
          tags: [{ name: "t1" }],
        },
      ],
    })
  })
})
