# LightningDB Playground

Frontend React components for a playground making it easy to test queries and mutations.

## Getting started

```bash
npm i @lightningdb/playground
```

> Needs to be wrapped in a `<DBProvider />`

```typescript
import { Playground } from "@lightningdb/playground"

const App: React.FC = () => {
  return (
    <DBProvider url="ws://localhost:3000">
      <Playground />
    </DBProvider>
  )
}
```
