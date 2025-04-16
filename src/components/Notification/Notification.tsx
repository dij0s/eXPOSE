interface NotificationProps {
  message: string;
  type: "error" | "success";
}

export const Notification = ({ message, type }: NotificationProps) => {
  const backgroundColor =
    type === "error" ? "rgba(255, 0, 0, 0.1)" : "rgba(0, 255, 0, 0.1)";
  const borderColor = type === "error" ? "red" : "green";
  const textColor = type === "error" ? "red" : "green";

  return (
    <div
      style={{
        position: "fixed",
        ...(type === "error" ? { bottom: 16 } : { top: 16 }),
        right: 16,
        padding: "8px 16px",
        backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        color: textColor,
        fontSize: 14,
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  );
};
