import { motion } from 'motion/react';

interface WaveformProps {
  isRecording?: boolean;
  isSpeaking?: boolean;
  micLevel?: number;
}

export default function Waveform({ isRecording = false, isSpeaking = false, micLevel = 0 }: WaveformProps) {
  const bars = [
    { id: 1, baseHeight: 56, baseClass: 'h-[56px]', color: 'bg-primary/30' },
    { id: 2, baseHeight: 112, baseClass: 'h-[112px]', color: 'bg-primary/50' },
    { id: 3, baseHeight: 176, baseClass: 'h-[176px]', color: 'bg-primary tech-glow' },
    { id: 4, baseHeight: 144, baseClass: 'h-[144px]', color: 'bg-primary/70' },
    { id: 5, baseHeight: 192, baseClass: 'h-[192px]', color: 'bg-primary tech-glow' },
    { id: 6, baseHeight: 96, baseClass: 'h-[96px]', color: 'bg-primary/50' },
    { id: 7, baseHeight: 160, baseClass: 'h-[160px]', color: 'bg-primary tech-glow' },
    { id: 8, baseHeight: 80, baseClass: 'h-[80px]', color: 'bg-primary/30' },
  ];

  return (
    <div aria-hidden="true" className="relative w-full aspect-square flex items-center justify-center mb-6 waveform-mask max-w-[320px] mx-auto">
      {/* Structural Rings */}
      <div className={`absolute inset-0 border rounded-full transition-colors duration-500 ${isSpeaking ? 'border-tertiary/30' : isRecording ? 'border-primary/30' : 'border-primary/10'}`}></div>
      <div className={`absolute inset-10 border rounded-full transition-colors duration-500 ${isSpeaking ? 'border-tertiary/40' : isRecording ? 'border-primary/40' : 'border-primary/20'}`}></div>

      {/* Tech Pulse Waveform */}
      <div className="relative z-10 w-full h-48 flex items-center justify-center gap-2 px-10">
        {bars.map((bar) => {
           // If speaking, use tertiary color. If recording and not speaking, react to mic.
           const activeColor = isSpeaking 
               ? bar.color.replace('primary', 'tertiary') 
               : (isRecording ? bar.color : bar.color.replace('primary', 'primary/20'));
           
           // Calculate dynamic height based on mic level if recording
           // Otherwise use idle animation if just connected, or speaking animation if AI is speaking
           let heights = [bar.baseHeight, bar.baseHeight * 0.4, bar.baseHeight * 1.1, bar.baseHeight];
           let duration = 1.5 + Math.random();

           if (isRecording && !isSpeaking) {
               // User input mode
               const level = Math.max(0.1, Math.min(1.5, (micLevel + 0.1)));
               heights = [bar.baseHeight * level, bar.baseHeight * level * 0.8];
               duration = 0.1 + Math.random() * 0.1;
           } else if (isSpeaking) {
               // AI speaking mode
               heights = [bar.baseHeight, bar.baseHeight * 1.4, bar.baseHeight * 0.6, bar.baseHeight];
               duration = 0.5 + Math.random() * 0.5;
           } else {
               // Idle Mode
               heights = [bar.baseHeight * 0.5, bar.baseHeight * 0.3, bar.baseHeight * 0.6, bar.baseHeight * 0.4];
           }

          return (
            <motion.div
              key={bar.id}
              className={`w-1.5 rounded-full ${activeColor} ${bar.baseClass} transition-colors duration-300`}
              animate={{
                height: heights
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse"
              }}
            />
          );
        })}
      </div>

      {/* Subtle Center Core Glow */}
      <div className={`absolute w-48 h-48 rounded-full blur-[60px] transition-colors duration-1000 ${isSpeaking ? 'bg-tertiary/30' : isRecording ? 'bg-primary/20' : 'bg-primary/5'}`}></div>
    </div>
  );
}
