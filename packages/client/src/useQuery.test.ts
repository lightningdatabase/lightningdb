import { Includes } from "./baseTypes"
import useQuery, { processIncludes } from "./useQuery"
import { useDB } from "./context"
import { renderHook } from "@testing-library/react"
import { QueryStoreState } from "./types"

// Mock the useDB hook
vi.mock("./context", () => ({
  useDB: vi.fn(),
}))

const mockSendQuery = vi.fn().mockReturnValue(1)
const mockQueryStates = new Map<number, QueryStoreState>()
const mockCache = {}

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

describe("useQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("initial loading state", () => {
    ;(useDB as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sendQuery: mockSendQuery,
      queryStates: mockQueryStates,
      cache: mockCache,
    })

    const query = {
      users: {
        where: { id: 1 },
      },
    }

    const { result } = renderHook(() => useQuery(query))

    expect(result.current).toEqual({
      isLoading: true,
      error: undefined,
      data: undefined,
    })
    expect(mockSendQuery).toHaveBeenCalledWith([
      {
        table: "users",
        where: {
          id: 1,
        },
      },
    ])
  })

  test("successful query with data", () => {
    const mockCache = {
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
    }

    ;(useDB as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sendQuery: mockSendQuery,
      queryStates: mockQueryStates,
      cache: mockCache,
    })

    const query = {
      users: {
        where: { id: 1 },
      },
    }

    const { result, rerender } = renderHook(() => useQuery(query))

    mockQueryStates.set(1, {
      isLoading: false,
      error: undefined,
    })

    rerender()

    expect(mockSendQuery).toHaveBeenCalledWith([
      {
        table: "users",
        where: {
          id: 1,
        },
      },
    ])

    expect(result.current).toEqual({
      isLoading: false,
      error: undefined,
      data: {
        users: [
          {
            id: 1,
            name: "John Doe",
          },
        ],
      },
    })
  })

  test("successful query from cache", () => {
    const mockCache = {
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
    }

    mockQueryStates.set(1, {
      isLoading: false,
      error: undefined,
    })
    ;(useDB as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sendQuery: mockSendQuery,
      queryStates: mockQueryStates,
      cache: mockCache,
    })

    const query = {
      users: {
        where: { id: 1 },
      },
    }

    const { result } = renderHook(() => useQuery(query))

    expect(mockSendQuery).toHaveBeenCalledWith([
      {
        table: "users",
        where: {
          id: 1,
        },
      },
    ])

    expect(result.current).toEqual({
      isLoading: true,
      error: undefined,
      data: {
        users: [
          {
            id: 1,
            name: "John Doe",
          },
        ],
      },
    })
  })

  test("query with includes", () => {
    const mockCache = {
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
      posts: [
        {
          id: 1,
          title: "Post 1",
          authorId: 1,
        },
      ],
    }

    const query = {
      users: {
        where: { id: 1 },
        include: {
          posts: {
            include: {
              author: true,
            },
          },
        },
      },
    }

    ;(useDB as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      includesMap,
      sendQuery: mockSendQuery,
      queryStates: mockQueryStates,
      cache: mockCache,
    })

    const { result, rerender } = renderHook(() => useQuery(query))

    mockQueryStates.set(1, {
      isLoading: false,
      error: undefined,
    })

    rerender()

    expect(result.current).toEqual({
      isLoading: false,
      error: undefined,
      data: {
        users: [
          {
            id: 1,
            name: "John Doe",
            posts: [
              {
                id: 1,
                title: "Post 1",
                authorId: 1,
                author: {
                  id: 1,
                  name: "John Doe",
                },
              },
            ],
          },
        ],
      },
    })
  })

  test("single query", () => {
    const mockCache = {
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
      posts: [
        {
          id: 1,
          title: "Post 1",
          authorId: 1,
        },
      ],
    }

    const query = {
      user: {
        where: { id: 1 },
      },
    }

    ;(useDB as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sendQuery: mockSendQuery,
      queryStates: mockQueryStates,
      cache: mockCache,
    })

    const { result, rerender } = renderHook(() => useQuery(query))

    mockQueryStates.set(1, {
      isLoading: false,
      error: undefined,
    })

    rerender()

    expect(result.current).toEqual({
      isLoading: false,
      error: undefined,
      data: {
        user: {
          id: 1,
          name: "John Doe",
        },
      },
    })
  })

  test("query with alias", () => {
    const mockCache = {
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
    }

    const query = {
      abc: {
        table: "users",
      },
    }

    ;(useDB as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sendQuery: mockSendQuery,
      queryStates: mockQueryStates,
      cache: mockCache,
    })

    const { result, rerender } = renderHook(() => useQuery(query))

    mockQueryStates.set(1, {
      isLoading: false,
      error: undefined,
    })

    rerender()

    expect(result.current).toEqual({
      isLoading: false,
      error: undefined,
      data: {
        abc: [
          {
            id: 1,
            name: "John Doe",
          },
        ],
      },
    })
  })

  test("query with error", async () => {
    const mockSendQuery = vi.fn().mockReturnValue(1)
    const mockQueryStates = new Map<number, QueryStoreState>()
    const mockCache = {}

    const query = {
      users: {
        where: { id: 1 },
      },
    }

    ;(useDB as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sendQuery: mockSendQuery,
      queryStates: mockQueryStates,
      cache: mockCache,
    })

    const { result, rerender } = renderHook(() => useQuery(query))

    expect(mockSendQuery).toHaveBeenCalledWith([
      {
        table: "users",
        where: {
          id: 1,
        },
      },
    ])

    // Set up the error state after the component has rendered and useEffect has run
    mockQueryStates.set(1, {
      isLoading: false,
      error: new Error("Failed to fetch"),
    })

    // Force a re-render to pick up the new query state
    rerender()

    expect(result.current).toEqual({
      isLoading: false,
      error: new Error("Failed to fetch"),
      data: undefined,
    })
  })

  test("query with pagination and ordering", () => {
    const mockCache = {
      users: [
        {
          id: 1,
          name: "John Doe",
        },
        {
          id: 2,
          name: "Jane Doe",
        },
        {
          id: 3,
          name: "Bob Smith",
        },
      ],
    }

    const query = {
      users: {
        skip: 1,
        take: 1,
        orderBy: {
          name: "asc",
        },
      },
    }

    ;(useDB as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sendQuery: mockSendQuery,
      queryStates: mockQueryStates,
      cache: mockCache,
    })

    const { result, rerender } = renderHook(() => useQuery(query))

    mockQueryStates.set(1, {
      isLoading: false,
      error: undefined,
    })

    rerender()

    expect(result.current).toEqual({
      isLoading: false,
      error: undefined,
      data: {
        users: [
          {
            id: 2,
            name: "Jane Doe",
          },
        ],
      },
    })
  })

  test("query updates when cache changes", () => {
    const mockCache = {
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
    }

    const query = {
      users: {
        where: { id: 1 },
      },
    }

    mockQueryStates.set(1, {
      isLoading: false,
      error: undefined,
    })
    ;(useDB as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sendQuery: mockSendQuery,
      queryStates: mockQueryStates,
      cache: mockCache,
    })

    const { result, rerender } = renderHook(() => useQuery(query))

    expect(result.current.data).toEqual({
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
    })

    // Update cache
    mockCache.users[0].name = "John Updated"

    // Rerender to trigger cache update
    rerender()

    expect(result.current.data).toEqual({
      users: [
        {
          id: 1,
          name: "John Updated",
        },
      ],
    })
  })
})

