# Essay

LightningDB came out my own quest for an easy way to build web apps. While there are lots of other libraries out there, none of them quite ticked all the right boxes for me, so I built LightningDB.

## Delightful Apps

It is useful to start from the user’s point of view, and here I take a lot of inspiration from <a href="https://www.instantdb.com/" target="_blank" rel="noopener noreferrer">Instant</a>. Thinking of the most delightful apps, there are three main attributes that come together to drive a modern user experience:

### Optimistic Updates

As soon as you press a button the change is instantly updated, no loading indicator to wait for. Flow is not interrupted, you are straight onto the next task.

### Multiplayer

I don’t want to be working with stale data or having to press refresh to see another user’s changes. Changes should instantly be reflected across all users’ sessions.

### Offline-Mode

This just happens behind the scenes. I don’t want to get stuck when the connection drops out, just queue up my changes and propagate them when the connection is restored.

## Developer Experience

There are a large number of libraries that look to solve the above issues, but where they start to fall down is in the developer experience that comes with them. Here there are another set of priorities:

### Open source

I want to be able to run all of this inside my own environment, not relying on someone else’s cloud.

### Relational database

I want to start with a Postgres database with all the power of tables, columns and foreign keys, rather than a key store. I should be able to fetch related records and query based on relationships, all with proper typing.

### Schema first

Once I have defined my schema everything should fall into place by default, optimistic updates shouldn’t need programming, database subscription changes should flow through automatically, no custom code required.

### Authentication with custom rules

Ideally it is easy to add authentication with one of the many authentication libraries in just a few lines of code. Beyond this there should be a powerful authorization system for writing custom rules.

### Extensible beyond CRUD.

Out of the box CRUD operations should just work and require no boilerplate. However, it should be possible to seamlessly implement more complex logic, both on the backend and frontend.

## What Exists

### GraphQL/Apollo

Before writing LightningDB I was using a custom library based on <a href="https://www.apollographql.com/" target="_blank" rel="noopener noreferrer">Apollo</a> on top of <a href="https://www.prisma.io/" target="_blank" rel="noopener noreferrer">Prisma</a>. On the server side this automatically generated a complicated GraphQL interface, so that you could, for example, paginate through relations with filters. Optimistic updates had to be manually written in Apollo client and multiplayer relied on lots of custom websocket subscriptions. Eventually you tire of chasing down cache update failures.

### Firebase

Firebase is the original attempt to solve a lot of these issues, however it is fundamentally a document store, not a full relational database.

### Supabase

On the surface this is quite close, sitting on top of a postgres database with relations. However, you still need to join up database change listeners yourself somehow.

### Instant

Fundamentally you are working with a triple store, so it isn’t going to work with an existing database and you lose the power of a database in favour of application level checks. As you don’t run database migrations, you don’t get guarantees about the data structure, making it hard to know if that relationship is really one-to-one or one-to-many.

## The Answer

On the basis of starting with a fully featured Postgres database, it was a small jump to choose <a href="https://www.prisma.io/" target="_blank" rel="noopener noreferrer">Prisma</a>, which I have been using for a number of years. Prisma brings a great ORM experience with full type safety and support for all the functionality required. On top of this LightningDB uses <a href="https://zenstack.dev/" target="_blank" rel="noopener noreferrer">Zenstack</a>, mainly for its permissions system, but it is also easy to hook into their generators.

### Cache

I started with a cache modelled on Apollo client, where each query is stored and all the data is nicely normalised. When querying data, you look to see if the query is in the cache, and if so return the array of denormalised objects, repeated for relations. However, this gets messy when you want to make optimistic updates, for example when creating an object, you need to insert this into the correct queries, based on their filters, sort, length etc. When deleting an object, you potentially need to remove one object and replace it with another one from the store.

So, I switched to storing objects against the table they come from and not storing queries at all. At query time the library filters the cached objects and when the cache is updated the query updates too. This gives quick results from the cache while the query is sent to the server and the results then update the cache, which updates the query response. This makes the syntax over the websocket super simple, you just send lists of objects for each table.

### Mutations

Mutations optimistically update the cache, with a history stored, so that if the mutation fails on the server the cache updates can be unwound. Again, it is as simple as updating the cache to make sure all queries, however remote, get updated. This handles edge cases, for example one can have a query giving a short list of authors based on a property on one of their posts, you then update a post, the query can then work out, from the cache, that one author moves out of the list and another moves in, all just from the optimistic update to the post.

### Replication

The real magic comes when combing this with Change Data Capture, so that any changes in the database are reflected all the way through to the frontend. The server keeps a list of queries against each client. When a change comes in, from the database, we can check to see which queries might be impacted by that change. This is quite a complicated operation, for example a query might have a filter based on a nested relationship. Or the change might mean that the object was in the query result before, but won’t be now, so another object needs to be sent to the frontend to take its place.

By rerunning the matched queries, we keep track of the correct permissions and then send the new set of objects back to the frontend, updating the cache, leading to all queries being instantly up to date.

## Trade-offs

Of course, this approach does come with trade-offs.

- Every time the database is updated the replication code gets fired, this potentially then reruns a large number of queries against the database.

- The frontend is effectively mirroring filtering etc. from sql into Typescript code. The results should be the same, but that relies on the library being written correctly.

- Optimistic updates may not accurately reflect the database, it can only work with what is in the cache, so results may go through two states, one from the cache and one from the database.

- The server is keeping track of all the queries from each client, this could turn into a very long list if you have a lot of clients.

- The code to work out if a query needs to be rerun is fairly complex. While it can fail positive without issue, it does make the code more complex and a false negative will lead to frontend inconsistencies.

> To get started:
>
> ```bash
> npx @lightningdb/cli create
> ```
>
> or see [manual install](./manual-install.md).
