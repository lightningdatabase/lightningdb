import { useDB } from "./context.js"

const useCache = () => {
  const { cache, internalCache } = useDB()
  return { cache, internalCache }
}

export default useCache
