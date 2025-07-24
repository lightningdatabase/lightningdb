import { useEffect, useState } from "react"

const useLocalState = <T = any>(
  key: string,
  initial: T,
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = window.localStorage.getItem(key)
      if (saved) {
        return JSON.parse(saved)
      }
    }

    return initial
  })

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      if (value !== undefined && value !== null) {
        window.localStorage.setItem(key, JSON.stringify(value))
      } else {
        window.localStorage.removeItem(key)
      }
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalState
