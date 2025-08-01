import React from "react"
import QueryResult from "./QueryResult"
import MutationResult from "./MutationResult"

type PlaygroundResultProps = {
  code: string
}

const PlaygroundResult: React.FC<PlaygroundResultProps> = ({ code }) => {
  const queryMatch = code.match(/useQuery\s*\(\s*({[\s\S]*?})\s*\)/)

  if (queryMatch && queryMatch.length > 0)
    return <QueryResult query={queryMatch[1]} />

  const mutationMatch = code.match(/useMutation\s*\(\s*({[\s\S]*?})\s*\)/)

  if (mutationMatch) return <MutationResult mutation={mutationMatch[1]} />

  return null
}

export default PlaygroundResult
