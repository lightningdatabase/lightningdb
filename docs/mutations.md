# Mutations

The `useMutation` hook makes it easy to update your data.

To create a new user:

```typescript
const [createUser, { isLoading, error }] = useMutation({
  users: {
    create: {
      data: values,
    },
  },
})
```

To run the mutation call `await createUser()`.

The mutations are fully typed, making it easy to construct valid mutations.

## Mutation Types

### Create

To create a new record in the database create a mutation with the model name in plural and then `create` with a `data` object containing the required fields.

### Update

To update an existing record in the database create a mutation with the model name in plural and then `update` with a `where` object that uniquely describes the record and a `data` object with those fields to be updated.

For example:

```typescript
const [updateUser, { isLoading, error }] = useMutation({
  users: {
    update: {
      where: { id: user.id },
      data: newValues,
    },
  },
})
```

### Delete

To delete an existing record in the database create a mutation with the model name in plural and then `delete` with a `where` object that uniquely describes the record.

For example:

```typescript
const [deleteUser, { isLoading }] = useMutation({
  users: {
    delete: {
      where: {
        id: userId,
      },
    },
  },
})
```

## Multiple Mutations

It is sometimes desirable to make multiple changes in one go. To do this you can pass an array of mutations to `useMutation`, for example:

```typescript
const [createPostAndDeletePost, { isLoading, error }] = useMutation([
  {
    posts: {
      create: {
        data: values,
      },
    },
  },
  {
    posts: {
      delete: {
        where: {
          id: postId,
        },
      },
    },
  },
])
```

## Cache Updates

When the mutation is called the cache is updated straight away, for example rows appear in tables, they are then updated once the change is persisted to the database. If there is an error the change will be rolled back.
