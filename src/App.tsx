import { useState, useEffect, useRef } from "react";
import "./App.css";

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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connectWebSocket = () => {
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    wsRef.current = new WebSocket("ws://localhost:3000/ws");

    wsRef.current.onmessage = (event: MessageEvent) => {
      const message: Omit<Message, "id"> = JSON.parse(event.data);
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          from: message.from?.split("/")[0],
          to: message.to?.split("/")[0],
          id: Date.now() + Math.random().toString(36).substring(2, 9),
        },
      ]);
    };

    wsRef.current.onclose = () => {
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connectWebSocket();
      }, 5000);
    };
  };

  useEffect(() => {
    connectWebSocket();
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

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const getUniqueAgents = () => {
    const agents = new Set<string>();
    messages.forEach((msg) => {
      if (msg.from) agents.add(msg.from);
      if (msg.to) agents.add(msg.to);
    });
    return Array.from(agents);
  };

  const isBase64 = (str: string): boolean => {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  };

  const renderMessageContent = (body: string | undefined) => {
    if (!body) return null;

    if (isBase64(body)) {
      try {
        const imageData = `data:image/png;base64,${body}`;
        return (
          <img
            src={imageData}
            alt="Message content"
            className="message-image"
            onError={() => <div className="message-body">{body}</div>}
          />
        );
      } catch {
        return <div className="message-body">{body}</div>;
      }
    }

    return <div className="message-body">{body}</div>;
  };

  // Sort all messages by timestamp
  const sortedMessages = [...messages].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  // Get the horizontal position for a message based on its chronological order
  const getMessagePosition = (messageTimestamp: number) => {
    const index = sortedMessages.findIndex(
      (msg) => msg.timestamp === messageTimestamp,
    );
    return index * 320; // 320px is the width of each message slot
  };

  return (
    <div className="timeline-container">
      <div className="timeline-content">
        {getUniqueAgents().map((agent) => (
          <div key={agent} className="timeline-row">
            <div className="agent-label">{agent}</div>
            <div className="agent-timeline">
              {messages
                .filter((msg) => msg.to === agent)
                .map((msg) => (
                  <div
                    key={msg.id}
                    className="timeline-message"
                    style={{
                      left: `${getMessagePosition(msg.timestamp)}px`,
                    }}
                  >
                    <div className="message-content">
                      <div className="message-sender">From: {msg.from}</div>
                      {renderMessageContent(msg.body)}
                      <div className="message-time">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
