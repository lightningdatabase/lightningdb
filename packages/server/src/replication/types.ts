export type ReplicationLog = {
  change: ReplicationChange[]
  timestamp: string // included due to includeTimestamp: true in plugin options
  lsn: string // included due to includeLsn: true in plugin options
}

export type ReplicationChange = InsertChange | UpdateChange | DeleteChange

export type InsertChange = {
  kind: "insert"
  schema: string
  table: string
  columnnames: string[]
  columntypes: string[]
  columnvalues: any[]
}

export type UpdateChange = {
  kind: "update"
  schema: string
  table: string
  columnnames: string[]
  columntypes: string[]
  columnvalues: any[]
  oldkeys: {
    keynames: string[]
    keytypes: string[]
    keyvalues: any[]
  }
}

export type DeleteChange = {
  kind: "delete"
  schema: string
  table: string
  oldkeys: {
    keynames: string[]
    keytypes: string[]
    keyvalues: any[]
  }
}
