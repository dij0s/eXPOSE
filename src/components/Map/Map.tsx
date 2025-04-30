import { useWebSocket } from "../WebsocketProvider/WebsocketProvider";

import "./Map.css";

function Map() {
  const { mazeImage } = useWebSocket();
  return (
    <div className="panel-map-wrapper">
      {mazeImage ? (
        <img
          className="panel-map-image"
          src={`data:image/png;base64,${mazeImage}`}
        />
      ) : (
        <div className="panel-map-backoff">
          <span>Awaiting maze plan</span>
        </div>
      )}
    </div>
  );
}

export default Map;
