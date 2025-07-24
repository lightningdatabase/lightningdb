import { useCallback, useEffect, useRef } from "react"

type WebSocketConfig = {
  url: string
  onMessage: (data: unknown) => void
}

export function useWebSocket({ url, onMessage }: WebSocketConfig) {
  const websocketRef = useRef<WebSocket | null>(null)
  const messageQueueRef = useRef<string[]>([])

  const connect = useCallback(
    (url: string) => {
      if (!websocketRef.current) {
        websocketRef.current = new WebSocket(url)
        websocketRef.current.onopen = () => {
          console.log("Connected to", url)

          if (messageQueueRef.current.length > 0)
            console.log("Sending queued messages", messageQueueRef.current)
          messageQueueRef.current.forEach(message =>
            websocketRef.current?.send(message),
          )

          messageQueueRef.current = [] // Clear the queue after sending
        }
        websocketRef.current.onmessage = event => {
          try {
            const parsedData = JSON.parse(event.data)
            onMessage(parsedData)
          } catch (e) {
            onMessage(event.data)
          }
        }
        websocketRef.current.onclose = () => {
          console.log("Disconnected from", url)
          websocketRef.current = null
          // Attempt to reconnect after 10 seconds
          setTimeout(() => connect(url), 10000)
        }
        websocketRef.current.onerror = error => {
          console.error("WebSocket error:", error)
        }
      }
    },
    [onMessage],
  )

  useEffect(() => {
    connect(url)
  }, [url])

  const isConnected = websocketRef.current?.readyState === WebSocket.OPEN

  const sendMessage = useCallback(
    (message: string) => {
      try {
        if (isConnected && websocketRef.current) {
          websocketRef.current.send(message)
        } else {
          messageQueueRef.current.push(message)
          console.log("Message queued for later sending:", message)
        }
      } catch (error) {
        // If sending fails for any reason, queue the message
        messageQueueRef.current.push(message)
        console.log("Failed to send message, queued for retry:", message)
      }
    },
    [isConnected],
  )

  return {
    sendMessage,
    isConnected,
  }
}
