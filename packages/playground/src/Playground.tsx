import React, { useState } from "react"
import { Box, Tab } from "@mui/material"
import Query from "./Query"
import Mutation from "./Mutation"
import Cache from "./Cache"
import { TabContext, TabList, TabPanel } from "@mui/lab"

const Playground: React.FC = () => {
  const [tab, setTab] = useState("query")

  return (
    <TabContext value={tab}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <TabList
          onChange={(_, value) => setTab(value)}
          aria-label="lab API tabs example"
        >
          <Tab label="Query" value="query" />
          <Tab label="Mutation" value="mutation" />
          <Tab label="Cache" value="cache" />
        </TabList>
      </Box>
      <TabPanel value="query">
        <Query />
      </TabPanel>
      <TabPanel value="mutation">
        <Mutation />
      </TabPanel>
      <TabPanel value="cache">
        <Cache />
      </TabPanel>
    </TabContext>
  )
}

export default Playground
