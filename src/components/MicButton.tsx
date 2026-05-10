import { Mic } from 'lucide-react';
import { motion } from 'motion/react';

export default function MicButton() {
  return (
    <div className="flex flex-col items-center gap-6 w-full mt-auto pt-12 pb-6">
      <button 
        aria-label="Activer le microphone"
        title="Appuyez pour parler"
        className="relative flex items-center justify-center w-24 h-24 glass-panel rounded-full hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {/* Ping effect behind the button */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-[ping_3s_infinite] opacity-40"></div>
        
        {/* The microphone icon with subtle scale pulsing */}
        <motion.div
           animate={{ scale: [1, 1.1, 1] }}
           transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Mic size={32} className="text-primary" strokeWidth={1.5} />
        </motion.div>
      </button>

      <span className="text-slate-400 text-xs uppercase tracking-[0.3em] font-semibold">
        Tap to Speak
      </span>
    </div>
  );
}
