# Lightning DB

Straightforward live apps with Postgres, built on top of <a href="https://www.prisma.io/" target="_blank" rel="noopener noreferrer">Prisma</a> and <a href="https://zenstack.dev/" target="_blank" rel="noopener noreferrer">Zenstack</a>, but with real-time updates.

## Getting Started

Create a new project from a template:

```bash
npx @lightningdb/cli create
```

See docs for [manual setup](./docs/manual-install.md).

## How Lightning DB works

Lightning DB comprises a number of packages including:

- [**Client**](./packages/client/): Frontend React library in Typescript
- [**Server**](./packages/server/): Nodejs library in Typescript
- [**Plugin**](./packages/plugin/): Zenstack plugin to automatically generate the required types

### Queries

- Fully typed query and result
- Fetch and query by relationships
- Kept up to date in real-time

```typescript
const { data, isLoading, error } = useQuery({
  users: {},
})
```

For further detail see [queries](./docs/queries.md).

### Mutations

- Fully typed
- Automatically updates all queries with changes
- Optimistic updates, before the server returns

```typescript
const [createUser, { isLoading, error }] = useMutation({
  users: {
    create: {
      data: values,
    },
  },
})
```

For further detail see [mutations](./docs/mutations.md).
