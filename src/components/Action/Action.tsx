import { BiSolidCameraOff } from "react-icons/bi";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";

import "react-toastify/dist/ReactToastify.css";
import "./Action.css";

interface ActionProps {
  agent: string;
}

function Action({ agent }: ActionProps) {
  const [isBanned, setIsBanned] = useState(false);

  const handleBanAgent = async () => {
    if (isBanned) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your_secret_token",
        },
        body: JSON.stringify({
          agent: agent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to ban agent");
      }

      const ban_timeout = data.ban_timeout;
      setIsBanned(true);
      toast.success(`Agent ${agent} banned successfully`, {
        position: "top-right",
        autoClose: 3000,
      });

      // Reset the banned state after the timeout
      setTimeout(() => {
        setIsBanned(false);
      }, ban_timeout);
    } catch (error) {
      console.error("Error banning agent:", error);
      toast.error(
        "Failed to ban agent: " +
          (error instanceof Error ? error.message : "Unknown error"),
        {
          position: "top-right",
          autoClose: 3500,
        },
      );
    }
  };

  return (
    <>
      <BiSolidCameraOff
        onClick={handleBanAgent}
        style={{
          opacity: isBanned ? 0.5 : 1,
          cursor: isBanned ? "not-allowed" : "pointer",
        }}
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        style={{ zIndex: 1 }}
      />
    </>
  );
}

export default Action;
