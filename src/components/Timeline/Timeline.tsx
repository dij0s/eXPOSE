import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "../WebsocketProvider/WebsocketProvider";
import Action from "../Action/Action";
import "./Timeline.css";

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

const Timeline = () => {
  const { webSocket } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const calculateColor = (conversation_id: string) => {
    const regex = /(.+@prosody)\/?.{0,8}-(.+@prosody)/;
    const match = conversation_id.match(regex);
    const cleanConversationId = match
      ? `${match[1]},${match[2]}`
      : conversation_id;

    let hash = 0;
    for (let i = 0; i < cleanConversationId.length; i++) {
      hash = cleanConversationId.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;
    return `hsl(${hue}, 70%, 70%)`;
  };

  useEffect(() => {
    if (!webSocket) return;

    const handleMessage = (event: MessageEvent) => {
      const message: Message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsedMessage = {
          ...message,
          from: message.from?.split("/")[0],
          to: message.to?.split("/")[0],
          color: calculateColor(message.conversation_id),
        };

        setMessages((prev) => [...prev, parsedMessage]);
      }
    };

    webSocket.addEventListener("message", handleMessage);
    return () => webSocket.removeEventListener("message", handleMessage);
  }, [webSocket]);

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

  const sortedMessages = [...messages].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  const getMessagePosition = (message: Message) => {
    const messageIndex = sortedMessages.findIndex((m) => m.id === message.id);
    return messageIndex * 320;
  };

  useEffect(() => {
    if (timelineRef.current && messages.length > 0) {
      const container = timelineRef.current;
      container.scrollLeft = container.scrollWidth;
    }
  }, [messages]);

  const maxMessagePosition =
    sortedMessages.length > 0
      ? getMessagePosition(sortedMessages[sortedMessages.length - 1]) + 320
      : 0;

  const timelineWidth = Math.max(
    window.innerWidth - 80,
    maxMessagePosition + 320,
  );

  return (
    <div className="timeline-container" ref={timelineRef}>
      <div className="timeline-content" style={{ width: `${timelineWidth}px` }}>
        {getUniqueAgents().map((agent) => (
          <div
            key={agent}
            className="timeline-row"
            style={{ width: `${timelineWidth}px` }}
          >
            <div className="agent-meta">
              <div className="agent-name">{agent}</div>
              <Action agent={agent} />
            </div>
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
                      <div className="message-sender">To: {msg.to}</div>
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
  );
};

export default Timeline;
