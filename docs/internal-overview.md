# Internal Overview

LightningDB is based around a server / client framework with a websocket linking them.

```mermaid
graph LR;
subgraph Client
App<-->Cache[(Cache)]
end
subgraph Server
Api<-->DB[(Postgres DB)]
end
Cache<-.->|websocket|Api
```

## Queries

Queries are written in the App with `useQuery`.

```mermaid
  sequenceDiagram
    autonumber
    participant App
    participant Cache
    participant Api
    participant Db AS Postgres DB

    App->>Cache: useQuery
    activate Cache
    Cache->>App: cacheResult
    Cache-->>Api: fetch
    activate Api
    Api->>Api: store query
    Api->>Db: query db
    activate Db
    Db->>Api: query result
    deactivate Db
    Api-->>Cache: query result
    deactivate Api
    Cache->>Cache: store in cache
    Cache->>App: updatedResult
    deactivate Cache
```

1. `useQuery` request.
2. A result is returned based on the data already available in the cache.
3. A fetch is made across the websocket.
4. The query is stored in the Api, so that future updates can be made.
5. \- 6. The Postgres database is queried
6. The database result is sent across the websocket
7. The frontend cache is updated with the new data.
8. The result is updated based on the new cache data.

## Mutations

Queries are written in the App with `useMutation`.

```mermaid
  sequenceDiagram
    autonumber
    participant App
    participant Cache
    participant Api
    participant Db AS Postgres DB

    App->>Cache: useMutation
    activate Cache
    Cache->>Cache: optimistic update
    Cache->>App: cacheResult
    Cache-->>Api: fetch
    activate Api
    Api->>Db: query db
    activate Db
    Db->>Api: query result
    deactivate Db
    Api-->>Cache: query result
    deactivate Api
    Cache->>Cache: store in cache
    Cache->>App: updatedResult
    deactivate Cache
```

1. `useMutation` request.
2. Optimistically update the cache with the changes.
3. Queries automatically update based on the cache changes.
4. Mutations sent across the websocket.
5. \- 6. Database updated.
6. Update results sent across the websocket.
7. Frontend cache updated with changes.
8. Queries automatically update based on the cache changes.

## Replication

```mermaid
  sequenceDiagram
    autonumber
    participant App
    participant Cache
    participant Api
    participant Db AS Postgres DB

    activate Db
    note over Db: Database Change
    Db->>Api: logical replication
    deactivate Db
    activate Api
    Api->>Api: Filter queries
    Api->>Db: rerun queries
    activate Db
    Db->>Api: query results
    deactivate Db
    Api-->>Cache: updates
    deactivate Api
    activate Cache
    Cache->>Cache: Update Cache
    Cache->>App: updates
    deactivate Cache
```

1. Postgres database detects a change.
2. The list of stored queries is filtered to only those queries impacted by the change.
3. \- 4. Those queries are rerun against the postgres database.
4. The results are sent across the websocket.
5. The frontend cache is updated.
6. The cache changes update any queries relying on changed data.
