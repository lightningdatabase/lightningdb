import React, { useState } from "react"
import PlaygroundTabs, { Tab as TabInterface } from "./PlaygroundTabs"
import PlaygroundEditor from "./PlaygroundEditor"
import PlaygroundResult from "./PlaygroundResult"
import PlaygroundPanel from "./PlaygroundPanel"

type Tab = TabInterface & {
  code: string | null
}

const INITIAL_TABS = [
  { id: 1, label: "First Tab", code: "" },
  { id: 2, label: "Second Tab", code: "" },
  { id: 3, label: "Third Tab", code: "" },
]

type PlaygroundProps = {
  types: string
}

const Playground: React.FC<PlaygroundProps> = ({ types }) => {
  const [tabs, setTabs] = useState<Tab[]>(INITIAL_TABS)
  const [activeTabId, setActiveTabId] = useState<number>(1)

  const handleAddTab = () => {
    setTabs([
      ...tabs,
      {
        id: tabs.length + 1,
        label: "New Tab",
        code: null,
      },
    ])
    setActiveTabId(tabs.length + 1)
  }

  const handleTabClose = (tabId: number) => {
    setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId))
    if (activeTabId === tabId) setActiveTabId(tabs[0]?.id)
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  const handleCodeChange = (code: string) => {
    if (activeTabId === null) return
    setTabs(prevTabs =>
      prevTabs.map(tab => (tab.id === activeTabId ? { ...tab, code } : tab)),
    )
  }

  return (
    <>
      <PlaygroundTabs
        tabs={tabs}
        activeTab={activeTabId}
        onActiveTabChange={(a: number) => {
          console.log(a)
          setActiveTabId(a)
        }}
        onTabAdd={handleAddTab}
        onTabClose={handleTabClose}
      />
      {activeTab && (
        <PlaygroundPanel
          types={types}
          code={activeTab.code}
          onCodeChange={handleCodeChange}
        />
      )}
    </>
  )
}

export default Playground
