import { useState, useRef } from "react";
import "./Timer.css";

function Timer() {
  const [startTimeGlobal, setStartTimeGlobal] = useState<number | null>(null);
  const [startTimeDelta, setStartTimeDelta] = useState<number | null>(null);
  const [nowGlobal, setNowGlobal] = useState<number | null>(null);
  const [nowDelta, setNowDelta] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  function handleStartGlobal() {
    // Clear any existing timer
    clearInterval(intervalRef.current!);

    // Reset delta timer
    setStartTimeDelta(null);
    setNowDelta(null);

    // Start global timer
    const now = Date.now();
    setStartTimeGlobal(now);
    setNowGlobal(now);

    intervalRef.current = setInterval(() => {
      setNowGlobal(Date.now());
    }, 10);
  }

  function handleStartDelta() {
    // Clear any existing timer
    clearInterval(intervalRef.current!);

    // Stop global timer by freezing its current value
    setNowGlobal(nowGlobal);

    // Start delta timer
    const now = Date.now();
    setStartTimeDelta(now);
    setNowDelta(now);

    intervalRef.current = setInterval(() => {
      setNowDelta(Date.now());
    }, 10);
  }

  function handleStopDelta() {
    // Clear any existing timer
    clearInterval(intervalRef.current!);

    // Stop delta timer by freezing its current value
    setNowDelta(nowDelta);
  }

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
      <div onClick={handleStartGlobal}>global</div>
      <div onClick={handleStartDelta}>delta</div>
      <div onClick={handleStopDelta}>stop</div>
    </div>
  );
}

export default Timer;
