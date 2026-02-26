// components/common/CountdownTimer.jsx
import { useEffect, useState } from "react";

const CountdownTimer = ({
  endTime,
  onComplete,
  labelWhenDone = "Bidding Open",
  className = "",
}) => {
  const getRemaining = () => {
    const endMs = endTime ? new Date(endTime).getTime() : 0;
    const ms = Math.max(0, endMs - Date.now());
    return ms;
  };

  const [remaining, setRemaining] = useState(getRemaining);

  // ✅ IMPORTANT: when endTime changes (server extended), reset remaining immediately
  useEffect(() => {
    setRemaining(getRemaining());
  }, [endTime]);

  // ✅ IMPORTANT: compute from endTime every tick (not from prev)
  useEffect(() => {
    const interval = setInterval(() => {
      const next = getRemaining();
      setRemaining(next);

      if (next === 0 && onComplete) onComplete();
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete]);

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