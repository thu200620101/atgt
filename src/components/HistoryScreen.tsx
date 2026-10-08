import React, { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  ChevronRight, 
  ArrowLeft, 
  Download, 
  MapPin
} from 'lucide-react';
import { IncidentRecord } from '../types/traffic';
import { TRANSLATIONS } from '../utils/i18n';

interface HistoryScreenProps {
  incidents: IncidentRecord[];
  onSelectIncident: (incident: IncidentRecord) => void;
  onBack: () => void;
  language?: 'vi' | 'en';
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  incidents,
  onSelectIncident,
  onBack,
  language = 'vi',
}) => {
  const t = TRANSLATIONS[language];
  const isVi = language === 'vi';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = incidents.filter((item) => {
    const titleMatch = (isVi ? item.titleVi || item.title : item.title).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch =
      titleMatch ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicle.label.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'red_light') return matchesSearch && item.violationType === 'RED_LIGHT_RUNNER';
    if (filterType === 'helmet') return matchesSearch && item.violationType === 'NO_HELMET';
    if (filterType === 'speed') return matchesSearch && item.violationType === 'SPEED_EXCESS';
    if (filterType === 'crosswalk') return matchesSearch && item.violationType === 'CROSSWALK_ENCROACHMENT';
    return matchesSearch;
  });

  const exportAllHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `safetraffic-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-950 text-slate-100 pb-12">
      {/* Top Header */}
      <div className="sticky top-0 z-20 px-4 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isVi ? 'Trang Chủ' : 'Dashboard'}</span>
        </button>

        <h1 className="text-sm font-bold text-white font-mono">
          {isVi ? 'Nhật Ký Vi Phạm' : 'Violation Log'}
        </h1>

        <button
          onClick={exportAllHistory}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          title="Export records"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3.5 max-w-xl mx-auto w-full">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isVi ? 'Tìm kiếm theo địa điểm, biển số xe, loại xe...' : 'Search by street, vehicle, or license plate...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isVi ? `Tất Cả (${incidents.length})` : `All (${incidents.length})`}
          </button>
          <button
            onClick={() => setFilterType('red_light')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterType === 'red_light'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isVi ? 'Đèn Đỏ' : 'Red Light'}
          </button>
          <button
            onClick={() => setFilterType('helmet')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterType === 'helmet'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isVi ? 'Mũ Bảo Hiểm' : 'No Helmet'}
          </button>
          <button
            onClick={() => setFilterType('speed')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterType === 'speed'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isVi ? 'Tốc Độ' : 'Speed Radar'}
          </button>
          <button
            onClick={() => setFilterType('crosswalk')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterType === 'crosswalk'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {isVi ? 'Đè Vạch' : 'Crosswalk'}
          </button>
        </div>

        {/* Incidents List */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
              {isVi ? 'Không tìm thấy bản ghi vi phạm phù hợp.' : 'No matching traffic violation records found.'}
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectIncident(item)}
                className="cursor-pointer p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/40 transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                        {isVi ? item.titleVi || item.title : item.title}
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {Math.round(item.confidenceScore * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                      <span className="font-mono text-slate-300 font-semibold">{item.vehicle.plateNumber}</span>
                      <span>·</span>
                      <span>{item.vehicle.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                      <span>·</span>
                      <span className="truncate">{item.timeFormatted}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    {item.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
