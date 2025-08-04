import React from "react"
import { Card, CardActionArea, Grid, Typography } from "@mui/material"
import CodeBlock from "./code/CodeBlock"

type Tab = {
  label: string
  code: string
}

const SAMPLE_TABS: Tab[] = [
  {
    label: "List all posts",
    code: `useQuery({
    posts: {},
})`,
  },
  {
    label: "Find one post",
    code: `useQuery({
    post: {
        where: {
            id: 1,
        },
    },
})`,
  },
  {
    label: "Create a post",
    code: `useMutation({
    posts: {
        create: {
            data: {
                title: 'Post 1',
            },
        },
    },
})`,
  },
  {
    label: "Update a post",
    code: `useMutation({
    posts: {
        update: {
            where: {
                id: 1,
            },
            data: {
                title: 'New post title',
            },
        },
    },
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
        <Card elevation={0} variant="outlined" sx={{ height: "100%" }}>
          <CardActionArea
            onClick={() => onChange(tab)}
            sx={{
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "start",
            }}
          >
            <Typography variant="h5" component="div" sx={{ mb: 3 }}>
              {tab.label}
            </Typography>
            <CodeBlock code={tab.code} sx={{ width: "100%" }} />
          </CardActionArea>
        </Card>
      </Grid>
    ))}
  </Grid>
)

export default PlaygroundNew
