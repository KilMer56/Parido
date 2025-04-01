import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { HomePage } from './pages/HomePage'
import { GamePage } from './pages/GamePage'
import { NotificationProvider } from './contexts/NotificationContext'
import { Notification } from './components/Notification'
import { SocketManager } from './events/SocketManager'
import { useNotification } from './contexts/NotificationContext'

function App() {
  const notificationContext = useNotification();
  
  // Set up socket manager with notification context
  useEffect(() => {
    const socketManager = SocketManager.getInstance();
    socketManager.setNotificationContext(notificationContext);
  }, [notificationContext]);

  return (
    <>
      <Notification />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:gameId" element={<GamePage />} />
      </Routes>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
)
