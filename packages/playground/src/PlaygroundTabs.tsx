import React from "react"
import { Box, Tabs, Tab, IconButton, Typography, Button } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import AddIcon from "@mui/icons-material/Add"

export interface Tab {
  id: number
  label: string
}

type PlaygroundTabsProps = {
  tabs: Tab[]
  activeTab: number
  onActiveTabChange: (tabId: number) => void
  onTabClose: (tab: number) => void
  onTabAdd: () => void
}

const PlaygroundTabs: React.FC<PlaygroundTabsProps> = ({
  tabs,
  activeTab,
  onActiveTabChange,
  onTabClose,
  onTabAdd,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      bgcolor: "#e3e3e8",
    }}
  >
    {tabs.map((tab, index) => {
      const isActive = activeTab === tab.id
      const nextIsActive = index + 1 === activeTab
      const showDivider =
        !isActive &&
        ((!nextIsActive && index < tabs.length - 1) ||
          index === tabs.length - 1)

      return (
        <Box
          key={`${index}${tab.label}`}
          sx={{
            flex: 1,
            minWidth: 150,
            maxWidth: 200,
            padding: 0.5,
            borderRight: showDivider
              ? "1px solid rgba(0, 0, 0, 0.12)"
              : undefined,
          }}
        >
          <Button
            fullWidth
            onClick={() => onActiveTabChange(tab.id)}
            sx={{
              p: 0,
              pl: 1.5,
              justifyContent: "flex-start",
              bgcolor: isActive ? "white" : "transparent",
              "&:hover": {
                bgcolor: isActive ? "white" : "rgba(0, 0, 0, 0.05)",
              },
              display: "flex",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "black",
                fontWeight: "normal",
                textTransform: "none",
                textAlign: "left",
                flexGrow: 1,
              }}
            >
              {tab.label}
            </Typography>
            <IconButton
              size="small"
              component="div"
              onClick={e => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Button>
        </Box>
      )
    })}
    <Button sx={{ minWidth: 0, ml: 0.5 }} onClick={onTabAdd}>
      <AddIcon fontSize="small" sx={{ color: "rgba(0, 0, 0, 0.5)" }} />
    </Button>
  </Box>
)

export default PlaygroundTabs
