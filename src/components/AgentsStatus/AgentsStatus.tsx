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
  agent_jid: string;
  label: string;
}

interface AgentStatusUpdate {
  agent: string;
  status: AgentStatus;
  description: string;
}

const AgentStatusComponent = () => {
  const { webSocket } = useWebSocket();
  const [agentStatuses, setAgentStatuses] = useState<
    Record<string, { status: AgentStatus; description: string }>
  >({
    "alpha-pi-4b-agent-1": { status: AgentStatus.OFF, description: "OFF" },
    "alpha-pi-4b-agent-2": { status: AgentStatus.OFF, description: "OFF" },
  });

  useEffect(() => {
    if (!webSocket) return;

    const handleMessage = (event: MessageEvent) => {
      const message: Message = JSON.parse(event.data);
      console.log(message);

      if (message.type === "state_update" && message.state) {
        const statusUpdate: AgentStatusUpdate = {
          agent: message.agent_jid,
          status: message.state?.toUpperCase() as AgentStatus,
          description: `${message.state?.toUpperCase()} ${message.label}`,
        };
        setAgentStatuses((prevStatus) => ({
          ...prevStatus,
          [statusUpdate.agent]: {
            status: statusUpdate.status,
            description: statusUpdate.description,
          },
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
      <div className="agent-status-grid">
        {Object.entries(agentStatuses).map(
          ([agent, { status, description }]) => (
            <div key={agent} className="agent-status-card">
              <div className="agent-label">{agent}</div>
              <div className="status-line">
                <div className="status-dots">
                  <div className={getStatusClass(AgentStatus.OFF, status)} />
                  <div className={getStatusClass(AgentStatus.IDLE, status)} />
                  <div
                    className={getStatusClass(AgentStatus.EXECUTING, status)}
                  />
                </div>
                <div className="status-label">{description}</div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default AgentStatusComponent;
