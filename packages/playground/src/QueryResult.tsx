import React from "react"
import { baseUseQuery } from "@lightningdb/client"
import { Typography } from "@mui/material"
import { Parser } from "@dldc/literal-parser"

const parseCode = (input: string) => {
  try {
    return Parser.parse(input)
  } catch {}

  return null
}

type QueryResultProps = {
  query: string
}

const QueryResult: React.FC<QueryResultProps> = ({ query }) => {
  const { data } = baseUseQuery(parseCode(query) ?? {})

  return (
    <Typography variant="body2" component="div">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Typography>
  )
}

export default QueryResult
