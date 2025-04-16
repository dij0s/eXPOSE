import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  useState,
} from "react";

interface WebSocketContextValue {
  sendMessage?: (message: unknown) => void;
  webSocket: WebSocket | null;
  isConnected: boolean;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  webSocket: null,
  isConnected: false,
  error: null,
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
      const ws_url: string = import.meta.env.VITE_PROSODY_API_SERVER
        ? `ws://${import.meta.env.VITE_PROSODY_API_SERVER}/ws`
        : "ws://localhost:3000/ws";

      const ws = new WebSocket(ws_url);

      // Set up message handler before assigning to wsRef
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "initial_states" && data.states) {
            setIsConnected(true);
            setError(null);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onopen = () => {
        reconnectAttempts.current = 0; // Reset attempts on successful connection
        setIsConnected(true);
        setError(null);
      };

      ws.onclose = (event) => {
        setIsConnected(false);

        // Only attempt to reconnect if we haven't exceeded max attempts
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
    } catch (err) {
      setError(`Connection error: ${err.message}`);
    }
  };

  useEffect(() => {
    connectWebSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        // Prevent reconnection attempts during unmount
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

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
      }}
    >
      {children}
      {error && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            padding: "8px 16px",
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            border: "1px solid red",
            borderRadius: 4,
            color: "red",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}
    </WebSocketContext.Provider>
  );
};
