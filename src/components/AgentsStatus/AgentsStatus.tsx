import { useWebSocket } from "../WebsocketProvider/WebsocketProvider";
import "./AgentsStatus.css";

enum AgentStatus {
  OFF = "OFF",
  IDLE = "IDLE",
  EXECUTING = "EXECUTING",
}

const AgentStatusComponent = () => {
  const { agentStatuses } = useWebSocket();

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
                  <div
                    className={getStatusClass(
                      AgentStatus.OFF,
                      status as AgentStatus,
                    )}
                  />
                  <div
                    className={getStatusClass(
                      AgentStatus.IDLE,
                      status as AgentStatus,
                    )}
                  />
                  <div
                    className={getStatusClass(
                      AgentStatus.EXECUTING,
                      status as AgentStatus,
                    )}
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
