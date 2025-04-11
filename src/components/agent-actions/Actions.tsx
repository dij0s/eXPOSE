function Actions() {
  const handleBanAgent = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your_secret_token",
        },
        body: JSON.stringify({
          agent: "calibration_agent@prosody",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to ban agent");
      }
    } catch (error) {
      console.error("Error banning agent:", error);
      alert(
        "Failed to ban agent: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  return (
    <div className="actions-container">
      <button className="action-button" onClick={handleBanAgent}>
        Ban Calibration Agent
      </button>
    </div>
  );
}

export default Actions;
