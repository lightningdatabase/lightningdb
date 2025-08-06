import React, { useState } from "react"
import { QueryResponse } from "../../../client/dist/types"
import { ModelsType } from "../../../client/dist/context"
import { Box, Tab, Tabs } from "@mui/material"
import RawResult from "./RawResult"
import TableResult from "./TableResult"

type ResultDisplayProps = {
  data: Partial<QueryResponse<any, ModelsType, ModelsType>>
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data }) => {
  const tabKeys = Object.keys(data)
  const [activeTab, setActiveTab] = useState<string | null>(tabKeys[0])

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          display: "flex",
          "& .MuiTabs-flexContainer": {
            flexGrow: 1,
            display: "flex",
          },
        }}
      >
        {tabKeys.map(tab => (
          <Tab key={tab} label={tab} value={tab} />
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <Tab label="Raw" value={null} />
      </Tabs>

      {activeTab ? (
        <TableResult data={data[activeTab]} />
      ) : (
        <RawResult data={data} />
      )}
    </Box>
  )
}

export default ResultDisplay
