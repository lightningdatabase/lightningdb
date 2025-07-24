import {
  BoolFilter,
  DateTimeFilter,
  IntFilter,
  IntNullableFilter,
  SortOrder,
  StringFilter,
  StringNullableFilter,
} from "./baseTypes"
import { QueryType } from "./context"
import { QueryResponse, SelectSubset } from "./types"

describe("QueryResponse", () => {
  test("basic", () => {
    expectTypeOf<
      QueryResponse<
        {
          users: {}
        },
        {
          users: {
            name: "users"
            objects: {}
            scalars: {
              id: number
              name: string
            }
          }
        },
        {
          user: {
            name: "users"
            objects: {}
            scalars: {}
          }
        }
      >
    >().toMatchTypeOf<{
      users: {
        id: number
        name: string
      }[]
    }>()
  })

  test("relation where", () => {
    expectTypeOf<
      QueryResponse<
        {
          posts: {
            where: {
              author: {
                id: 1
              }
            }
          }
        },
        {
          posts: {
            name: "posts"
            objects: {
              author: {
                name: "users"
                objects: {}
                scalars: {}
              }
            }
            scalars: {
              id: number
              name: string
            }
          }
        },
        {}
      >
    >().toMatchTypeOf<{
      posts: {
        id: number
        name: string
      }[]
    }>()
  })

  test("with include", () => {
    expectTypeOf<
      QueryResponse<
        {
          users: {
            include: {
              posts: true
            }
          }
        },
        {
          users: {
            name: "users"
            objects: {
              posts: {
                name: "posts"
                objects: {}
                scalars: {
                  id: number
                  title: string
                }
              }
            }
            scalars: {
              id: number
              name: string
            }
          }
        },
        {}
      >
    >().toMatchTypeOf<{
      users: {
        id: number
        name: string
        posts: {
          id: number
          title: string
        }
      }[]
    }>()
  })

  test("with include array", () => {
    expectTypeOf<
      QueryResponse<
        {
          users: {
            include: {
              posts: true
            }
          }
        },
        {
          users: {
            name: "users"
            objects: {
              posts: {
                name: "posts"
                objects: {}
                scalars: {
                  id: number
                  title: string
                }
              }[]
            }
            scalars: {
              id: number
              name: string
            }
          }
        },
        {}
      >
    >().toMatchTypeOf<{
      users: {
        id: number
        name: string
        posts: {
          id: number
          title: string
        }[]
      }[]
    }>()
  })

  test("alias", () => {
    type $UserPayload = {
      name: "User"
      objects: {
        posts: $PostPayload[]
      }
      scalars: {
        id: number
        email: string
        name: string | null
      }
    }

    type $PostPayload = {
      name: "Post"
      objects: {
        author: $UserPayload
        tags: $TagPayload[]
      }
      scalars: {
        id: number
        createdAt: Date
        updatedAt: Date
        title: string
        content: string | null
        published: boolean
        viewCount: number
        authorId: number | null
      }
    }

    type $TagPayload = {
      name: "Tag"
      objects: {
        post: $PostPayload
      }
      scalars: {
        id: number
        name: string
        postId: number
      }
    }

    expectTypeOf<
      QueryResponse<
        {
          abc: {
            table: "users"
          }
        },
        {
          users: $UserPayload
          posts: $PostPayload
          tags: $TagPayload
        },
        {
          user: $UserPayload
          post: $PostPayload
          tag: $TagPayload
        }
      >
    >().toMatchTypeOf<{
      abc: {
        id: number
        email: string
        name: string | null
      }[]
    }>()
  })

  test("alias2", () => {
    type $UserPayload = {
      name: "User"
      objects: {
        posts: $PostPayload[]
      }
      scalars: {
        id: number
        email: string
        name: string | null
      }
    }

    type $PostPayload = {
      name: "Post"
      objects: {
        author: $UserPayload
        tags: $TagPayload[]
      }
      scalars: {
        id: number
        createdAt: Date
        updatedAt: Date
        title: string
        content: string | null
        published: boolean
        viewCount: number
        authorId: number | null
      }
    }

    type $TagPayload = {
      name: "Tag"
      objects: {
        post: $PostPayload
      }
      scalars: {
        id: number
        name: string
        postId: number
      }
    }

    expectTypeOf<
      QueryResponse<
        SelectSubset<
          {
            abc: {
              table: "users"
            }
          },
          {},
          {}
        >,
        {
          users: $UserPayload
          posts: $PostPayload
          tags: $TagPayload
        },
        {
          user: $UserPayload
          post: $PostPayload
          tag: $TagPayload
        }
      >
    >().toMatchTypeOf<{
      abc: {
        id: number
        email: string
        name: string | null
      }[]
    }>()
  })
})

