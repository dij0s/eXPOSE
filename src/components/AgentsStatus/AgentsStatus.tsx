import { useState, useEffect } from "react";
import { useWebSocket } from "../WebsocketProvider/WebsocketProvider";
import "./AgentsStatus.css";

enum AgentStatus {
  OFF = "OFF",
  IDLE = "IDLE",
  EXECUTING = "EXECUTING",
}

interface Message {
  type?: string;
  state?: string;
}

interface AgentStatusUpdate {
  agent: string;
  status: AgentStatus;
}

const AgentStatusComponent = () => {
  const { webSocket } = useWebSocket();
  const [agentStatuses, setAgentStatuses] = useState<
    Record<string, AgentStatus>
  >({});

  useEffect(() => {
    if (!webSocket) return;

    const handleMessage = (event: MessageEvent) => {
      const message: Message = JSON.parse(event.data);

      if (message.type === "state_update" && message.state) {
        const statusUpdate: AgentStatusUpdate = {
          agent: "robot",
          status: message.state?.toUpperCase() as AgentStatus,
        };
        setAgentStatuses((prevStatus) => ({
          ...prevStatus,
          [statusUpdate.agent]: statusUpdate.status,
        }));
      }
    };

    webSocket.addEventListener("message", handleMessage);
    return () => webSocket.removeEventListener("message", handleMessage);
  }, [webSocket]);

  const getStatusClass = (
    dotStatus: AgentStatus,
    currentStatus: AgentStatus,
  ): string => {
    return `status-dot ${currentStatus === dotStatus ? "active" : ""} ${dotStatus.toLowerCase()}`;
  };

  return (
    <div className="agent-status-container">
      <h2>Robot Agents Status</h2>
      <div className="agent-status-grid">
        {Object.entries(agentStatuses).map(([agent, status]) => (
          <div key={agent} className="agent-status-card">
            <div className="agent-name">{agent}</div>
            <div className="status-line">
              <div className="status-dots">
                <div className={getStatusClass(AgentStatus.OFF, status)} />
                <div className={getStatusClass(AgentStatus.IDLE, status)} />
                <div
                  className={getStatusClass(AgentStatus.EXECUTING, status)}
                />
              </div>
              <div className="status-label">{status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentStatusComponent;
