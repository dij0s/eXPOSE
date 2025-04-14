import { useState, useEffect } from "react";
import { useWebSocket } from "../WebsocketProvider/WebsocketProvider";
// import "./AgentStatus.css";

enum AgentStatus {
  OFF = "OFF",
  IDLE = "IDLE",
  EXECUTING = "EXECUTING",
}

interface Message {
  type?: string;
  body?: string;
}

interface AgentStatusUpdate {
  agent: string;
  status: AgentStatus;
}

function AgentStatusComponent() {
  const { webSocket } = useWebSocket();
  const [agentStatuses, setAgentStatuses] = useState<
    Record<string, AgentStatus>
  >({});

  useEffect(() => {
    if (!webSocket) return;

    const handleMessage = (event: MessageEvent) => {
      const message: Message = JSON.parse(event.data);

      if (message.type === "state_update" && message.body) {
        const statusUpdate: AgentStatusUpdate = JSON.parse(message.body);
        setAgentStatuses((prevStatus) => ({
          ...prevStatus,
          [statusUpdate.agent]: statusUpdate.status,
        }));
      }
    };

    webSocket.addEventListener("message", handleMessage);
    return () => webSocket.removeEventListener("message", handleMessage);
  }, [webSocket]);

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.OFF:
        return "#ff4444";
      case AgentStatus.IDLE:
        return "#ffeb3b";
      case AgentStatus.EXECUTING:
        return "#4caf50";
      default:
        return "#gray";
    }
  };

  return (
    <div className="agent-status-container">
      <h2>Robot Agents Status</h2>
      <div className="agent-status-grid">
        {Object.entries(agentStatuses).map(([agent, status]) => (
          <div key={agent} className="agent-status-card">
            <div className="agent-name">{agent}</div>
            <div
              className="status-indicator"
              style={{
                backgroundColor: getStatusColor(status),
              }}
            />
            <div className="agent-status">{status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AgentStatusComponent;
