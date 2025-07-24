# Auth

Currently LightningDB supports [Clerk](https://clerk.com/)

## Clerk Auth

The easiest way to get started is to launch the auth-clerk template with:

```bash
npx @lightningdb/cli create --template lightningdatabase/lightningdb-templates/auth-clerk
```

### Client

Follow the instructions from clerk to:

1. [setup an account](https://clerk.com/docs/quickstarts/setup-clerk) and
2. [setup the frontend](https://clerk.com/docs/quickstarts/react)

You should end up with a `<ClerkProvider>` wrapping your application something like so:

```typescript
//main.ts
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import { DBProvider } from "../lightningdb"
import { ClerkProvider } from "@clerk/clerk-react"

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file")
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <DBProvider url="ws://localhost:3000">
        <App />
      </DBProvider>
    </ClerkProvider>
  </StrictMode>,
)
```

### Server

Install the `@lightningdb/auth-clerk` package:

```bash
npm install @lightningdb/auth-clerk
```

There are multiple ways to link users in Clerk to users in your database, see [zenstack docs](https://zenstack.dev/docs/guides/authentication/clerk) for more details.

#### Option 1 Users in Clerk Only

Adjust your `User` model in `schema.zmodel` to a `Type`:

```prisma
//schema.zmodel

type User {
  id String @id
}

model Post {
  id String @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title String
  published Boolean @default(false)
  authorId String // stores Clerk's user ID

  // author has full access
  @@allow('all', auth() != null && auth().id == authorId)

  // logged-in users can view published posts
  @@allow('read', auth() != null && published)
}
```

Add the authHandler to your `setupLightningDB` call:

```typescript
//index.ts
import express from "express"
import http from "http"
import { setupLightningDB } from "@lightningdb/server"
import { ClerkAuthHandler } from "@lightningdb/auth-clerk"
const app = express()

app.use(express.json())

const server = http.createServer(app)

setupLightningDB(server, {
  authHandler: new ClerkAuthHandler(),
})

// Add a test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the LightningDB demo server" })
})

server.listen(3000, () =>
  console.log(`🚀 Server ready at: http://localhost:3000`),
)
```

#### Option 2 Match by email

You can keep a table of users in your database.

> You will need to add code to insert users when they sign up to Clerk.

Follow Clerk docs to [Customize your session token](https://clerk.com/docs/backend-requests/custom-session-token) and add email, something like:

```json
{
  "email": "{{user.primary_email_address}}"
}
```

Add the authHandler to your `setupLightningDB` call, including a `authToUser` function to fetch the user by email:

```typescript
//index.ts
import express from "express"
import http from "http"
import { setupLightningDB } from "@lightningdb/server"
import { ClerkAuthHandler } from "@lightningdb/auth-clerk"
const app = express()

app.use(express.json())

const server = http.createServer(app)

setupLightningDB(server, {
  authHandler: new ClerkAuthHandler({
    authToUser: async (auth, client) => {
      const email = auth?.sessionClaims?.email as string | undefined

      if (!email) return null

      return await client.user.findUniqueOrThrow({
        where: {
          email,
        },
      })
    },
  }),
})

// Add a test route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the LightningDB demo server" })
})

server.listen(3000, () =>
  console.log(`🚀 Server ready at: http://localhost:3000`),
)
```
