import { describe, test, expect } from "vitest"
import { generateIncludes } from "./includes"

// Mock the dependencies
vi.mock("./queries/split", () => ({
  queryResultSplit: vi.fn(result => result),
}))

vi.mock("./queries/store", () => ({
  addQueryToStore: vi.fn(),
}))

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

describe("generateIncludes", () => {
  test("should handle boolean includes", () => {
    const queryParams = {
      include: {
        posts: true,
        profile: false,
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({
      posts: true,
      profile: false,
    })
  })

  test("should handle simple object includes", () => {
    const queryParams = {
      include: {
        posts: {
          take: 5,
          skip: 0,
        },
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({
      posts: {
        take: 5,
        skip: 0,
      },
    })
  })

  test("should handle standard filter operators in where clause", () => {
    const queryParams = {
      include: {
        posts: {
          where: {
            id: { equals: 1 },
            title: { contains: "test" },
            published: { in: [true, false] },
          },
        },
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({
      posts: {
        where: {
          id: { equals: 1 },
          title: { contains: "test" },
          published: { in: [true, false] },
        },
      },
    })
  })

  test("should handle relationship filters in where clause", () => {
    const queryParams = {
      include: {
        posts: {
          where: {
            author: {
              name: { equals: "John" },
              email: { contains: "@example.com" },
            },
            comments: {
              some: {
                content: { contains: "great" },
              },
            },
          },
        },
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({
      posts: {
        where: {
          author: {
            name: { equals: "John" },
            email: { contains: "@example.com" },
          },
          comments: {
            some: {
              content: { contains: "great" },
            },
          },
        },
      },
    })
  })

  test("should handle mixed standard and relationship filters", () => {
    const queryParams = {
      include: {
        posts: {
          where: {
            id: { equals: 1 },
            author: {
              name: { equals: "John" },
            },
            title: { contains: "test" },
          },
        },
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({
      posts: {
        where: {
          id: { equals: 1 },
          author: {
            name: { equals: "John" },
          },
          title: { contains: "test" },
        },
      },
    })
  })

  test("should handle nested includes", () => {
    const queryParams = {
      include: {
        posts: {
          include: {
            author: {
              where: {
                name: { equals: "John" },
              },
            },
            comments: {
              where: {
                content: { contains: "test" },
              },
            },
          },
        },
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({
      posts: {
        include: {
          author: {
            where: {
              name: { equals: "John" },
            },
          },
          comments: {
            where: {
              content: { contains: "test" },
            },
          },
        },
      },
    })
  })

  test("should handle empty include", () => {
    const queryParams = {}

    const result = generateIncludes(queryParams)

    expect(result).toEqual({})
  })

  test("should ignore standard where clauses", () => {
    const queryParams = {
      where: {
        id: 1,
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({})
  })

  test("should ignore standard where clauses - equal", () => {
    const queryParams = {
      where: {
        id: {
          equals: 1,
        },
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({})
  })

  test("should ignore standard where clauses with include", () => {
    const queryParams = {
      where: {
        id: 1,
      },
      include: {
        posts: true,
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({
      posts: true,
    })
  })

  test("basic relation where clause", () => {
    const queryParams = {
      where: {
        author: {
          id: 1,
        },
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({
      author: {
        where: {
          id: 1,
        },
      },
    })
  })

  test("one to many relation where clause", () => {
    const queryParams = {
      where: {
        comments: {
          some: {
            id: 1,
          },
        },
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({
      comments: {
        where: {
          id: 1,
        },
      },
    })
  })

  test("one to many relation where clause every", () => {
    const queryParams = {
      where: {
        comments: {
          every: {
            id: 1,
          },
        },
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({
      comments: {
        where: {
          id: 1,
        },
      },
    })
  })

  test("nested relation where clause", () => {
    const queryParams = {
      where: {
        author: {
          comments: {
            some: {
              id: 1,
            },
          },
        },
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({
      author: {
        include: {
          comments: {
            where: {
              id: 1,
            },
          },
        },
      },
    })
  })

  test("string array field, no include", () => {
    const queryParams = {
      where: {
        tags: {
          has: "tag1",
        },
      },
    }

    const result = generateIncludes(queryParams)

    expect(result).toEqual({})
  })
})
