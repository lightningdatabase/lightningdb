import React, { useState } from "react"
import PlaygroundTabs, { Tab } from "./PlaygroundTabs"

const INITIAL_TABS: Tab[] = [
  { id: 1, label: "First Tab" },
  { id: 2, label: "Second Tab" },
  { id: 3, label: "Third Tab" },
]

export default function ChromeStyleTabs() {
  const [tabs, setTabs] = useState<Tab[]>(INITIAL_TABS)
  const [activeTab, setActiveTab] = useState<number>(1)

  const handleAddTab = () => {
    setTabs([
      ...tabs,
      {
        id: tabs.length + 1,
        label: "New Tab",
      },
    ])
  }

  const handleTabClose = (tabId: number) => {
    if (activeTab === tabId) setActiveTab(tabs[0]?.id)
    setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId))
  }

  return (
    <>
      {activeTab}
      <PlaygroundTabs
        tabs={tabs}
        activeTab={activeTab}
        onActiveTabChange={(a: number) => {
          console.log(a)
          setActiveTab(a)
        }}
        onTabAdd={handleAddTab}
        onTabClose={handleTabClose}
      />
    </>
  )
}
