import React from "react"
import { baseUseQuery } from "@lightningdb/client"
import { Parser } from "@dldc/literal-parser"
import ResultDisplay from "./ResultDisplay"
import { Alert } from "@mui/material"

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

  if (data) return <ResultDisplay data={data} />

  return <Alert severity="info">Query not valid</Alert>
}

export default QueryResult
