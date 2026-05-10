import { motion } from 'motion/react';

export default function Waveform() {
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
      <div className="absolute inset-0 border border-primary/10 rounded-full"></div>
      <div className="absolute inset-10 border border-primary/20 rounded-full"></div>

      {/* Tech Pulse Waveform */}
      <div className="relative z-10 w-full h-48 flex items-center justify-center gap-2 px-10">
        {bars.map((bar) => (
          <motion.div
            key={bar.id}
            className={`w-1.5 rounded-full ${bar.color} ${bar.baseClass}`}
            animate={{
              height: [bar.baseHeight, bar.baseHeight * 0.4, bar.baseHeight * 1.1, bar.baseHeight]
            }}
            transition={{
              duration: 1.5 + Math.random(),
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Subtle Center Core Glow */}
      <div className="absolute w-48 h-48 bg-primary/10 rounded-full blur-[60px]"></div>
    </div>
  );
}
