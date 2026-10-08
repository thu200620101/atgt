import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameWrapperProps {
  children: React.ReactNode;
  isMobileFrame: boolean;
}

export const MobileFrameWrapper: React.FC<MobileFrameWrapperProps> = ({
  children,
  isMobileFrame,
}) => {
  if (!isMobileFrame) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start text-slate-100">
        <div className="w-full max-w-2xl min-h-screen bg-slate-950 border-x border-slate-900 shadow-2xl flex flex-col relative">
          {children}
        </div>
      </div>
    );
  }

  // Realistic smartphone shell frame
  return (
    <div className="min-h-screen bg-slate-950/95 py-4 sm:py-8 px-2 flex items-center justify-center">
      <div className="relative w-full max-w-[420px] h-[860px] bg-slate-950 rounded-[44px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col ring-1 ring-slate-700/50">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-2 inset-x-0 z-50 flex justify-center pointer-events-none">
          <div className="w-28 h-5 bg-black rounded-full flex items-center justify-between px-3">
            <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          </div>
        </div>

        {/* Mobile Status Bar (Clock, Wifi, Battery) */}
        <div className="h-9 px-7 pt-2 flex items-center justify-between text-[11px] font-semibold text-slate-300 select-none z-40 bg-slate-950/70 backdrop-blur-sm pointer-events-none">
          <span className="font-mono text-xs">09:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* App Screen Content viewport */}
        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {children}
        </div>

        {/* Home Indicator bar */}
        <div className="h-4 bg-slate-950 flex items-center justify-center select-none pointer-events-none pb-1">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
