import { FC, useState } from "react";

import "./Penalties.css";

const Penalties: FC = () => {
  const [penaltiesAgent1, setPenaltiesAgent1] = useState<number>(0);
  const [penaltiesAgent2, setPenaltiesAgent2] = useState<number>(0);

  const handlePenaltyIncrement = (agentNumber: 1 | 2) => {
    if (agentNumber === 1) {
      setPenaltiesAgent1((prev) => prev + 1);
    } else {
      setPenaltiesAgent2((prev) => prev + 1);
    }
  };

  return (
    <div className="penalties-container">
      <div className="penalties-agent">
        <div
          className="penalties-button"
          onClick={() => handlePenaltyIncrement(1)}
        >
          Add penalty
        </div>
        <div>Penalty score: {penaltiesAgent1}</div>
      </div>
      <div className="penalties-agent">
        <div
          className="penalties-button"
          onClick={() => handlePenaltyIncrement(2)}
        >
          Add penalty
        </div>
        <div>Penalty score: {penaltiesAgent2}</div>
      </div>
    </div>
  );
};

export default Penalties;
