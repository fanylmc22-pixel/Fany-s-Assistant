import { MapPin } from 'lucide-react';

export default function ProfileCard() {
  return (
    <div className="glass-panel p-6 rounded-2xl w-full shadow-lg shadow-black/30 text-center relative overflow-hidden group">
      {/* Subtle inner highlight */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <h1 className="text-white text-2xl font-bold tracking-tight mb-1 relative z-10">
        Fany Louis-Mondésir
      </h1>
      <p className="text-primary font-semibold uppercase tracking-[0.15em] text-xs relative z-10">
        Marketing Assistant
      </p>
      
      <div className="mt-5 pt-4 border-t border-[rgba(125,211,252,0.15)] flex items-center justify-center gap-2 text-slate-300 relative z-10">
        <MapPin size={14} className="text-primary/70" />
        <span className="text-sm font-medium">Paris, France</span>
      </div>
    </div>
  );
}
