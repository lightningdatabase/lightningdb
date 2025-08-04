import React, { useState } from "react"
import PlaygroundTabs, { Tab as TabInterface } from "./PlaygroundTabs"
import PlaygroundEditor from "./PlaygroundEditor"
import PlaygroundResult from "./PlaygroundResult"

type Tab = TabInterface & {
  code: string
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
  const [activeTabId, setActiveTabId] = useState<number | null>(1)

  const handleAddTab = () => setActiveTabId(null)

  const handleTabClose = (tabId: number) => {
    if (activeTabId === tabId) setActiveTabId(tabs[0]?.id)
    setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId))
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
      {activeTab ? (
        <>
          <PlaygroundEditor
            value={activeTab.code}
            onChange={handleCodeChange}
            types={types}
          />
          <PlaygroundResult code={activeTab.code} />
        </>
      ) : (
        <>New</>
      )}
    </>
  )
}

export default Playground
