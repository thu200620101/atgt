import React from 'react';
import { X, Sliders, Volume2, Shield, Eye, Cpu, RotateCcw, Globe } from 'lucide-react';
import { AppSettings, ViolationType } from '../types/traffic';
import { TRANSLATIONS } from '../utils/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[settings.language];
  const isVi = settings.language === 'vi';

  const handleToggleViolation = (type: ViolationType) => {
    onUpdateSettings({
      ...settings,
      activeViolations: {
        ...settings.activeViolations,
        [type]: !settings.activeViolations[type],
      },
    });
  };

  const resetDefaults = () => {
    onUpdateSettings({
      detectionConfidenceThreshold: 0.75,
      enableSoundAlerts: true,
      enableVoiceAlerts: true,
      autoCaptureViolations: true,
      alertCooldownSeconds: 5,
      activeViolations: {
        RED_LIGHT_RUNNER: true,
        WRONG_WAY: true,
        NO_HELMET: true,
        SPEED_EXCESS: true,
        CROSSWALK_ENCROACHMENT: true,
        PHONE_USE: true,
      },
      showDriverOverlay: true,
      showSpeedRadar: true,
      showLaneGuides: true,
      cameraResolution: '1080p',
      language: settings.language,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold tracking-tight">
              {isVi ? 'Cài Đặt Hệ Thống Thị Giác AI' : 'Vision Engine Settings'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs text-slate-200">
          {/* Language Selector */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-rose-400" />
              <span className="font-semibold text-slate-200">
                {isVi ? 'Ngôn Ngữ Ứng Dụng' : 'Application Language'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateSettings({ ...settings, language: 'vi' })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  settings.language === 'vi'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Tiếng Việt
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  settings.language === 'en'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Section: Confidence Threshold */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">{t.detectionThreshold}</span>
              <span className="font-mono font-bold text-rose-400">
                {Math.round(settings.detectionConfidenceThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={settings.detectionConfidenceThreshold}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  detectionConfidenceThreshold: parseFloat(e.target.value),
                })
              }
              className="w-full accent-rose-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              {isVi 
                ? 'Lọc các phỏng đoán có độ tin cậy thấp dưới ngưỡng này.'
                : 'Filters out candidate detections below this certainty score.'}
            </p>
          </div>

          {/* Section: Audio & Voice Alerts */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">
              {isVi ? 'Âm Thanh & Giọng Nói' : 'Audio & Voice Alarms'}
            </span>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">{t.audibleAlarms}</span>
              <input
                type="checkbox"
                checked={settings.enableSoundAlerts}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, enableSoundAlerts: e.target.checked })
                }
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">{t.voiceAlerts} (Text-to-Speech)</span>
              <input
                type="checkbox"
                checked={settings.enableVoiceAlerts}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, enableVoiceAlerts: e.target.checked })
                }
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">
                {isVi ? 'Tự động đóng băng khung hình khi vi phạm' : 'Auto-Freeze on Violation'}
              </span>
              <input
                type="checkbox"
                checked={settings.autoCaptureViolations}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, autoCaptureViolations: e.target.checked })
                }
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>
          </div>

          {/* Section: Active Violation Models */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">
              {isVi ? 'Mô Hình Nhận Diện Vi Phạm Hoạt Động' : 'Active Neural Violation Models'}
            </span>

            {[
              { 
                key: 'RED_LIGHT_RUNNER' as ViolationType, 
                label: isVi ? 'Vượt Đèn Đỏ Giao Thông' : 'Red Light Signal Compliance' 
              },
              { 
                key: 'NO_HELMET' as ViolationType, 
                label: isVi ? 'Không Đội Mũ Bảo Hiểm' : 'Motorcycle Helmet Detector' 
              },
              { 
                key: 'SPEED_EXCESS' as ViolationType, 
                label: isVi ? 'Radar Tốc Độ Quang Học' : 'Optical Velocity Radar' 
              },
              { 
                key: 'CROSSWALK_ENCROACHMENT' as ViolationType, 
                label: isVi ? 'Đè Vạch Người Đi Bộ' : 'Pedestrian Crosswalk Safety' 
              },
              { 
                key: 'PHONE_USE' as ViolationType, 
                label: isVi ? 'Dùng Điện Thoại Khi Lái Xe' : 'Driver Distracted Phone Detection' 
              },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer py-0.5">
                <span className="text-slate-300">{label}</span>
                <input
                  type="checkbox"
                  checked={!!settings.activeViolations[key]}
                  onChange={() => handleToggleViolation(key)}
                  className="w-4 h-4 accent-rose-500 rounded"
                />
              </label>
            ))}
          </div>

          {/* Section: Visual Overlays */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">
              {isVi ? 'Lớp Hiển Thị Trực Quan' : 'Display Layers'}
            </span>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">{isVi ? 'Khung Người Lái & Khung Xương' : 'Driver Cabin & Pose Skeleton'}</span>
              <input
                type="checkbox"
                checked={settings.showDriverOverlay}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showDriverOverlay: e.target.checked })
                }
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">{isVi ? 'Véc-tơ Radar Tốc Độ' : 'Speed Radar Vectors'}</span>
              <input
                type="checkbox"
                checked={settings.showSpeedRadar}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showSpeedRadar: e.target.checked })
                }
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">{isVi ? 'Vạch Dẫn Hướng Làn Đường' : 'Road Lane Guides'}</span>
              <input
                type="checkbox"
                checked={settings.showLaneGuides}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showLaneGuides: e.target.checked })
                }
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isVi ? 'Mặc Định' : 'Reset Defaults'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            {isVi ? 'Lưu & Đóng' : 'Save & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
