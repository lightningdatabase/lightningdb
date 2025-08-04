import React from "react"
import PlaygroundResult from "./PlaygroundResult"
import PlaygroundEditor from "./PlaygroundEditor"
import PlaygroundNew from "./PlaygroundNew"

type PlaygroundPanelProps = {
  types: string
  code: string | null
  onChange: (tab: { label: string; code: string }) => void
  onCodeChange: (code: string) => void
}

const PlaygroundPanel: React.FC<PlaygroundPanelProps> = ({
  types,
  code,
  onChange,
  onCodeChange,
}) =>
  code ? (
    <>
      <PlaygroundEditor value={code} onChange={onCodeChange} types={types} />
      <PlaygroundResult code={code} />
    </>
  ) : (
    <PlaygroundNew onChange={onChange} />
  )

export default PlaygroundPanel
