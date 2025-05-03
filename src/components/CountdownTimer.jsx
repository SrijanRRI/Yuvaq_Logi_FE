// components/common/CountdownTimer.jsx
import { useEffect, useState } from "react";

const CountdownTimer = ({ endTime, onComplete, labelWhenDone = "Bidding Open", className = "" }) => {
  const [remaining, setRemaining] = useState(Math.max(0, new Date(endTime).getTime() - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = Math.max(0, prev - 1000);
        if (next === 0 && onComplete) onComplete();
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const formatMillis = (ms) => {
    if (ms <= 0) return labelWhenDone;
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hrs = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let result = "";
    if (days > 0) result += `${days}d `;
    if (hrs > 0 || days > 0) result += `${hrs}h `;
    if (mins > 0 || hrs > 0 || days > 0) result += `${mins}m `;
    result += `${secs}s`;

    return result;
  };

  return <span className={className}>{formatMillis(remaining)}</span>;
};

export default CountdownTimer;
