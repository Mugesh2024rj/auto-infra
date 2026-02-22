import { useState, useEffect, useRef } from 'react'

export function useWebSocket(url) {
  const [data, setData] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('Connecting')
  const ws = useRef(null)

  useEffect(() => {
    const wsUrl = url || `ws://localhost:5000`
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      setConnectionStatus('Connected')
    }

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        setData(message)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.current.onclose = () => {
      setConnectionStatus('Disconnected')
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnectionStatus('Error')
    }

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url])

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    }
  }

  return { data, connectionStatus, sendMessage }
}