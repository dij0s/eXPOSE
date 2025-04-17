import { BiSolidCameraOff } from "react-icons/bi";
import { useState, useEffect } from "react";
import { Notification } from "../Notification/Notification";
import "./Action.css";

interface ActionProps {
  agent: string;
}

function Action({ agent }: ActionProps) {
  const [isBanned, setIsBanned] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleBanAgent = async () => {
    if (isBanned) {
      return;
    }

    try {
      const ban_endpoint: string = import.meta.env.VITE_BACKEND_HOST
        ? `http://${import.meta.env.VITE_BACKEND_HOST}:3000/api/ban`
        : `http://${window.location.hostname}:3000/api/ban`;
      const response = await fetch(ban_endpoint, {
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
      setNotification({
        message: `Agent ${agent} banned successfully`,
        type: "success",
      });

      // Reset the banned state after the timeout
      setTimeout(() => {
        setIsBanned(false);
      }, ban_timeout);
    } catch (error) {
      console.error("Error banning agent:", error);
      setNotification({
        message:
          "Failed to ban agent: " +
          (error instanceof Error ? error.message : "Unknown error"),
        type: "error",
      });
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
      {notification && (
        <Notification message={notification.message} type={notification.type} />
      )}
    </>
  );
}

export default Action;
