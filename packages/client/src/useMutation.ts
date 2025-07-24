import { MutationInputType, useDB } from "./context.js"
import { useRef } from "react"

type MutationResult = [() => Promise<void>, MutationState]

export type MutationState = {
  isLoading: boolean
  error: Error | undefined
}

const useMutation = <MI extends MutationInputType>(
  mutation: MI | MI[],
): MutationResult => {
  const { sendMutation, mutationStates } = useDB()
  const currentQueryId = useRef<number | null>(null)

  const run = async () => {
    currentQueryId.current = sendMutation(mutation)
  }

  const currentState =
    currentQueryId.current !== null
      ? mutationStates.get(currentQueryId.current)
      : undefined

  return [
    run,
    {
      isLoading: currentState?.isLoading ?? false,
      error: currentState?.error,
    },
  ]
}

export default useMutation
