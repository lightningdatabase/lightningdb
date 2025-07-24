import { Alert, Button, TextField } from "@mui/material"
import React from "react"
import { baseUseMutation } from "@lightningdb/client"
import useLocalState from "./helpers/useLocalState"

const parseString = (str: string) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return null
  }
}

const Mutation: React.FC = () => {
  const [mutation, setMutation] = useLocalState<string>("mutation", "")

  const parsedString = parseString(mutation)

  const [runMutation, { isLoading, error }] = baseUseMutation(parsedString)

  return (
    <>
      <TextField
        multiline
        rows={10}
        fullWidth
        value={mutation}
        onChange={e => setMutation(e.target.value)}
      />
      {error && <Alert severity="error">{error.message}</Alert>}

      <Button
        loading={isLoading}
        disabled={parsedString === null}
        onClick={() => runMutation()}
        variant="contained"
        sx={{ mt: 2 }}
      >
        Run Mutation
      </Button>
    </>
  )
}

export default Mutation
