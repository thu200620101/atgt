import React from 'react';
import { LayoutDashboard, Camera, History, Code2 } from 'lucide-react';

export type TabKey = 'home' | 'camera' | 'history' | 'code';

interface BottomTabBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  unreviewedCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onSelectTab,
  unreviewedCount = 0,
}) => {
  return (
    <nav className="sticky bottom-0 z-40 w-full bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-3 py-1.5 shadow-2xl">
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[46px] ${
            currentTab === 'home' ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Tab 2: Camera Scan (Center Primary CTA) */}
        <button
          onClick={() => onSelectTab('camera')}
          className="relative flex flex-col items-center justify-center py-0.5 group min-h-[46px]"
        >
          <div
            className={`flex items-center justify-center w-11 h-11 -mt-4 rounded-full border-2 transition-all duration-200 shadow-lg ${
              currentTab === 'camera'
                ? 'bg-gradient-to-tr from-rose-600 to-rose-500 border-white text-white shadow-rose-500/40 scale-105'
                : 'bg-slate-900 border-rose-500/50 text-rose-400 group-hover:border-rose-400 group-hover:text-rose-300'
            }`}
          >
            <Camera className="w-5 h-5" />
          </div>
          <span
            className={`text-[10px] font-medium tracking-tight mt-0.5 ${
              currentTab === 'camera' ? 'text-rose-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Scan Camera
          </span>
        </button>

        {/* Tab 3: History */}
        <button
          onClick={() => onSelectTab('history')}
          className={`relative flex flex-col items-center justify-center py-1 transition-colors min-h-[46px] ${
            currentTab === 'history' ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <History className="w-5 h-5 mb-0.5" />
            {unreviewedCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded-full font-mono">
                {unreviewedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">History</span>
        </button>

        {/* Tab 4: Code Architecture (Native Mobile) */}
        <button
          onClick={() => onSelectTab('code')}
          className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[46px] ${
            currentTab === 'code' ? 'text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Native Code</span>
        </button>
      </div>
    </nav>
  );
};
