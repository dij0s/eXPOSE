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
        <div className="panel-map-skeleton">
          <div className="skeleton-animation"></div>
        </div>
      )}
    </div>
  );
}

export default Map;
