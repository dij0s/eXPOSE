import { useState, useEffect, useRef } from "react";
import "./App.css";

// Define interfaces for the message structure
interface Message {
  id: string;
  from?: string;
  to?: string;
  body?: string;
  type?: string;
  timestamp: number;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connectWebSocket = () => {
    // If there's already a connection, don't create a new one
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    wsRef.current = new WebSocket("ws://localhost:3000/ws");

    wsRef.current.onopen = () => {
      console.log("Connected to WebSocket");
      setConnected(true);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onmessage = (event: MessageEvent) => {
      const message: Omit<Message, "id"> = JSON.parse(event.data);
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          id: Date.now() + Math.random().toString(36).substring(2, 9),
        },
      ]);
    };

    wsRef.current.onclose = () => {
      console.log("Disconnected from WebSocket");
      setConnected(false);

      // Schedule reconnection
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log("Attempting to reconnect...");
        connectWebSocket();
      }, 5000);
    };
  };

  // Initial connection
  useEffect(() => {
    connectWebSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter messages based on search input
  const filteredMessages = messages.filter(
    (msg) =>
      msg.from?.toLowerCase().includes(filter.toLowerCase()) ||
      msg.to?.toLowerCase().includes(filter.toLowerCase()) ||
      msg.body?.toLowerCase().includes(filter.toLowerCase()),
  );

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>XMPP Message Monitor</h1>
        <div className="connection-status">
          Status:{" "}
          {connected ? (
            <span className="status-connected">Connected</span>
          ) : (
            <span className="status-disconnected">Disconnected</span>
          )}
        </div>
      </header>

      <div className="controls">
        <input
          type="text"
          placeholder="Filter messages..."
          value={filter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilter(e.target.value)
          }
          className="search-input"
        />
        <button onClick={() => setMessages([])} className="clear-button">
          Clear Messages
        </button>
      </div>

      <div className="message-stats">
        Total messages: {messages.length} | Displayed: {filteredMessages.length}
      </div>

      <div className="message-container">
        {filteredMessages.length === 0 ? (
          <div className="no-messages">No messages yet</div>
        ) : (
          filteredMessages.map((msg) => (
            <div key={msg.id} className={`message-item ${msg.type || ""}`}>
              <div className="message-header">
                <span className="message-from">{msg.from}</span>
                <span className="message-arrow">→</span>
                <span className="message-to">{msg.to}</span>
                <span className="message-time">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div className="message-body">{msg.body}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default App;
