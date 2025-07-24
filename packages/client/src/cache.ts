import { useState } from "react"

export type CacheValue = Record<string, any>

export type Cache = Record<string, CacheValue[]>

const useCache = (
  defaultValue?: Cache,
): {
  cache: Cache
  internalCache: Cache
  updateCache: React.Dispatch<React.SetStateAction<Cache>>
  removeCache: (deletes: Record<string, (number | string)[]>) => void
} => {
  const [internalCache, setInternalCache] = useState<Cache>(defaultValue ?? {})

  const updateCache: React.Dispatch<React.SetStateAction<Cache>> =
    setInternalCache

  const removeCache = (deletes: Record<string, (number | string)[]>) =>
    setInternalCache(prev => {
      const newCache = { ...prev }

      Object.entries(deletes).forEach(([key, ids]) => {
        newCache[key] = newCache[key].filter(item => !ids.includes(item.id))
      })

      return newCache
    })

  const cache = internalCache

  return {
    cache,
    internalCache,
    updateCache,
    removeCache,
  }
}

export default useCache
