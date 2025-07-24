import React from "react"
import { baseUseQuery } from "@lightningdb/client"
import { TextField } from "@mui/material"
import useLocalState from "./helpers/useLocalState"

const parseString = (str: string) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return {}
  }
}

const Query: React.FC = () => {
  const [query, setQuery] = useLocalState<string>("query", "")

  const { data } = baseUseQuery(parseString(query))

  return (
    <>
      <TextField
        multiline
        rows={10}
        fullWidth
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

export default Query
