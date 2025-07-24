# Queries

The `useQuery` hook makes it easy to query your data.

To get a list of models include the model name in plural:

```typescript
const { data, isLoading, error } = useQuery({
  users: {},
})
```

The query runs straight away when the component is loaded and the return `data` is typed correctly for the query.

While the query is loading `isLoading` is set to true.

If there is an error with your query `error` gives details.

The query is also fully typed, making it easy to construct valid queries.

If the data changes in the database the query result will automatically update.

## Single Result

You can query for a single result like so:

```typescript
const { data, isLoading, error } = useQuery({
  user: {},
})
```

The first matching model will be returned.

## Multiple models

You can query multiple models at once like so:

```typescript
const { data, isLoading, error } = useQuery({
  users: {},
  posts: {},
})
```

## Filtering

You can add where clauses like so:

```typescript
const { data, isLoading, error } = useQuery({
  users: {
    where: {
      id: 1,
    },
  },
})
```

### Relation filtering

You can query based on the presence (or absence) of a relationship. For example:

```typescript
const { data, isLoading, error } = useQuery({
  users: {
    where: {
      posts: {
        some: {
          id: 1,
        },
      },
    },
  },
})
```

### Advanced filtering

You can also filter with common operators, for example:

```typescript
const { data, error, isLoading } = useQuery({
  users: {
    where: {
      id: {
        gt: 10,
      },
    },
  },
})
```

## Sorting and limiting

By default you get all the results, but you can limit the number of results and order by a particular field:

```typescript
const { data, isLoading, error } = useQuery({
  users: {
    take: 5,
    orderBy: {
      id: "desc",
    },
  },
})
```

## Include relations

Inside a query you can request relationships:

```typescript
const { data, isLoading, error } = useQuery({
  users: {
    include: {
      posts: true,
    },
  },
})
```

### Limiting includes

You can use similar filtering, sorting and limiting inside includes:

```typescript
const { data, isLoading, error } = useQuery({
  users: {
    include: {
      posts: {
        where: {
          id: 1,
        },
        take: 1,
      },
    },
  },
})
```

### Nested includes

You can also nest includes:

```typescript
const { data, isLoading, error } = useQuery({
  users: {
    include: {
      posts: {
        include: {
          author: true,
        },
      },
    },
  },
})
```

## Query Alias

If you want to query the same table but with two different sets of filters you can use query aliases.

Use a key of your choice and set a `table` field:

```typescript
const { data, isLoading, error } = useQuery({
  firstSet: {
    table: "users",
    where: {
      id: 1,
    },
  },
  secondSet: {
    table: "users",
    where: {
      id: 2,
    },
  },
})

console.log(data?.firstSet)
console.log(data?.secondSet)
```
