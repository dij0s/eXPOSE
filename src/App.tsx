import { useState, useEffect } from "react";
import { WebSocketProvider } from "./components/WebsocketProvider/WebsocketProvider";

import Timeline from "./components/Timeline/Timeline";
import AgentsStatus from "./components/AgentsStatus/AgentsStatus";
import Penalties from "./components/Penalties/Penalties";

import "./App.css";

function App() {
  const [prosodyStatus, setProsodyStatus] = useState<boolean | null>(true);

  useEffect(() => {
    const status_endpoint: string = import.meta.env.VITE_BACKEND_HOST
      ? `http://${import.meta.env.VITE_BACKEND_HOST}/api/status`
      : `http://${window.location.hostname}:3000/api/status`;
    const fetchStatus = async () => {
      try {
        const response = await fetch(status_endpoint);
        if (response.ok) {
          setProsodyStatus(true);
        } else {
          setProsodyStatus(false);
        }
      } catch (error) {
        console.error("Failed to fetch status:", error);
        setProsodyStatus(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <WebSocketProvider>
      <div className="header">
        <div>eXPOSE</div>
        <div id="header-status">
          {prosodyStatus
            ? "prosody server running"
            : "prosody server not available, check connectivity"}
        </div>
      </div>
      <div className="panel-container">
        <div className="panel-map"></div>
        <div className="panel-meta">
          <div className="panel-timer"></div>
          <AgentsStatus />
          <div className="panel-penalties">
            <Penalties />
          </div>
        </div>
      </div>
      <Timeline />
    </WebSocketProvider>
  );
}

export default App;
