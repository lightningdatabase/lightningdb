import React from "react"
import { baseUseMutation } from "@lightningdb/client"
import { Alert, Button } from "@mui/material"
import { Parser } from "@dldc/literal-parser"

const parseCode = (input: string) => {
  try {
    return Parser.parse(input)
  } catch {}

  return null
}

type MutationResultProps = {
  mutation: string
}

const MutationResult: React.FC<MutationResultProps> = ({ mutation }) => {
  const [runMutation, { isLoading, error }] = baseUseMutation(
    parseCode(mutation) ?? {},
  )

  return (
    <>
      <Button loading={isLoading} onClick={runMutation} variant="contained">
        Run Mutation
      </Button>
      {error && <Alert severity="error">{error.message}</Alert>}
    </>
  )
}

export default MutationResult
