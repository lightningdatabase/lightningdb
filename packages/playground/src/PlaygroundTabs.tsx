import React, { Fragment } from "react"
import { Box, Tab, IconButton, Typography, Button } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import AddIcon from "@mui/icons-material/Add"

export interface Tab {
  id: number
  label: string
}

type PlaygroundTabsProps = {
  tabs: Tab[]
  activeTab: number | null
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
}) => {
  const activeIndex = tabs.findIndex(t => t.id === activeTab)

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "#e3e3e8",
        px: 0.25,
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id
        const nextIsActive = index + 1 === activeIndex
        const showDivider = !isActive && !nextIsActive

        return (
          <Fragment key={`${index}${tab.label}`}>
            <Box
              sx={{
                flex: 1,
                minWidth: 150,
                maxWidth: 200,
                py: 0.5,
                px: 0.25,
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
                    "& .close-btn": {
                      opacity: 1,
                    },
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
                  sx={{
                    opacity: isActive ? 1 : 0,
                    transition: "opacity 0.2s",
                  }}
                  className="close-btn"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Button>
            </Box>

            <Box
              sx={{
                width: "1px",
                height: 20,
                bgcolor: showDivider ? "divider" : "transparent",
                alignSelf: "center",
              }}
            />
          </Fragment>
        )
      })}
      <Button sx={{ minWidth: 0, ml: 0.5 }} onClick={onTabAdd}>
        <AddIcon fontSize="small" sx={{ color: "rgba(0, 0, 0, 0.5)" }} />
      </Button>
    </Box>
  )
}

export default PlaygroundTabs
