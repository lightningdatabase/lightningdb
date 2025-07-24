# LightningDB Manual Install

> It is easier to start with a template, see [here](../README.md).

## Getting Started

LightningDB is made up of a server and client library.

Typically LightningDB would be installed in a monorepo, with a folder for the server and a folder for the client. However you are free to disregard this.

> See a working demo at https://github.com/lightningdatabase/lightningdb-templates/tree/main/default.

### Setup Server

We start by setting up the server. This includes the database schema, which is used to automatically generate the interface and client.

#### Setup Zenstack

> LightningDB is built on top of [Zenstack](https://zenstack.dev/), which is built on top of [Prisma](https://www.prisma.io/).

The easiest way to install ZenStack is to use the zenstack init command. In an existing TypeScript project folder, run the following command:

`npx zenstack@latest init`

The "init" command does the following things for you:

1. Install Prisma if it's not already installed.
2. Install the zenstack CLI package as a dev dependency.
3. Install the @zenstackhq/runtime package - used for enhancing PrismaClient at the runtime.
4. Copy the prisma/schema.prisma file to schema.zmodel if it exists; otherwise, create a new template schema.zmodel file.

You can always manually complete the steps above if you have a special project setup that the "init" command doesn't work with.

> After the initialization, please remember that you should edit the schema.zmodel moving forward. The prisma/schema.prisma file will be automatically regenerated when you run zenstack generate.

LightningDB uses Postgres, to switch Prisma change the datasource to:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### Add the plugin

Install the required packages

`npm install @lightningdb/server @lightningdb/plugin`

Edit the schema.zmodel file and add the plugin section

```prisma
//schema.zmodel
...
plugin lightning {
  provider = '@lightningdb/plugin'
}
...
```

You can now run the plugin to generate the server code

`npx zenstack generate`

#### Setup the server

LightningDB sends updates over a websocket.

See below for a sample express implementation with the websocket handler.

```typescript
//index.ts
import dotenv from "dotenv"

dotenv.config()

import express from "express"
import http from "http"
import { setupLightningDB } from "@lightningdb/server"

const app = express()

app.use(express.json())

const server = http.createServer(app)

setupLightningDB(server)

// Add a test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the LightningDB demo server" })
})

server.listen(3000, () =>
  console.log(`🚀 Server ready at: http://localhost:3000`),
)
```

LightningDB connects to the Postgres database and uses replication to catch any changes and update the frontend. This is achieved with the `import "@lightningdb/server/src/replication"` import.

#### Setup replication slot in Postgres

Run the following sql to setup a replication slot:

```sql
SELECT * FROM pg_create_logical_replication_slot('lightningdb_slot', 'wal2json');
```

> The default name is "lightningdb_slot", however you can set the name with the `REPLICATION_SLOT` environment variable.

### Setup Client

#### Install client library

In the frontend project run:

```bash
npm install @lightningdb/client
```

#### Update plugin

Edit the schema.zmodel file and update the plugin section to add the path to the frontend project

```prisma
//schema.zmodel
...
plugin lightning {
  provider = '@lightningdb/plugin'
  clientPath = '../client'
}
...
```

Run to generate the frontend code:

```bash
npx zenstack generate
```

#### Add provider

Render a `<DBProvider>` around your applciation:

```typescript
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import { DBProvider } from "../lightningdb"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DBProvider url="ws://localhost:3000">
      <App />
    </DBProvider>
  </StrictMode>,
)
```

#### Create your first query

It is easy to query the data and LightningDB keeps the frontend up to date automatically.

To query data in a component add:

```typescript
const { data, loading, error } = useQuery({
  users: {},
});

return <pre>{JSON.stringify(data, null, 2)}</pre>;
```
