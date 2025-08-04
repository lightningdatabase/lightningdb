import React, { useState } from "react"
import PlaygroundResult from "./PlaygroundResult"
import PlaygroundEditor from "./PlaygroundEditor"

type PlaygroundPanelProps = {
  types: string
  code: string | null
  onCodeChange: (code: string) => void
}

const PlaygroundPanel: React.FC<PlaygroundPanelProps> = ({
  types,
  code,
  onCodeChange,
}) =>
  code ? (
    <>
      <PlaygroundEditor value={code} onChange={onCodeChange} types={types} />
      <PlaygroundResult code={code} />
    </>
  ) : (
    <>New</>
  )

export default PlaygroundPanel
