import {
  LogicalReplicationService,
  Wal2JsonPlugin,
} from "pg-logical-replication"
import handler from "./handler"
import { SetupOptions } from "../setup"

const setupReplication = (options: SetupOptions | undefined) => {
  const plugin = new Wal2JsonPlugin({
    includeLsn: true,
    includeTimestamp: true,
  })

  const replication = new LogicalReplicationService({
    connectionString: process.env.DATABASE_URL,
  })

  replication.on("data", handler)

  replication.subscribe(
    plugin,
    process.env.REPLICATION_SLOT || "lightningdb_slot",
  )

  console.log(
    `Replication started - slot: ${
      process.env.REPLICATION_SLOT || "lightningdb_slot"
    }`,
  )
}

export default setupReplication
