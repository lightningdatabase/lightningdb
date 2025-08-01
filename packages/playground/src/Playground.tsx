import React, { useState } from "react"
import PlaygroundResult from "./PlaygroundResult"
import PlaygroundEditor from "./PlaygroundEditor"

type PlaygroundProps = {
  types: string
  initialCode: string
}

const Playground: React.FC<PlaygroundProps> = ({ types, initialCode }) => {
  const [code, setCode] = useState(initialCode)

  return (
    <>
      <PlaygroundEditor value={code} onChange={setCode} types={types} />
      <PlaygroundResult code={code} />
    </>
  )
}

export default Playground
