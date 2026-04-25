import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface CountdownTimerProps {
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ className }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      
      const diff = midnight.getTime() - now.getTime();
      
      // 3 hours in milliseconds = 3 * 60 * 60 * 1000
      setIsUrgent(diff > 0 && diff < 10800000);

      if (diff <= 0) {
        setTimeLeft("00:00:00");
      } else {
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setTimeLeft(`${h}:${m}:${s}`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn("flex items-center gap-2 font-mono", className)}>
      <Clock className={cn(
        "w-3 h-3 animate-pulse",
        isUrgent ? "text-red-500" : "text-cyan-400"
      )} />
      <div className="flex flex-col">
        <span className={cn(
          "text-[7px] font-bold uppercase tracking-widest text-sharp",
          isUrgent ? "text-red-500/50" : "text-cyan-500/50"
        )}>
          Deadline Countdown
        </span>
        <span className={cn(
          "text-sm font-bold leading-none transition-colors duration-500",
          isUrgent ? "text-white neon-glow-red" : "text-white neon-glow-cyan"
        )}>
          {timeLeft}
        </span>
      </div>
    </div>
  );
};
