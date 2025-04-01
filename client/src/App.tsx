import { useEffect } from 'react'
import { socket } from './lib/socket'
import './App.css'

function App() {
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div>
      <h1>Parido Game</h1>
    </div>
  )
}

export default App
