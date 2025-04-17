import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";
import { HomePage } from "./pages/HomePage";
import { GamePage } from "./pages/GamePage";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Notification } from "./components/Notification";
import { SocketManager } from "./events/SocketManager";
import { useNotification } from "./contexts/NotificationContext";
import Logger from "./utils/logger";
import { SOCKET_URL } from "./constants";
import { GameProvider } from "./contexts/GameContext";

function App() {
  const notificationContext = useNotification();
  const navigate = useNavigate();

  // Check game existence on reload
  useEffect(() => {
    const checkGameExistence = async () => {
      const gameId = localStorage.getItem("gameId");
      if (gameId) {
        Logger.info("Checking game existence:", gameId);
        try {
          const response = await axios.get(`${SOCKET_URL}/game/${gameId}`);
          if (response.status === 200) {
            Logger.info("Game exists, redirecting to game page:", gameId);
            navigate(`/${gameId}`);
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            Logger.error("Game not found (404), redirecting to home:", error);
          } else {
            Logger.error(
              "An error occurred while checking game existence:",
              error
            );
          }
          localStorage.removeItem("gameId");
          localStorage.removeItem("username");
          navigate("/");
        }
      }
    };

    checkGameExistence();
  }, [navigate]);

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

