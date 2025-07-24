import { useCache } from "@lightningdb/client"

const Cache: React.FC = () => {
  const { cache } = useCache()

  return <pre>{JSON.stringify(cache, null, 2)}</pre>
}

export default Cache
