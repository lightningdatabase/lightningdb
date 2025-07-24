import { Cache, CacheValue } from "../cache"

const mergeCacheValue = (cache: Cache, key: string, values: CacheValue[]) => {
  // Create a map of new values by ID for quick lookup
  const newValuesMap = new Map(values.map(value => [value.id, value]))

  // Update existing values in place if they exist, track which new values were merged
  const mergedIds = new Set<number>()
  cache[key].forEach((existing, i) => {
    const newValue = newValuesMap.get(existing.id)
    if (newValue) {
      cache[key][i] = { ...cache[key][i], ...newValue }
      mergedIds.add(existing.id)
    }
  })

  // Add any remaining new values that weren't merged
  values.forEach(value => {
    if (!mergedIds.has(value.id)) {
      cache[key].push(value)
    }
  })
}

export default mergeCacheValue
