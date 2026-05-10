import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface MicButtonProps {
  isConnected: boolean;
  onClick: () => void;
  error?: string | null;
}

export default function MicButton({ isConnected, onClick, error }: MicButtonProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full mt-auto pt-12 pb-6">
      <button 
        onClick={onClick}
        aria-label={isConnected ? "Désactiver le microphone" : "Activer le microphone"}
        title={isConnected ? "Appuyez pour arrêter" : "Appuyez pour parler"}
        className={`relative flex items-center justify-center w-24 h-24 glass-panel rounded-full hover:border-primary/40 transition-all duration-300 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-primary/50 ${isConnected ? 'bg-primary/20 border-primary/40' : 'hover:bg-primary/10'}`}
      >
        {/* Ping effect behind the button */}
        {isConnected && <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-[ping_2s_infinite] opacity-60"></div>}
        {!isConnected && <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-[ping_3s_infinite] opacity-40"></div>}
        
        {/* The microphone icon with subtle scale pulsing */}
        <motion.div
           animate={{ scale: isConnected ? [1, 1.15, 1] : [1, 1.1, 1] }}
           transition={{ repeat: Infinity, duration: isConnected ? 2 : 3, ease: "easeInOut" }}
        >
          {isConnected ? (
            <Mic size={32} className="text-primary drop-shadow-[0_0_8px_rgba(125,211,252,0.8)]" strokeWidth={2} />
          ) : (
            <Mic size={32} className="text-primary" strokeWidth={1.5} />
          )}
        </motion.div>
      </button>

      {error ? (
        <span className="text-red-400 text-xs font-semibold flex items-center gap-1">
          <AlertCircle size={14} /> {error}
        </span>
      ) : (
        <span className={`text-xs uppercase tracking-[0.3em] font-semibold transition-colors duration-300 ${isConnected ? 'text-primary' : 'text-slate-400'}`}>
          {isConnected ? 'Listening...' : 'Tap to Speak'}
        </span>
      )}
    </div>
  );
}
