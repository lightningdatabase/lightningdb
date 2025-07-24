import { splitResult } from "./split"

// Mock the schema module
vi.mock("./schema", () => ({
  tablesMap: {
    users: "users",
    posts: "posts",
  },
  includesMap: {},
}))

describe("splitResult", () => {
  test("basic", () => {
    const queryResult = [
      {
        id: 1,
        name: "John Doe",
      },
    ]

    const final = splitResult("users", queryResult, {})

    expect(final).toEqual({
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
    })
  })

  test("single include", () => {
    const queryResult = [
      {
        id: 1,
        name: "John Doe",
        posts: [
          {
            id: 1,
            title: "post1",
          },
        ],
      },
    ]

    const final = splitResult("users", queryResult, {
      include: {
        posts: true,
      },
    })

    expect(final).toEqual({
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
      posts: [
        {
          id: 1,
          title: "post1",
        },
      ],
    })
  })

  test("single include object", () => {
    const queryResult = [
      {
        id: 1,
        name: "John Doe",
        posts: {
          id: 1,
          title: "post1",
        },
      },
    ]

    const final = splitResult("users", queryResult, {
      include: {
        posts: {},
      },
    })

    expect(final).toEqual({
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
      posts: [
        {
          id: 1,
          title: "post1",
        },
      ],
    })
  })

  test("single include array", () => {
    const queryResult = [
      {
        id: 1,
        name: "John Doe",
        posts: [
          {
            id: 1,
            title: "post1",
          },
        ],
      },
    ]

    const final = splitResult("users", queryResult, {
      include: {
        posts: {},
      },
    })

    expect(final).toEqual({
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
      posts: [
        {
          id: 1,
          title: "post1",
        },
      ],
    })
  })

  test("single include array empty", () => {
    const queryResult = [
      {
        id: 1,
        name: "John Doe",
        posts: [],
      },
    ]

    const final = splitResult("users", queryResult, {
      include: {
        posts: {},
      },
    })

    expect(final).toEqual({
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
    })
  })

  test("nested include", () => {
    const queryResult = [
      {
        id: 1,
        name: "John Doe",
        posts: [
          {
            id: 1,
            title: "post1",
            tags: [
              {
                id: 1,
                name: "tag1",
              },
              {
                id: 2,
                name: "tag2",
              },
            ],
          },
        ],
      },
    ]

    const final = splitResult("users", queryResult, {
      include: {
        posts: {
          include: {
            tags: true,
          },
        },
      },
    })

    expect(final).toEqual({
      users: [
        {
          id: 1,
          name: "John Doe",
        },
      ],
      posts: [
        {
          id: 1,
          title: "post1",
        },
      ],
      tags: [
        {
          id: 1,
          name: "tag1",
        },
        {
          id: 2,
          name: "tag2",
        },
      ],
    })
  })

  test("not include", () => {
    const queryResult = [
      {
        id: 1,
        name: "John Doe",
        posts: [
          {
            id: 1,
            title: "post1",
          },
        ],
      },
    ]

    const final = splitResult("users", queryResult, {})

    expect(final).toEqual({
      users: [
        {
          id: 1,
          name: "John Doe",
          posts: [
            {
              id: 1,
              title: "post1",
            },
          ],
        },
      ],
    })
  })

  test("not include array", () => {
    const queryResult = [
      {
        id: 1,
        name: "John Doe",
        posts: [],
      },
    ]

    const final = splitResult("users", queryResult, {})

    expect(final).toEqual({
      users: [
        {
          id: 1,
          name: "John Doe",
          posts: [],
        },
      ],
    })
  })
})
