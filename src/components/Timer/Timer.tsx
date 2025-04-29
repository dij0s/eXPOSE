import { useState, useRef, useEffect } from "react";
import "./Timer.css";
import { useWebSocket } from "../WebsocketProvider/WebsocketProvider";

function Timer() {
  const { startTimeGlobal, startTimeDelta, globalFinish, resetTimers } =
    useWebSocket();
  const [nowGlobal, setNowGlobal] = useState<number | null>(null);
  const [nowDelta, setNowDelta] = useState<number | null>(null);

  const globalIntervalRef = useRef<number | null>(null);
  const deltaIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Stop timer updates if global is finished
    // and ensure timer synchronization with
    // backend timestamp
    if (globalFinish.isFinished) {
      if (globalIntervalRef.current !== null) {
        clearInterval(globalIntervalRef.current);
        globalIntervalRef.current = null;
      }
      if (deltaIntervalRef.current !== null) {
        clearInterval(deltaIntervalRef.current);
        deltaIntervalRef.current = null;
      }
      setNowGlobal(globalFinish.timestamp);
      setNowDelta(globalFinish.timestamp);
      return;
    }

    // Reset internal state if external timers are reset
    if (startTimeGlobal === null) {
      if (globalIntervalRef.current !== null) {
        clearInterval(globalIntervalRef.current);
        globalIntervalRef.current = null;
      }
      setNowGlobal(null);
    }
    
    if (startTimeDelta === null) {
      if (deltaIntervalRef.current !== null) {
        clearInterval(deltaIntervalRef.current);
        deltaIntervalRef.current = null;
      }
      setNowDelta(null);
    }

    // Handle global timer
    if (startTimeGlobal !== null && !globalIntervalRef.current) {
      setNowGlobal(Date.now());
      globalIntervalRef.current = setInterval(() => {
        setNowGlobal(Date.now());
      }, 10);
    }

    // Handle delta timer
    if (startTimeDelta !== null && !deltaIntervalRef.current) {
      setNowDelta(Date.now());
      deltaIntervalRef.current = setInterval(() => {
        setNowDelta(Date.now());
      }, 10);
    }

    // Cleanup function
    return () => {
      if (globalIntervalRef.current !== null) {
        clearInterval(globalIntervalRef.current);
      }
      if (deltaIntervalRef.current !== null) {
        clearInterval(deltaIntervalRef.current);
      }
    };
  }, [startTimeGlobal, startTimeDelta, globalFinish]);

  let seconds: number = 0;
  let minutes: number = 0;
  let ms: number = 0;
  if (startTimeGlobal != null && nowGlobal != null) {
    const elapsed = nowGlobal - startTimeGlobal;
    minutes = Math.floor(elapsed / 60000);
    seconds = Math.floor((elapsed % 60000) / 1000);
    ms = Math.floor((elapsed % 1000) / 10);
  }

  let secondsDelta: number = 0;
  let minutesDelta: number = 0;
  let msDelta: number = 0;
  if (startTimeDelta != null && nowDelta != null) {
    const elapsed = nowDelta - startTimeDelta;
    minutesDelta = Math.floor(elapsed / 60000);
    secondsDelta = Math.floor((elapsed % 60000) / 1000);
    msDelta = Math.floor((elapsed % 1000) / 10);
  }

  return (
    <div className="panel-timer">
      <div className="panel-timer-wrapper">
        <span className="panel-timer-count">
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}:{ms.toString().padStart(2, "0")}
        </span>
        <span className="panel-timer-count-delta">
          {minutesDelta.toString().padStart(2, "0")}:
          {secondsDelta.toString().padStart(2, "0")}:
          {msDelta.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="timer-button" onClick={resetTimers}>
        Reset
      </span>
    </div>
  );
}

export default Timer;
