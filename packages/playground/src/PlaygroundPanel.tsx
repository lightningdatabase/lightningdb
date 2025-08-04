import React, { useState } from "react"
import PlaygroundResult from "./PlaygroundResult"
import PlaygroundEditor from "./PlaygroundEditor"

type PlaygroundPanelProps = {
  types: string
  initialCode: string
}

const PlaygroundPanel: React.FC<PlaygroundPanelProps> = ({
  types,
  initialCode,
}) => {
  const [code, setCode] = useState(initialCode)

  return (
    <>
      <PlaygroundEditor value={code} onChange={setCode} types={types} />
      <PlaygroundResult code={code} />
    </>
  )
}

export default PlaygroundPanel
