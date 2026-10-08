import React from 'react';
import { ShieldCheck, Settings, Smartphone, Monitor, Globe } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface HeaderProps {
  onOpenSettings: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  currentScreenTitle?: string;
  onBack?: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  isMobileFrame,
  onToggleMobileFrame,
  currentScreenTitle,
  onBack,
  language,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 text-white select-none">
      {/* Brand Zone */}
      <div className="flex items-center gap-2.5 min-w-0">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            aria-label={t.back}
          >
            <span className="text-lg leading-none">←</span>
          </button>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-indigo-600 shadow-sm shadow-rose-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
        )}

        <div className="truncate">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-white font-mono">
              SafeTraffic AI
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          {currentScreenTitle && (
            <p className="text-[11px] text-slate-400 truncate">{currentScreenTitle}</p>
          )}
        </div>
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-1.5">
        {/* Language Switcher */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1 px-2 py-1 h-8 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Switch Language (Tiếng Việt / English)"
        >
          <Globe className="w-3.5 h-3.5 text-rose-400" />
          <span>{language === 'vi' ? 'VI' : 'EN'}</span>
        </button>

        {/* Toggle Mobile Phone frame vs Fullscreen */}
        <button
          onClick={onToggleMobileFrame}
          title={isMobileFrame ? 'Expand to Desktop View' : 'Switch to Mobile Frame'}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle device frame"
        >
          {isMobileFrame ? (
            <Monitor className="w-4 h-4" />
          ) : (
            <Smartphone className="w-4 h-4" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label={t.settings}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
