import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface MicButtonProps {
  isRecording: boolean;
  isSpeaking: boolean;
  onClick: () => void;
  error?: string | null;
}

export default function MicButton({ isRecording, isSpeaking, onClick, error }: MicButtonProps) {
  let statusText = 'Tap to Speak';
  if (isRecording) statusText = 'Listening... Tap to End';
  else if (isSpeaking) statusText = 'Zahra is Speaking...';

  return (
    <div className="flex flex-col items-center gap-6 w-full mt-auto pt-12 pb-6">
      <button 
        onClick={onClick}
        aria-label={isRecording ? "Finish speaking" : "Start speaking"}
        title={isRecording ? "Tap to finish speaking" : "Tap to speak"}
        className={`relative flex items-center justify-center w-24 h-24 glass-panel rounded-full hover:border-primary/40 transition-all duration-300 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-primary/50 ${isRecording ? 'bg-primary/20 border-primary/40' : 'hover:bg-primary/10'}`}
      >
        {/* Ping effect behind the button */}
        {isRecording && <div className="absolute inset-0 rounded-full border-4 border-primary/40 animate-[ping_2s_infinite] opacity-60 bg-primary/10"></div>}
        {isSpeaking && <div className="absolute inset-0 rounded-full border-4 border-tertiary/30 animate-[ping_3s_infinite] opacity-40"></div>}
        {!isRecording && !isSpeaking && <div className="absolute inset-0 rounded-full border-4 border-primary/20 opacity-40 transition-opacity hover:opacity-80"></div>}
        
        {/* The microphone icon with subtle scale pulsing */}
        <motion.div
           animate={{ scale: isRecording ? [1, 1.2, 1] : [1, 1] }}
           transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          {isRecording ? (
            <Mic size={32} className="text-primary drop-shadow-[0_0_12px_rgba(125,211,252,0.9)]" strokeWidth={2.5} />
          ) : (
            <Mic size={32} className="text-primary/80 group-hover:text-primary transition-colors" strokeWidth={1.5} />
          )}
        </motion.div>
      </button>

      {error ? (
        <span className="text-red-400 text-xs font-semibold flex items-center gap-1">
          <AlertCircle size={14} /> {error}
        </span>
      ) : (
        <span className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${isRecording ? 'text-primary animate-pulse' : isSpeaking ? 'text-tertiary' : 'text-slate-400'}`}>
          {statusText}
        </span>
      )}
    </div>
  );
}
