import * as React from "react";
import { useRef, useEffect, useState } from "react";
import Countdown from "react-countdown";

export const RoundTimer = ({
  fightStarted = false,
  minsStart = 45,
}) => {
  const [started, setStarted] = useState(false);
  const timerEndDate = useRef(null);
  
  useEffect(() => {
    timerEndDate.current = Date.now() + (minsStart * 60000);
    setStarted(fightStarted);
  }, [fightStarted]);
  
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a completed state
      return <span className="timer-finish">00:00</span>;
    } else {
      const zeroPad = (num) => String(num).padStart(2, '0')
      const formatted = `${zeroPad(minutes)}:${zeroPad(seconds)}`;
      
      let timerClass = "";
      
      if (minutes <= 4) {
        timerClass = "timer-danger";
      } else if (minutes <= 14) {
        timerClass = "timer-warning";
      } else {
        timerClass = "";
      }
      
      return <span className={timerClass}>{formatted}</span>;
    }
  };
  
  return (
    <div>
      {started && (
       <Countdown date={timerEndDate.current} renderer={renderer} />
      )}
      {!started && <span className="timer-ready">{minsStart}:00</span>}
    </div>
  );
};