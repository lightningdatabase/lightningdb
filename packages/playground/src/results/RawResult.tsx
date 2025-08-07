import React from "react"
import { Box, Typography } from "@mui/material"

type RawResultProps = {
  data: Record<string, Record<string, any>[] | undefined>
}

const RawResult: React.FC<RawResultProps> = ({ data }) => (
  <Box
    sx={{
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Typography variant="body2" component="pre">
      {JSON.stringify(data, null, 2)}
    </Typography>
  </Box>
)

export default RawResult
