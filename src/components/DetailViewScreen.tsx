import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  UserCheck, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  SlidersHorizontal,
  FileText,
  Printer,
  QrCode,
  Sparkles,
  X,
  ZoomIn
} from 'lucide-react';
import { IncidentRecord, AppSettings } from '../types/traffic';
import { drawComputerVisionOverlays } from '../utils/cvEngine';
import { TRANSLATIONS } from '../utils/i18n';

interface DetailViewScreenProps {
  incident: IncidentRecord;
  onBack: () => void;
  onUpdateStatus?: (id: string, status: 'Validated' | 'Pending Review' | 'Dismissed') => void;
  language?: 'vi' | 'en';
}

export const DetailViewScreen: React.FC<DetailViewScreenProps> = ({
  incident,
  onBack,
  onUpdateStatus,
  language = 'vi',
}) => {
  const t = TRANSLATIONS[language];
  const isVi = language === 'vi';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showVehicleBox, setShowVehicleBox] = useState(true);
  const [showDriverBox, setShowDriverBox] = useState(true);
  const [showSpeedRadar, setShowSpeedRadar] = useState(true);
  const [status, setStatus] = useState(incident.status);
  const [isExported, setIsExported] = useState(false);
  const [activeInspectionTab, setActiveInspectionTab] = useState<'overview' | 'driver' | 'plate'>('overview');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Redraw canvas with high-res overlays over the analyzed snapshot image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = incident.imageSnapshot;

    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 450;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mockDetections = [];
      if (showVehicleBox) {
        mockDetections.push({
          id: incident.id,
          type: incident.vehicle.type,
          label: incident.vehicle.label,
          status: 'violation' as const,
          violationType: incident.violationType,
          violationTitle: isVi ? incident.titleVi || incident.title : incident.title,
          confidence: incident.confidenceScore,
          speedKmh: incident.vehicle.speedKmh,
          speedLimitKmh: incident.vehicle.speedLimitKmh,
          plateNumber: incident.vehicle.plateNumber,
          lane: 'Lane Tracked',
          color: incident.vehicle.color,
          bbox: incident.detectionCoordinates.vehicleBbox,
          driverPose: showDriverBox && incident.detectionCoordinates.driverBbox ? {
            headBox: incident.detectionCoordinates.headBbox || [45, 52, 5, 6],
            driverBox: incident.detectionCoordinates.driverBbox,
            helmetDetected: incident.driverDetails.helmetStatus === 'Worn',
            phoneDetected: incident.driverDetails.distraction.includes('Phone'),
            seatbeltFastened: incident.driverDetails.seatbeltStatus === 'Fastened',
            keypoints: [
              { name: 'head', x: incident.detectionCoordinates.headBbox ? incident.detectionCoordinates.headBbox[0] + 2 : 47, y: incident.detectionCoordinates.headBbox ? incident.detectionCoordinates.headBbox[1] + 2 : 54, score: 0.98 },
              { name: 'torso', x: incident.detectionCoordinates.driverBbox[0] + incident.detectionCoordinates.driverBbox[2] / 2, y: incident.detectionCoordinates.driverBbox[1] + 6, score: 0.95 },
            ],
          } : undefined,
        });
      }

      drawComputerVisionOverlays(ctx, canvas.width, canvas.height, mockDetections, {
        showDriverOverlay: showDriverBox,
        showSpeedRadar: showSpeedRadar,
        showLaneGuides: true,
        activeSignal: 'red',
      });
    };
  }, [incident, showVehicleBox, showDriverBox, showSpeedRadar, isVi]);

  const handleExportCitation = () => {
    const citationPayload = {
      citationNumber: `CIT-${incident.id.toUpperCase()}`,
      issuedAt: new Date().toISOString(),
      incidentData: incident,
      verifiedStatus: status,
      legalAuthority: isVi ? 'Cục Cảnh Sát Giao Thông' : 'Traffic Enforcement Administration',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(citationPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `traffic-citation-${incident.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsExported(true);
    setTimeout(() => setIsExported(false), 3000);
  };

  const handleStatusChange = (newStatus: 'Validated' | 'Pending Review' | 'Dismissed') => {
    setStatus(newStatus);
    if (onUpdateStatus) {
      onUpdateStatus(incident.id, newStatus);
    }
  };

  const confidencePct = Math.round(incident.confidenceScore * 100);

  return (
    <div className="flex flex-col min-h-full bg-slate-950 text-slate-100 pb-12">
      {/* Top Bar with back button */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToFeed}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Print ticket action */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-rose-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printCitation}</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* Header Title Section */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-mono text-rose-400 font-bold uppercase">
              {isVi ? 'VI PHẠM GIAO THÔNG' : 'CRITICAL VIOLATION'}
            </span>
            <span>·</span>
            <span>{incident.timeFormatted}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {isVi ? incident.titleVi || incident.title : incident.title}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{incident.location}</span>
          </div>
        </div>

        {/* Visual Inspection Card with Canvas Overlays & Inspection Tabs */}
        <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
          {/* Inspection View Mode Selector */}
          <div className="flex items-center gap-1 p-2 bg-slate-950/90 border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveInspectionTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeInspectionTab === 'overview'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.overview}
            </button>
            <button
              onClick={() => setActiveInspectionTab('driver')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                activeInspectionTab === 'driver'
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t.inspectDriver}</span>
            </button>
            <button
              onClick={() => setActiveInspectionTab('plate')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                activeInspectionTab === 'plate'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>{t.inspectPlate}</span>
            </button>
          </div>

          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
            {activeInspectionTab === 'overview' ? (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            ) : activeInspectionTab === 'driver' ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4">
                <img
                  src={incident.imageSnapshot}
                  alt="Driver Crop"
                  className="w-full h-full object-cover scale-[2.2] translate-y-[-10%]"
                />
                <div className="absolute inset-0 bg-cyan-950/20 pointer-events-none" />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/50 text-cyan-300 text-xs font-mono">
                  <span>DRIVER CABIN & POSE ZOOM (2.2X)</span>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4">
                <img
                  src={incident.imageSnapshot}
                  alt="Plate Crop"
                  className="w-full h-full object-cover scale-[3.0] translate-y-[20%]"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-amber-500/50 text-amber-300 text-xs font-mono font-bold">
                  <span>PLATE OCR CROP: {incident.vehicle.plateNumber}</span>
                </div>
              </div>
            )}

            {/* AI Annotated tag */}
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI ANNOTATED FRAME</span>
            </div>

            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-rose-400 font-bold">
              {confidencePct}% CONFIDENCE
            </div>
          </div>

          {/* Overlay Filter Controls (Overview tab only) */}
          {activeInspectionTab === 'overview' && (
            <div className="px-3.5 py-2.5 bg-slate-900/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="font-medium text-[11px]">Layer Toggles:</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowVehicleBox(!showVehicleBox)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                    showVehicleBox
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Vehicle Box
                </button>

                <button
                  onClick={() => setShowDriverBox(!showDriverBox)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                    showDriverBox
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Driver Position
                </button>

                <button
                  onClick={() => setShowSpeedRadar(!showSpeedRadar)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                    showSpeedRadar
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Speed Radar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Description & Legal Code (Requirement 5) */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs tracking-wide uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>{isVi ? 'Mô Tả Vi Phạm & Điều Khoản Pháp Lý' : 'Violation Description & Legal Statute'}</span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">
            {isVi ? incident.detailedDescriptionVi || incident.detailedDescription : incident.detailedDescription}
          </p>

          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase">
                {t.statutoryCode}
              </span>
              <span className="font-semibold text-slate-200">
                {isVi ? incident.legalCodeVi || incident.legalCode : incident.legalCode}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase">
                {t.estimatedPenalty}
              </span>
              <span className="font-semibold text-amber-400">
                {isVi ? incident.penaltyEstimateVi || incident.penaltyEstimate : incident.penaltyEstimate}
              </span>
            </div>
          </div>
        </div>

        {/* Highlighted Driver Position & Diagnostics (Requirement 5) */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wide uppercase">
              <UserCheck className="w-4 h-4" />
              <span>{t.driverDiagnostics}</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-300">
              Pose Score: {Math.round(incident.driverDetails.poseConfidence * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">{t.helmetStatus}</span>
              <span
                className={`font-semibold ${
                  incident.driverDetails.helmetStatus === 'Worn'
                    ? 'text-emerald-400'
                    : incident.driverDetails.helmetStatus === 'Not Detected'
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {isVi
                  ? incident.driverDetails.helmetStatus === 'Worn'
                    ? 'Có Đội Mũ'
                    : incident.driverDetails.helmetStatus === 'Not Detected'
                    ? 'Không Đội Mũ!'
                    : 'Không Áp Dụng'
                  : incident.driverDetails.helmetStatus}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">{t.seatbeltStatus}</span>
              <span
                className={`font-semibold ${
                  incident.driverDetails.seatbeltStatus === 'Fastened'
                    ? 'text-emerald-400'
                    : incident.driverDetails.seatbeltStatus === 'Not Detected'
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }`}
              >
                {isVi
                  ? incident.driverDetails.seatbeltStatus === 'Fastened'
                    ? 'Đã Thắt Dây'
                    : incident.driverDetails.seatbeltStatus === 'Not Detected'
                    ? 'Chưa Thắt Dây!'
                    : 'Không Áp Dụng'
                  : incident.driverDetails.seatbeltStatus}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 font-mono block">{t.driverAttention}</span>
              <span
                className={`font-semibold ${
                  incident.driverDetails.distraction.includes('Phone')
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {isVi
                  ? incident.driverDetails.distraction.includes('Phone')
                    ? 'Dùng Điện Thoại!'
                    : 'Bình Thường'
                  : incident.driverDetails.distraction}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Telemetry & Plate Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs tracking-wide uppercase">
              <FileText className="w-4 h-4 text-rose-400" />
              <span>{t.vehicleSpecs}</span>
            </div>
            <div className="px-2.5 py-1 bg-amber-400 text-slate-950 rounded font-mono font-bold text-xs border border-amber-300 tracking-wider shadow-sm">
              {incident.vehicle.plateNumber}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-mono">Model</span>
              <span className="text-slate-200 font-medium">{incident.vehicle.label}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-mono">Color</span>
              <span className="text-slate-200 font-medium">{incident.vehicle.color}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-mono">{t.observedSpeed}</span>
              <span className="text-rose-400 font-mono font-bold">{incident.vehicle.speedKmh} km/h</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-mono">{t.speedLimit}</span>
              <span className="text-slate-300 font-mono">{incident.vehicle.speedLimitKmh} km/h</span>
            </div>
          </div>
        </div>

        {/* Verification Status & Export */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">{t.enforcementStatus}:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleStatusChange('Validated')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  status === 'Validated'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Validated
              </button>
              <button
                onClick={() => handleStatusChange('Pending Review')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  status === 'Pending Review'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Review
              </button>
              <button
                onClick={() => handleStatusChange('Dismissed')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  status === 'Dismissed'
                    ? 'bg-rose-900/60 text-rose-300'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Dismissed
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleExportCitation}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-950 flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isExported ? 'Citation Exported!' : t.exportCitation}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Printable Citation Ticket Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] space-y-4">
            {/* Header with emblem */}
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {isVi ? 'BỘ CÔNG AN · CỤC CẢNH SÁT GIAO THÔNG' : 'DEPARTMENT OF TRANSPORTATION & HIGHWAY SAFETY'}
                </p>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {t.officialCitationTicket}
                </h3>
                <p className="text-xs font-mono text-rose-600 font-bold mt-0.5">
                  NO: VN-{incident.id.toUpperCase()}-2026
                </p>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Violation Image & Bounding Box Photo */}
            <div className="relative rounded-xl overflow-hidden border border-slate-300 aspect-video bg-slate-900">
              <img
                src={incident.imageSnapshot}
                alt="Citation evidence"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-mono rounded">
                EVIDENCE TIMESTAMP: {incident.timestamp}
              </div>
            </div>

            {/* Details Table */}
            <div className="grid grid-cols-2 gap-2 text-xs border border-slate-200 rounded-xl p-3 bg-slate-50">
              <div>
                <span className="text-slate-500 font-mono text-[10px] block">BIỂN SỐ / PLATE</span>
                <span className="font-mono font-bold text-sm text-slate-900">{incident.vehicle.plateNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] block">LOẠI XE / MODEL</span>
                <span className="font-semibold text-slate-900">{incident.vehicle.label}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] block">ĐỊA ĐIỂM / LOCATION</span>
                <span className="font-medium text-slate-900">{incident.location}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] block">TỐC ĐỘ / SPEED</span>
                <span className="font-mono font-bold text-rose-600">{incident.vehicle.speedKmh} km/h (Limit: {incident.vehicle.speedLimitKmh})</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-mono text-[10px] block">LỖI VI PHẠM / VIOLATION</span>
                <span className="font-bold text-slate-900">{isVi ? incident.titleVi || incident.title : incident.title}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 font-mono text-[10px] block">CĂN CỨ PHÁP LÝ / STATUTE</span>
                <span className="font-medium text-slate-800">{isVi ? incident.legalCodeVi || incident.legalCode : incident.legalCode}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 font-mono text-[10px] block">TIỀN PHẠT / FINE ESTIMATE</span>
                <span className="font-bold text-rose-700">{isVi ? incident.penaltyEstimateVi || incident.penaltyEstimate : incident.penaltyEstimate}</span>
              </div>
            </div>

            {/* QR verification stamp and notice */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
              <div className="space-y-1 max-w-[70%]">
                <p className="text-[10px] text-slate-500 leading-snug">{t.citationNotice}</p>
                <p className="text-[10px] text-slate-600 font-medium">{t.paymentNotice}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                  <QrCode className="w-10 h-10" />
                </div>
                <span className="text-[8px] font-mono text-slate-500 mt-0.5">SCAN TO PAY</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" />
                <span>{isVi ? 'In Bản Giấy / Lưu PDF' : 'Print / Save PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
