import React, { useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, Gauge, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { IncidentRecord } from '../types/traffic';
import { sound } from '../utils/audio';
import { TRANSLATIONS } from '../utils/i18n';

interface ViolationAlertModalProps {
  alert: IncidentRecord | null;
  onViewDetails: (incident: IncidentRecord) => void;
  onDismiss: () => void;
  soundEnabled?: boolean;
  voiceEnabled?: boolean;
  language?: 'vi' | 'en';
}

export const ViolationAlertModal: React.FC<ViolationAlertModalProps> = ({
  alert,
  onViewDetails,
  onDismiss,
  soundEnabled = true,
  voiceEnabled = true,
  language = 'vi',
}) => {
  const t = TRANSLATIONS[language];
  const isVi = language === 'vi';

  useEffect(() => {
    if (alert) {
      sound.playViolationAlarm(soundEnabled);
      const titleToSpeak = isVi ? alert.titleVi || alert.title : alert.title;
      const speechMsg = isVi
        ? `Cảnh báo: Phát hiện xe ${alert.vehicle.plateNumber} ${titleToSpeak}!`
        : `Alert: ${titleToSpeak} detected for vehicle ${alert.vehicle.plateNumber}!`;
      sound.speakAlert(speechMsg, language, voiceEnabled);
    }
  }, [alert, soundEnabled, voiceEnabled, language, isVi]);

  if (!alert) return null;

  const confidencePct = Math.round(alert.confidenceScore * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-slate-900 border-2 border-rose-500 shadow-2xl shadow-rose-950/60 transition-all transform scale-100"
      >
        {/* Urgent Alert Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-rose-200 block font-bold">
                {t.realtimeAlert}
              </span>
              <h2 id="alert-dialog-title" className="text-sm font-bold tracking-tight">
                {t.trafficViolationDetected}
              </h2>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label={t.dismiss}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 space-y-3.5 text-slate-200">
          {/* Violation Type Prominent Display */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  {t.violationType}
                </span>
                <p className="text-base font-bold text-rose-400 tracking-tight">
                  {isVi ? alert.titleVi || alert.title : alert.title}
                </p>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  {alert.vehicle.label} · {alert.vehicle.plateNumber}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  {t.confidence}
                </span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  {confidencePct}%
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-2 text-xs">
            {/* Timestamp */}
            <div className="flex items-center gap-2.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-slate-400 font-medium">{t.timestamp}:</span>
                <span className="font-mono text-slate-200 truncate">{alert.timeFormatted}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-slate-400 font-medium">{t.location}:</span>
                <span className="text-slate-200 truncate font-medium">{alert.location}</span>
              </div>
            </div>

            {/* Speed & Physics */}
            <div className="flex items-center gap-2.5 text-slate-300">
              <Gauge className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-slate-400 font-medium">{t.observedSpeed}:</span>
                <span className="font-mono text-amber-300">
                  {alert.vehicle.speedKmh} km/h (Limit: {alert.vehicle.speedLimitKmh} km/h)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={onDismiss}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold tracking-wide transition-colors active:scale-95"
            >
              {t.dismiss}
            </button>
            <button
              onClick={() => onViewDetails(alert)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-rose-950 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>{t.viewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
