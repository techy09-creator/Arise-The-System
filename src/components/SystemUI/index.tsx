import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface HolographicPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  accent?: 'cyan' | 'red';
  showScanlines?: boolean;
  onClick?: () => void;
}

export const HolographicPanel: React.FC<HolographicPanelProps> = ({ 
  children, 
  className, 
  title, 
  accent = 'cyan',
  showScanlines = false,
  onClick
}) => {
  const accentColor = accent === 'cyan' ? 'border-cyan-500/40' : 'border-red-500/40';
  const glowColor = accent === 'cyan' ? 'shadow-cyan-950/50' : 'shadow-red-950/50';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 5, rotateX: 2 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      onClick={onClick}
      style={{ willChange: "transform, opacity" }}
      className={cn(
        "relative overflow-hidden hologram-glass rounded-sm p-3 perspective-1000 hologram-panel-glow",
        accentColor,
        glowColor,
        onClick && "cursor-pointer hover:bg-white/[0.02] transition-colors active:scale-[0.99]",
        className
      )}
    >
      {showScanlines && <div className="absolute inset-0 scanlines opacity-[0.02] pointer-events-none z-0" />}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none z-0" />
      
      {title && (
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-1 relative z-10">
          <span className={cn(
            "text-[10px] font-bold tracking-widest uppercase text-sharp",
            accent === 'cyan' ? "text-cyan-400 hologram-glow-cyan" : "text-red-400 hologram-glow-red"
          )}>
            {title}
          </span>
          <div className="flex gap-1">
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn("w-1 h-1 rounded-full", accent === 'cyan' ? "bg-cyan-500 shadow-[0_0_5px_var(--system-accent-hex)]" : "bg-red-500 shadow-[0_0_5px_#ef4444]")} 
            />
            <div className="w-1 h-1 rounded-full bg-white/20" />
          </div>
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>

      {/* Decorative corners - simplified */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/40" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/40" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/40" />
    </motion.div>
  );
};

interface GlitchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const GlitchButton: React.FC<GlitchButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className,
  onClick,
  ...props 
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [pulses, setPulses] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const id = Date.now();
    setPulses(prev => [...prev, { id, x, y }]);
    setTimeout(() => setPulses(prev => prev.filter(p => p.id !== id)), 600);

    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 150);
    onClick?.(e);
  };

  const variants = {
    primary: "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/25 shadow-lg",
    danger: "bg-red-500/15 border-red-500/50 text-red-400 hover:bg-red-500/25 shadow-lg",
    ghost: "bg-white/5 border-white/20 text-white/80 hover:bg-white/10",
  };

  const sizes = {
    sm: "px-2 py-1 text-[10px]",
    md: "px-4 py-2 text-xs",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      style={{ willChange: "transform, opacity" }}
      className={cn(
        "relative font-bold uppercase tracking-widest border transition-all duration-200 active:scale-95 overflow-hidden text-sharp",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        isGlitching && "glitch-active",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      
      {/* Energy Pulses */}
      {pulses.map(pulse => (
        <div 
          key={pulse.id}
          className="energy-pulse"
          style={{ left: pulse.x, top: pulse.y }}
        />
      ))}

      {/* Holographic Flash */}
      <AnimatePresence>
        {isGlitching && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export const ProjectionTransition: React.FC<{ children: React.ReactNode; isVisible: boolean }> = ({ children, isVisible }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0.9, x: -5, filter: 'blur(8px)' }}
          animate={{ 
            opacity: [0, 1],
            scaleY: [0.9, 1.03, 0.98, 1],
            x: [0, -4, 4, -2, 2, 0],
            filter: ['blur(8px)', 'blur(0px)']
          }}
          exit={{ opacity: 0, scaleY: 0.9, x: 5, filter: 'blur(8px)' }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="projection-reveal overflow-visible"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const GlitchProjection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.9, x: -5, filter: 'blur(8px)' }}
      animate={{ 
        opacity: [0, 1],
        scaleY: [0.9, 1.03, 0.98, 1],
        x: [0, -4, 4, -2, 2, 0],
        filter: ['blur(8px)', 'blur(0px)']
      }}
      exit={{ opacity: 0, scaleY: 0.9, x: 5, filter: 'blur(8px)' }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ProgressBar: React.FC<{ 
  value: number; 
  max: number; 
  label?: string; 
  color?: string;
  showSegments?: boolean;
}> = ({ value = 0, max = 100, label, color = "bg-cyan-500", showSegments = true }) => {
  const percentage = Math.min(100, ((value || 0) / (max || 1)) * 100);
  
  return (
    <div className="w-full space-y-1">
      {label && (
        <div className="flex justify-between text-[10px] font-bold tracking-tight uppercase text-sharp mb-1">
          <span className="text-cyan-500/70">{label}</span>
          <span className="text-white/90">{value || 0} / {max || 100}</span>
        </div>
      )}
      <div className="relative h-2 bg-black/40 border border-white/10 overflow-hidden rounded-full">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn("absolute inset-y-0 left-0 shadow-[0_0_10px_rgba(var(--system-accent),0.5)]", color)}
        />
        {showSegments && (
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-px h-full bg-black/20" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const SystemOverlay: React.FC = () => (
  <>
    <div className="scanlines" />
    <div className="noise" />
    <div className="vignette" />
  </>
);
