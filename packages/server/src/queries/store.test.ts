import { Includes } from "src/types"
import { addQueryToStore } from "./store"
import { WebSocket } from "ws"

const includesMap: Includes = {
  users: {
    posts: {
      type: "oneToMany",
      model: "posts",
      field: "authorId",
    },
  },
  posts: {
    author: {
      type: "manyToOne",
      model: "users",
      field: "authorId",
    },
  },
}

describe("addQueryToStore", () => {
  test("basic", () => {
    const clientInfo = {
      socket: {} as unknown as WebSocket,
      queries: [],
      user: {
        id: 1,
      },
    }

    addQueryToStore(
      clientInfo,
      "users",
      {
        where: {
          id: 1,
        },
      },
      {},
      includesMap,
    )

    expect(clientInfo.queries).toEqual([
      {
        table: "users",
        query: {
          where: {
            id: 1,
          },
        },
        includes: [],
      },
    ])
  })

  test("include", () => {
    const clientInfo = {
      socket: {} as unknown as WebSocket,
      queries: [],
      user: null,
    }

    addQueryToStore(
      clientInfo,
      "users",
      {
        where: {
          id: 1,
        },
        include: {
          posts: true,
        },
      },
      {
        users: [
          {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            posts: [
              {
                id: 1,
                title: "post title",
              },
            ],
          },
        ],
      },
      includesMap,
    )

    expect(clientInfo.queries).toEqual([
      {
        table: "users",
        query: {
          where: {
            id: 1,
          },
          include: {
            posts: true,
          },
        },
        includes: [
          {
            table: "posts",
            query: {
              where: {
                authorId: {
                  in: [1],
                },
              },
            },
          },
        ],
      },
    ])
  })

  test("include with where", () => {
    const clientInfo = {
      socket: {} as unknown as WebSocket,
      queries: [],
      user: null,
    }

    addQueryToStore(
      clientInfo,
      "users",
      {
        where: {
          id: 1,
        },
        include: {
          posts: {
            where: {
              id: 1,
            },
          },
        },
      },
      {
        users: [
          {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            posts: [
              {
                id: 1,
                title: "post title",
              },
            ],
          },
        ],
      },
      includesMap,
    )

    expect(clientInfo.queries).toEqual([
      {
        table: "users",
        query: {
          where: {
            id: 1,
          },
          include: {
            posts: {
              where: {
                id: 1,
              },
            },
          },
        },
        includes: [
          {
            table: "posts",
            query: {
              where: {
                id: 1,
                authorId: {
                  in: [1],
                },
              },
            },
          },
        ],
      },
    ])
  })

  test("include take 1", () => {
    const clientInfo = {
      socket: {} as unknown as WebSocket,
      queries: [],
      user: null,
    }

    addQueryToStore(
      clientInfo,
      "users",
      {
        where: {
          id: 1,
        },
        include: {
          posts: {
            take: 1,
          },
        },
      },
      {
        users: [
          {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            posts: [
              {
                id: 1,
                title: "post title",
              },
            ],
          },
        ],
      },
      includesMap,
    )

    expect(clientInfo.queries).toEqual([
      {
        table: "users",
        query: {
          where: {
            id: 1,
          },
          include: {
            posts: {
              take: 1,
            },
          },
        },
        includes: [
          {
            table: "posts",
            query: {
              take: 1,
              where: {
                authorId: {
                  in: [1],
                },
              },
            },
          },
        ],
      },
    ])
  })

  test("nested include", () => {
    const clientInfo = {
      socket: {} as unknown as WebSocket,
      queries: [],
      user: null,
    }

    addQueryToStore(
      clientInfo,
      "users",
      {
        where: {
          id: 1,
        },
        include: {
          posts: {
            include: {
              author: true,
            },
          },
        },
      },
      {
        users: [
          {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            posts: [
              {
                id: 2,
                title: "post title",
                authorId: 1,
                author: {
                  id: 3,
                  name: "John Doe",
                  email: "john.doe@example.com",
                },
              },
            ],
          },
        ],
      },
      includesMap,
    )

    expect(clientInfo.queries).toEqual([
      {
        table: "users",
        query: {
          where: {
            id: 1,
          },
          include: {
            posts: {
              include: {
                author: true,
              },
            },
          },
        },
        includes: [
          {
            table: "posts",
            query: {
              include: {
                author: true,
              },
              where: {
                authorId: {
                  in: [1],
                },
              },
            },
          },
          {
            table: "users",
            query: {
              where: {
                id: {
                  in: [3],
                },
              },
            },
          },
        ],
      },
    ])
  })
})
