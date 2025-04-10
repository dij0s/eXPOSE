import { useState, useEffect, useRef } from "react";
import "./App.css";

interface Message {
  id: string;
  from?: string;
  to?: string;
  body?: string;
  type?: string;
  timestamp: number;
  direction: "sent" | "received";
  conversation_id: string;
  color?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

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

    const ws_url: string =
      import.meta.env.VITE_WS_SERVER || "ws://192.168.237.57:3000/ws";
    wsRef.current = new WebSocket(ws_url);

    wsRef.current.onmessage = (event: MessageEvent) => {
      const message: Message = JSON.parse(event.data);

      // Calculate color from conversation_id
      let hash = 0;
      for (let i = 0; i < message.conversation_id.length; i++) {
        hash = message.conversation_id.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = hash % 360;

      const parsedMessage = {
        ...message,
        from: message.from?.split("/")[0],
        to: message.to?.split("/")[0],
        color: `hsl(${hue}, 70%, 70%)`, // Store the computed color
      };

      setMessages((prev) => [...prev, parsedMessage]);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectedImageId &&
        !(event.target as Element).closest(".image-attached")
      ) {
        setSelectedImageId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [selectedImageId]);

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const getUniqueAgents = () => {
    const agents = new Set<string>();
    messages.forEach((msg) => {
      // Only add the sender (from) to create timelines
      if (msg.from) agents.add(msg.from);
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

  const renderMessageContent = (
    body: string | undefined,
    messageId: string,
  ) => {
    if (!body) return null;

    if (isBase64(body)) {
      try {
        const imageData = `data:image/png;base64,${body}`;
        return (
          <>
            <div
              className="message-body image-attached"
              onClick={() =>
                setSelectedImageId(
                  selectedImageId === messageId ? null : messageId,
                )
              }
            >
              IMAGE
            </div>
            <img
              src={imageData}
              alt="Message content"
              className={`message-image ${selectedImageId === messageId ? "show" : ""}`}
              onError={() => <div className="message-body">{body}</div>}
            />
          </>
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
  const getMessagePosition = (message: Message) => {
    // Find index in global sorted timeline
    const messageIndex = sortedMessages.findIndex((m) => m.id === message.id);
    return messageIndex * 320; // Use your message width (300px + margin)
  };

  useEffect(() => {
    if (timelineRef.current && messages.length > 0) {
      const container = timelineRef.current;
      container.scrollLeft = container.scrollWidth;
    }
  }, [messages]);

  const maxMessagePosition =
    sortedMessages.length > 0
      ? getMessagePosition(sortedMessages[sortedMessages.length - 1]) + 320 // Add one message width
      : 0;

  const timelineWidth = Math.max(
    window.innerWidth - 80,
    maxMessagePosition + 320,
  );

  return (
    <>
      <div className="header">eXPOSE</div>
      <div className="stats-container"></div>
      <div className="timeline-container" ref={timelineRef}>
        <div
          className="timeline-content"
          style={{ width: `${timelineWidth}px` }}
        >
          {getUniqueAgents().map((agent) => (
            <div
              key={agent}
              className="timeline-row"
              style={{ width: `${timelineWidth}px` }}
            >
              <div className="agent-label">{agent}</div>
              <div className="agent-timeline">
                {messages
                  .filter((msg) => msg.from === agent)
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className="timeline-message"
                      style={{
                        left: `${getMessagePosition(msg)}px`,
                      }}
                    >
                      <div
                        className="message-content"
                        style={{
                          borderLeft: `4px solid ${msg.color}`,
                        }}
                      >
                        <div className="message-sender">
                          <div className="message-sender">To: {msg.to}</div>
                        </div>
                        {renderMessageContent(msg.body, msg.id)}
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
    </>
  );
}

export default App;
