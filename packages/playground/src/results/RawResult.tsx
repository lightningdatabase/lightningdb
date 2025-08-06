import React from "react"
import { QueryResponse } from "../../../client/dist/types"
import { ModelsType } from "../../../client/dist/context"
import { Box, Typography } from "@mui/material"

type RawResultProps = {
  data: Partial<QueryResponse<any, ModelsType, ModelsType>>
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