describe("QueryType", () => {
  test("with where", () => {
    expectTypeOf({
      posts: {
        where: {
          author: {
            id: {
              in: [1, 2, 3],
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      },
    }).toMatchTypeOf<QueryType>
  })

  test("single", () => {
    expectTypeOf<
      QueryResponse<
        {
          user: {}
        },
        {
          users: {
            name: "users"
            objects: {}
            scalars: {
              id: number
              name: string
            }
          }
        },
        {
          user: {
            name: "users"
            objects: {}
            scalars: {
              id: number
              name: string
            }
          }
        }
      >
    >().toMatchTypeOf<{
      user: {
        id: number
        name: string
      }
    }>()
  })
})

describe("Proper QueryType", () => {
  test("with where", () => {
    type Query =
      | {
          users?: UsersQueryParams
          posts?: PostsQueryParams
          tags?: TagsQueryParams
        }
      | { [key: string]: UsersQuery | PostsQuery | TagsQuery }

    type UsersQuery = UsersQueryParams & {
      table: "users"
    }

    type UsersQueryParams = {
      where?: UserWhereInput
      include?: UserInclude
      take?: number
      skip?: number
      orderBy?: UserOrderBy
    }

    type PostsQuery = PostsQueryParams & {
      table: "posts"
    }

    type PostsQueryParams = {
      where?: PostWhereInput
      include?: PostInclude
      take?: number
      skip?: number
      orderBy?: PostOrderBy
    }

    type TagsQuery = TagsQueryParams & {
      table: "tags"
    }

    type TagsQueryParams = {
      where?: TagWhereInput
      include?: TagInclude
      take?: number
      skip?: number
      orderBy?: TagOrderBy
    }

    type UserWhereInput = {
      id?: IntFilter | number
      email?: StringFilter | string
      name?: StringNullableFilter | string | null
      posts?: PostListRelationFilter
    }

    type PostWhereInput = {
      id?: IntFilter | number
      createdAt?: DateTimeFilter | Date
      updatedAt?: DateTimeFilter | Date
      title?: StringFilter | string
      content?: StringNullableFilter | string | null
      published?: BoolFilter | boolean
      viewCount?: IntFilter | number
      authorId?: IntNullableFilter | number | null
      tags?: TagListRelationFilter
      author?: UserWhereInput | null
    }

    type TagWhereInput = {
      id?: IntFilter | number
      name?: StringFilter | string
      postId?: IntFilter | number
      post?: PostWhereInput
    }

    type PostListRelationFilter = {
      every?: PostWhereInput
      some?: PostWhereInput
      none?: PostWhereInput
    }

    type TagListRelationFilter = {
      every?: TagWhereInput
      some?: TagWhereInput
      none?: TagWhereInput
    }

    type UserInclude = {
      posts?: boolean | User$postsArgs
    }

    type PostInclude = {
      author?: boolean | Post$authorArgs
      tags?: boolean | Post$tagsArgs
    }

    type TagInclude = {
      post?: boolean | Tag$postArgs
    }

    type UserOrderBy = {
      id?: SortOrder
      email?: SortOrder
      name?: SortOrder
    }

    type PostOrderBy = {
      id?: SortOrder
      createdAt?: SortOrder
      updatedAt?: SortOrder
      title?: SortOrder
      content?: SortOrder
      published?: SortOrder
      viewCount?: SortOrder
      authorId?: SortOrder
    }

    type TagOrderBy = {
      id?: SortOrder
      name?: SortOrder
      postId?: SortOrder
    }

    type User$postsArgs = {
      where?: PostWhereInput
      include?: PostInclude
      take?: number
      skip?: number
    }

    type Post$authorArgs = {
      where?: UserWhereInput
      include?: UserInclude
    }

    type Post$tagsArgs = {
      where?: TagWhereInput
      include?: TagInclude
      take?: number
      skip?: number
    }

    type Tag$postArgs = {
      where?: PostWhereInput
      include?: PostInclude
    }

    type $UserPayload = {
      name: "User"
      objects: {
        posts: $PostPayload[]
      }
      scalars: {
        id: number
        email: string
        name: string | null
      }
    }

    type $PostPayload = {
      name: "Post"
      objects: {
        author: $UserPayload
        tags: $TagPayload[]
      }
      scalars: {
        id: number
        createdAt: Date
        updatedAt: Date
        title: string
        content: string | null
        published: boolean
        viewCount: number
        authorId: number | null
      }
    }

    type $TagPayload = {
      name: "Tag"
      objects: {
        post: $PostPayload
      }
      scalars: {
        id: number
        name: string
        postId: number
      }
    }

    expectTypeOf({
      posts: {
        // where: {
        //   author: {
        //     id: {
        //       in: [1, 2, 3],
        //     },
        //   },
        // },
        // orderBy: {
        //   id: "asc",
        // },
      },
    }).toMatchTypeOf<Query>
  })
})
