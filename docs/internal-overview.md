# Internal Overview

LightningDB is based around a server / client framework with a websocket linking them.

```mermaid
graph LR;
subgraph Server
DB[(Postgres DB)]-->Api
end
subgraph Client
Cache-->App
end
Api-.->|websocket|Cache[(Cache)]
```

## Queries

Queries are written in the App with `useQuery`.

```mermaid
  sequenceDiagram
    participant App
    participant Cache
    participant Api
    participant Db AS Postgres DB

    App->>Cache: useQuery
    activate Cache
    Cache->>App: cacheResult
    Cache-->>Api: fetch
    activate Api
    note over Api: store query
    Api->>Db: query db
    activate Db
    Db->>Api: query result
    deactivate Db
    Api-->>Cache: query result
    deactivate Api
    note over Cache: store in cache
    Cache->>App: updatedResult
    deactivate Cache
```

## Mutations

## Replication

```mermaid
  sequenceDiagram
    participant App
    participant Cache
    participant Api
    participant Db AS Postgres DB

    activate Db
    note over Db: Database Change
    Db->>Api: logical replication
    deactivate Db
    activate Api
    note over Api: Filter queries
    Api->>Db: rerun queries
    activate Db
    Db->>Api: query results
    deactivate Db
    Api-->>Cache: updates
    deactivate Api
    activate Cache
    note over Cache: Update Cache
    Cache->>App: updates
    deactivate Cache
```
