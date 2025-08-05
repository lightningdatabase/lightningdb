import React, { useState } from "react"
import PlaygroundTabs, { Tab as TabInterface } from "./PlaygroundTabs"
import PlaygroundPanel from "./PlaygroundPanel"

export type Tab = TabInterface & {
  code: string | null
}

const INITIAL_TABS = [
  {
    id: 1,
    label: "List users",
    code: `useQuery({
    users: {
        include: {
            posts: true,
        },
        orderBy: {
            id: "asc",
        },
    },
})`,
  },
  {
    id: 2,
    label: "Create user",
    code: `useMutation({
    users: {
        create: {
            data: {
                name: "Test User",
                email: "test@example.com",
            },
        },
    },
  })`,
  },
  {
    id: 3,
    label: "List posts",
    code: `useQuery({
    posts: {},
})`,
  },
  {
    id: 4,
    label: "Create post",
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
    id: 5,
    label: "Update post",
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

type PlaygroundProps = {
  types: string
  intialTabs?: Tab[]
}

const Playground: React.FC<PlaygroundProps> = ({ types, intialTabs }) => {
  const [tabs, setTabs] = useState<Tab[]>(intialTabs ?? INITIAL_TABS)
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

  const handleChange = (t: { label: string; code: string }) => {
    if (activeTabId === null) return
    setTabs(prevTabs =>
      prevTabs.map(tab => (tab.id === activeTabId ? { ...tab, ...t } : tab)),
    )
  }

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
          onChange={handleChange}
          onCodeChange={handleCodeChange}
        />
      )}
    </>
  )
}

export default Playground
