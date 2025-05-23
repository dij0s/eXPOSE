import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  useState,
} from "react";
import { Notification } from "../Notification/Notification";

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

interface TimerMessage {
  timestamp: number;
  event: string;
}

interface WebSocketContextValue {
  sendMessage?: (message: unknown) => void;
  webSocket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
  agentStatuses: Record<string, { status: string; description: string }>;
  messages: Message[];
  startTimeGlobal: number | null;
  startTimeDelta: number | null;
  globalFinish: { isFinished: boolean; timestamp: number | null };
  resetTimers: () => void;
  mazeImage: string | null;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  webSocket: null,
  isConnected: false,
  error: null,
  agentStatuses: {
    "alpha-pi-4b-agent-1": { status: "OFF", description: "OFF" },
    "alpha-pi-4b-agent-2": { status: "OFF", description: "OFF" },
  },
  messages: [], // Initialize empty messages array
  startTimeGlobal: null,
  startTimeDelta: null,
  globalFinish: { isFinished: false, timestamp: null },
  resetTimers: () => {},
  mazeImage: null,
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const [messages, setMessages] = useState<Message[]>([]); // Add messages state

  const [startTimeGlobal, setStartTimeGlobal] = useState<number | null>(null);
  const [startTimeDelta, setStartTimeDelta] = useState<number | null>(null);
  const [globalFinish, setGlobalFinish] = useState<{
    isFinished: boolean;
    timestamp: number | null;
  }>({ isFinished: false, timestamp: null });

  const resetTimers = () => {
    setStartTimeGlobal(null);
    setStartTimeDelta(null);
    setGlobalFinish({ isFinished: false, timestamp: null });
  };

  const [mazeImage, setMazeImage] = useState<string | null>(null);

  const [agentStatuses, setAgentStatuses] = useState<
    Record<string, { status: string; description: string }>
  >({
    "alpha-pi-4b-agent-1": { status: "OFF", description: "OFF" },
    "alpha-pi-4b-agent-2": { status: "OFF", description: "OFF" },
  });

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

    try {
      const ws_url: string = import.meta.env.VITE_BACKEND_HOST
        ? `ws://${import.meta.env.VITE_BACKEND_HOST}:3000/ws`
        : `ws://${window.location.hostname}:3000/ws`;

      const ws = new WebSocket(ws_url);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle different message types
          if (data.type === "initial_states" && data.states) {
            setAgentStatuses(data.states);
          } else if (data.type === "state_update" && data.state) {
            const stateUpper = data.state.toUpperCase();
            setAgentStatuses((prev) => ({
              ...prev,
              [data.agent_jid]: {
                status: stateUpper,
                description: `${stateUpper} ${data.label}`,
              },
            }));
          } else if (data.type === "chat") {
            // Handle chat messages
            const parsedMessage = {
              ...data,
              from: data.from?.split("/")[0],
              to: data.to?.split("/")[0],
              color: calculateColor(data.conversation_id),
            };
            setMessages((prev) => [...prev, parsedMessage]);
          } else if (data.type === "timer") {
            const msg: TimerMessage = data.data;

            // handle message event type
            if (msg.event === "global_start") {
              // Reset all timers before starting a new global timer
              setStartTimeDelta(null);
              setGlobalFinish({ isFinished: false, timestamp: null });
              // Set the new global start time
              setStartTimeGlobal(msg.timestamp);
            } else if (msg.event === "delta_start") {
              setStartTimeDelta(msg.timestamp);
            } else if (msg.event === "global_end") {
              setGlobalFinish({ isFinished: true, timestamp: msg.timestamp });
            }
          } else if (data.type === "maze_plan") {
            setMazeImage(data.image);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onopen = () => {
        reconnectAttempts.current = 0;
        setIsConnected(true);
        setError(null);
      };

      ws.onclose = () => {
        setIsConnected(false);

        if (reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            10000,
          );
          reconnectAttempts.current += 1;

          setError(
            `Connection closed. Reconnecting in ${timeout / 1000} seconds...`,
          );
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connectWebSocket();
          }, timeout);
        } else {
          setError(
            "Connection failed after maximum retry attempts. Please refresh the page.",
          );
        }
      };

      wsRef.current = ws;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Connection error: ${errorMessage}`);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const sendMessage = (message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  return (
    <WebSocketContext.Provider
      value={{
        webSocket: wsRef.current,
        sendMessage,
        isConnected,
        error,
        agentStatuses,
        messages,
        startTimeGlobal,
        startTimeDelta,
        globalFinish,
        resetTimers,
        mazeImage,
      }}
    >
      {children}
      {error && <Notification message={error} type="error" />}
    </WebSocketContext.Provider>
  );
};
