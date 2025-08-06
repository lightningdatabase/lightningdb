import React from "react"
import PlaygroundResult from "./PlaygroundResult"
import PlaygroundEditor from "./PlaygroundEditor"
import PlaygroundNew from "./PlaygroundNew"
import { Box } from "@mui/material"

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
    <Box sx={{ p: 3 }}>
      <PlaygroundEditor value={code} onChange={onCodeChange} types={types} />
      <PlaygroundResult code={code} />
    </Box>
  ) : (
    <PlaygroundNew onChange={onChange} />
  )

export default PlaygroundPanel