describe("processIncludes", () => {
  test("empty", () => {
    const item = {}

    processIncludes(item, {}, {}, includesMap, "users")

    expect(item).toEqual({})
  })

  test("basic", () => {
    const item = {
      id: 1,
      name: "John Doe",
    }

    const includes = {
      posts: true,
    }

    const cache = {
      posts: [
        {
          id: 2,
          title: "Post 1",
          authorId: 1,
        },
      ],
    }

    processIncludes(item, includes, cache, includesMap, "users")

    expect(item).toEqual({
      id: 1,
      name: "John Doe",
      posts: [
        {
          id: 2,
          authorId: 1,
          title: "Post 1",
        },
      ],
    })
  })

  test("none", () => {
    const item = {
      id: 1,
      name: "John Doe",
    }

    const includes = {
      posts: true,
    }

    const cache = {
      posts: [],
    }

    processIncludes(item, includes, cache, includesMap, "users")

    expect(item).toEqual({
      id: 1,
      name: "John Doe",
      posts: [],
    })
  })

  test("basic object", () => {
    const item = {
      id: 1,
      title: "Post 1",
      authorId: 1,
    }

    const includes = {
      author: true,
    }

    const cache = {
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
    }

    processIncludes(item, includes, cache, includesMap, "posts")

    expect(item).toEqual({
      id: 1,
      title: "Post 1",
      authorId: 1,
      author: {
        id: 1,
        name: "John Doe",
      },
    })
  })

  test("nested", () => {
    const item = {
      id: 1,
      name: "John Doe",
    }

    const includes = {
      posts: {
        include: {
          author: true,
        },
      },
    }

    const cache = {
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
      posts: [
        {
          id: 1,
          title: "Post 1",
          authorId: 1,
        },
        {
          id: 2,
          title: "Post 2",
          authorId: 1,
        },
      ],
    }

    processIncludes(item, includes, cache, includesMap, "users")

    expect(item).toEqual({
      id: 1,
      name: "John Doe",
      posts: [
        {
          id: 1,
          authorId: 1,
          author: {
            id: 1,
            name: "John Doe",
          },
          title: "Post 1",
        },
        {
          id: 2,
          authorId: 1,
          author: {
            id: 1,
            name: "John Doe",
          },
          title: "Post 2",
        },
      ],
    })
  })

  test("double nested", () => {
    const item = {
      id: 1,
      name: "John Doe",
    }

    const includes = {
      posts: {
        include: {
          author: {
            include: {
              posts: true,
            },
          },
        },
      },
    }

    const cache = {
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
      posts: [
        {
          id: 1,
          title: "Post 1",
          authorId: 1,
        },
        {
          id: 2,
          title: "Post 2",
          authorId: 1,
        },
      ],
    }

    processIncludes(item, includes, cache, includesMap, "users")

    expect(item).toEqual({
      id: 1,
      name: "John Doe",
      posts: [
        {
          id: 1,
          authorId: 1,
          author: {
            id: 1,
            name: "John Doe",
            posts: [
              {
                id: 1,
                title: "Post 1",
                authorId: 1,
              },
              {
                id: 2,
                title: "Post 2",
                authorId: 1,
              },
            ],
          },
          title: "Post 1",
        },
        {
          id: 2,
          authorId: 1,
          author: {
            id: 1,
            name: "John Doe",
            posts: [
              {
                id: 1,
                title: "Post 1",
                authorId: 1,
              },
              {
                id: 2,
                title: "Post 2",
                authorId: 1,
              },
            ],
          },
          title: "Post 2",
        },
      ],
    })
  })

  test("circular reference", () => {
    const item = {
      id: 1,
      name: "John Doe",
    }

    const includes = {
      posts: {
        include: {
          author: {
            include: {
              posts: {
                include: {
                  author: true,
                },
              },
            },
          },
        },
      },
    }

    const cache = {
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
      posts: [
        {
          id: 1,
          title: "Post 1",
          authorId: 1,
        },
        {
          id: 2,
          title: "Post 2",
          authorId: 1,
        },
      ],
    }

    processIncludes(item, includes, cache, includesMap, "users")

    expect(item).toEqual({
      id: 1,
      name: "John Doe",
      posts: [
        {
          id: 1,
          authorId: 1,
          author: {
            id: 1,
            name: "John Doe",
            posts: [
              {
                id: 1,
                title: "Post 1",
                authorId: 1,
                author: {
                  id: 1,
                  name: "John Doe",
                },
              },
              {
                id: 2,
                title: "Post 2",
                authorId: 1,
                author: {
                  id: 1,
                  name: "John Doe",
                },
              },
            ],
          },
          title: "Post 1",
        },
        {
          id: 2,
          authorId: 1,
          author: {
            id: 1,
            name: "John Doe",
            posts: [
              {
                id: 1,
                title: "Post 1",
                authorId: 1,
                author: {
                  id: 1,
                  name: "John Doe",
                },
              },
              {
                id: 2,
                title: "Post 2",
                authorId: 1,
                author: {
                  id: 1,
                  name: "John Doe",
                },
              },
            ],
          },
          title: "Post 2",
        },
      ],
    })
  })
})
