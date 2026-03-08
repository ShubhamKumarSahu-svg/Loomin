"use client";
import { LucideIcon, CheckCircle2 } from "lucide-react";

interface PersonaProps {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}

export function AgentPersonaCard({ title, description, icon: Icon, selected, onClick }: PersonaProps) {
  return (
    <div 
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-[2rem] border-2 p-6 transition-all duration-500 ${
        selected 
        ? "border-sky-500/50 bg-sky-500/[0.03] shadow-[0_0_30px_-10px_rgba(14,165,233,0.5)]" 
        : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
      }`}
    >
      
      {selected && (
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sky-500/10 blur-3xl animate-pulse" />
      )}

      <div className="relative z-10">
        <div className="mb-6 flex items-start justify-between">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-500 ${
            selected 
            ? "border-sky-500/30 bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]" 
            : "border-white/5 bg-white/5 text-gray-500 group-hover:text-gray-300"
          }`}>
            <Icon size={28} strokeWidth={selected ? 2.5 : 1.5} />
          </div>

          
          <div className="flex flex-col items-end gap-1">
             <div className={`h-1.5 w-6 rounded-full transition-colors duration-500 ${
               selected ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" : "bg-gray-800"
             }`} />
             <span className={`text-[8px] font-black uppercase tracking-widest ${
               selected ? "text-sky-500" : "text-gray-700"
             }`}>
               {selected ? "Initialized" : "Standby"}
             </span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className={`text-lg font-bold tracking-tight transition-colors ${
            selected ? "text-white" : "text-gray-400"
          }`}>
            {title}
          </h3>
          <p className="text-xs leading-relaxed font-medium text-gray-600 group-hover:text-gray-500 transition-colors">
            {description}
          </p>
        </div>

        
        {selected && (
          <div className="mt-4 flex items-center gap-2 text-sky-400 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Module Active</span>
          </div>
        )}
      </div>

      
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] opacity-20" />
    </div>
  );
}
