import React, { useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Settings, 
  History, 
  ShieldAlert, 
  AlertTriangle, 
  ChevronRight, 
  Gauge, 
  Radio, 
  BarChart3,
  TrendingUp,
  Award
} from 'lucide-react';
import { IncidentRecord } from '../types/traffic';
import { PRESET_SCENES } from '../utils/trafficData';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface HomeScreenProps {
  onScanCamera: () => void;
  onUploadMedia: (file: File) => void;
  onViewHistory: () => void;
  onOpenSettings: () => void;
  onSelectIncident: (incident: IncidentRecord) => void;
  onSelectPreset: (index: number) => void;
  todayViolationsCount: number;
  todayWarningsCount: number;
  recentIncidents: IncidentRecord[];
  language?: Language;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onScanCamera,
  onUploadMedia,
  onViewHistory,
  onOpenSettings,
  onSelectIncident,
  onSelectPreset,
  todayViolationsCount,
  todayWarningsCount,
  recentIncidents,
  language = 'vi',
}) => {
  const t = TRANSLATIONS[language];
  const isVi = language === 'vi';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadMedia(file);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-950 text-slate-100 pb-10">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="p-4 space-y-4 max-w-xl mx-auto w-full">
        {/* Header: App Name & Motivating Slogan (Requirement 1) */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase">
              {t.visionAiEnforcement}
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t.onlineStatus}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            SafeTraffic AI
          </h1>

          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            "{t.slogan}"
          </p>
        </div>

        {/* Primary Action Card: Scan Camera (Prominent Button) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-900/90 via-slate-900 to-slate-950 border border-rose-500/40 shadow-xl shadow-rose-950/40 p-4.5">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-rose-300 font-bold block mb-1">
                  Edge AI Optical Scanner
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {t.scanCameraNow}
                </h2>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  {isVi 
                    ? 'Hướng camera vào luồng giao thông để nhận diện vi phạm bằng bounding box xanh/đỏ thời gian thực.'
                    : 'Point device camera at road intersections for real-time violation bounding boxes.'}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shrink-0">
                <Camera className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <button
              onClick={onScanCamera}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-600 text-white text-sm font-bold tracking-wide shadow-lg shadow-rose-900/60 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" />
              <span>{t.scanCameraNow}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Secondary Action Cards (Upload Video & Settings) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Upload Video Button/Card */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-left transition-all active:scale-[0.98] group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2 group-hover:scale-105 transition-transform">
              <Upload className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">{t.uploadVideo}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {t.uploadDesc}
              </p>
            </div>
          </button>

          {/* Settings Button/Card */}
          <button
            onClick={onOpenSettings}
            className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-left transition-all active:scale-[0.98] group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mb-2 group-hover:scale-105 transition-transform">
              <Settings className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">{t.settings}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {t.settingsDesc}
              </p>
            </div>
          </button>
        </div>

        {/* Summary Dashboard: Today's Violations & Today's Warnings (Requirement 1 Bottom Bar) */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-rose-400" />
              <span>{t.todayTelemetry}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Live Feed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Today's Violations Count */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">{t.todayViolations}</span>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-rose-400 font-mono tabular-nums">
                  {todayViolationsCount}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{t.eventsUnit}</span>
              </div>
              <p className="text-[10px] text-rose-300/80 mt-0.5 truncate">
                {isVi ? 'Vượt đèn đỏ & Ngược chiều' : 'Red Light & Wrong-Way'}
              </p>
            </div>

            {/* Today's Warnings Count */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">{t.todayWarnings}</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
                  {todayWarningsCount}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{t.warningsUnit}</span>
              </div>
              <p className="text-[10px] text-amber-300/80 mt-0.5 truncate">
                {isVi ? 'Đè vạch & Lệch làn nhẹ' : 'Crosswalk & Speed drifts'}
              </p>
            </div>
          </div>

          {/* Road Safety Compliance Index */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">
                {isVi ? 'Chỉ số Tuân thủ Giao thông' : 'Corridor Compliance Score'}:
              </span>
            </div>
            <span className="font-mono font-bold text-emerald-400">94.8% Safe</span>
          </div>
        </div>

        {/* Quick Traffic Scene Test Corridors */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>{isVi ? 'Điểm Giám Sát Trực Tuyến' : 'Surveillance Test Corridors'}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              3 Live Feeds
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {PRESET_SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => {
                  onSelectPreset(idx);
                  onScanCamera();
                }}
                className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-rose-500/50 transition-colors text-left aspect-video"
              >
                <img
                  src={scene.image}
                  alt={scene.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-1.5">
                  <span className="text-[9px] font-bold text-white leading-tight truncate">
                    {isVi ? scene.nameVi : scene.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* History Section: View analysis history & Recent Feed (Requirement 1) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs font-bold text-white tracking-tight">
                {t.recentViolations}
              </h2>
            </div>
            <button
              onClick={onViewHistory}
              className="text-[11px] font-medium text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
            >
              <span>{t.viewAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Incident Feed items */}
          <div className="space-y-2">
            {recentIncidents.slice(0, 3).map((incident) => (
              <button
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className="w-full p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between text-left transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                      {isVi ? incident.titleVi || incident.title : incident.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      {incident.location} · {incident.timeFormatted}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    {Math.round(incident.confidenceScore * 100)}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
