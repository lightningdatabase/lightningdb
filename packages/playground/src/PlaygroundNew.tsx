import React from "react"
import { Card, CardActionArea, Grid, Typography } from "@mui/material"
import CodeBlock from "./code/CodeBlock"

type Tab = {
  label: string
  code: string
}

const SAMPLE_TABS: Tab[] = [
  {
    label: "List Posts",
    code: `useQuery({
  posts: {}
  })`,
  },
]

type PlaygroundNewProps = {
  onChange: (tab: Tab) => void
}

const PlaygroundNew: React.FC<PlaygroundNewProps> = ({ onChange }) => (
  <Grid container spacing={2} sx={{ p: 5 }}>
    {SAMPLE_TABS.map((tab, index) => (
      <Grid size={4} key={index}>
        <Card elevation={0} variant="outlined">
          <CardActionArea onClick={() => onChange(tab)} sx={{ p: 3 }}>
            <Typography variant="h5" component="div" sx={{ mb: 3 }}>
              {tab.label}
            </Typography>
            <CodeBlock code={tab.code} />
          </CardActionArea>
        </Card>
      </Grid>
    ))}
  </Grid>
)

export default PlaygroundNew
