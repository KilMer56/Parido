import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./index.css";
import { HomePage } from "./pages/HomePage";
import { GamePage } from "./pages/GamePage";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Notification } from "./components/Notification";
import { SocketManager } from "./events/SocketManager";
import { useNotification } from "./contexts/NotificationContext";
import { GameProvider } from "./contexts/GameContext";

export function App() {
  const notificationContext = useNotification();
  const socketManager = SocketManager.getInstance();

  const navigate = useNavigate();

  useEffect(() => {
    socketManager.setNotificationContext(notificationContext);
    socketManager.setNavigate(navigate);
  }, [notificationContext, navigate, socketManager]);

  if (socketManager.isLoading) {
    return <div className="loading-text">Connecting to server...</div>;
  }
  if (socketManager.isReconnecting) {
    return <div className="loading-text">Reconnecting to game...</div>;
  }

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <GameProvider>
          <App />
        </GameProvider>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>
);

