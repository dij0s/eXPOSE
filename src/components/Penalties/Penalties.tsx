import { FC, useState, useEffect } from "react";

import "./Penalties.css";

const Penalties: FC = () => {
  const [penaltiesAgent1, setPenaltiesAgent1] = useState<number>(() =>
    parseInt(localStorage.getItem("penaltiesAgent1") || "0"),
  );

  const [penaltiesAgent2, setPenaltiesAgent2] = useState<number>(() =>
    parseInt(localStorage.getItem("penaltiesAgent2") || "0"),
  );

  useEffect(() => {
    localStorage.setItem("penaltiesAgent1", penaltiesAgent1.toString());
  }, [penaltiesAgent1]);

  useEffect(() => {
    localStorage.setItem("penaltiesAgent2", penaltiesAgent2.toString());
  }, [penaltiesAgent2]);

  const handlePenaltyIncrement = (agentNumber: 1 | 2) => {
    if (agentNumber === 1) {
      setPenaltiesAgent1((prev) => prev + 1);
    } else {
      setPenaltiesAgent2((prev) => prev + 1);
    }
  };

  const handlePenaltiesReset = () => {
    setPenaltiesAgent1(0);
    setPenaltiesAgent2(0);
  };

  return (
    <>
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
      <div className="penalties-button" onClick={handlePenaltiesReset}>
        reset
      </div>
    </>
  );
};

export default Penalties;
