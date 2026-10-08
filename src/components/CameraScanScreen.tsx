import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  SwitchCamera, 
  Sparkles, 
  Layers, 
  Volume2, 
  VolumeX, 
  Upload, 
  Radio, 
  Play, 
  Pause, 
  TrafficCone,
  BrainCircuit,
  Crosshair,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { VehicleDetection, IncidentRecord, PresetScene, AppSettings, GeminiAnalysisResult } from '../types/traffic';
import { PRESET_SCENES } from '../utils/trafficData';
import { drawComputerVisionOverlays } from '../utils/cvEngine';
import { sound } from '../utils/audio';
import { TRANSLATIONS } from '../utils/i18n';

interface CameraScanScreenProps {
  onViolationDetected: (incident: IncidentRecord) => void;
  onNavigateToDetail: (incident: IncidentRecord) => void;
  settings: AppSettings;
}

export const CameraScanScreen: React.FC<CameraScanScreenProps> = ({
  onViolationDetected,
  onNavigateToDetail,
  settings,
}) => {
  const lang = settings.language;
  const t = TRANSLATIONS[lang];

  // Feed source: 'preset' | 'webcam' | 'upload'
  const [feedMode, setFeedMode] = useState<'webcam' | 'preset' | 'upload'>('preset');
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [isSimRunning, setIsSimRunning] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundMuted, setSoundMuted] = useState(!settings.enableSoundAlerts);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);

  // Traffic signal state: 'red' | 'yellow' | 'green'
  const [trafficSignal, setTrafficSignal] = useState<'red' | 'yellow' | 'green'>('red');

  // Gemini Vision AI Analysis State
  const [isAnalyzingGemini, setIsAnalyzingGemini] = useState(false);
  const [geminiResult, setGeminiResult] = useState<GeminiAnalysisResult | null>(null);

  // HUD stats
  const [fps, setFps] = useState(30);
  const [latencyMs, setLatencyMs] = useState(15);
  const [scanPulse, setScanPulse] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Current scene & vehicles state
  const currentScene: PresetScene = PRESET_SCENES[activePresetIndex] || PRESET_SCENES[0];
  const [liveVehicles, setLiveVehicles] = useState<VehicleDetection[]>(
    JSON.parse(JSON.stringify(currentScene.vehicles))
  );

  // Reset vehicles when preset scene changes
  useEffect(() => {
    if (feedMode === 'preset') {
      setLiveVehicles(JSON.parse(JSON.stringify(currentScene.vehicles)));
      setTrafficSignal(currentScene.activeSignal);
      setGeminiResult(null);
    }
  }, [activePresetIndex, feedMode, currentScene]);

  // Webcam Management
  const startWebcam = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      setFeedMode('preset');
    }
  }, [facingMode]);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (feedMode === 'webcam') {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [feedMode, startWebcam, stopWebcam]);

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedMediaUrl(url);
      setFeedMode('upload');
      setGeminiResult(null);
      setLiveVehicles([
        {
          id: 'veh-upload-violator',
          type: 'suv',
          label: 'Vehicle Target #1',
          color: '#ef4444',
          status: 'violation',
          violationType: 'RED_LIGHT_RUNNER',
          violationTitle: 'Red Light Runner',
          violationTitleVi: 'Vượt Đèn Đỏ',
          confidence: 0.965,
          speedKmh: 64,
          speedLimitKmh: 50,
          plateNumber: '51K-892.44',
          lane: 'Lane 2',
          bbox: [35, 45, 26, 32],
          driverPose: {
            headBox: [44, 49, 6, 7],
            driverBox: [41, 49, 11, 15],
            helmetDetected: false,
            phoneDetected: true,
            seatbeltFastened: false,
            keypoints: [
              { name: 'head', x: 47, y: 52, score: 0.96 },
              { name: 'wrist', x: 49, y: 58, score: 0.91 },
            ],
          },
        },
      ]);
    }
  };

  // Cycle traffic signal (Red -> Green -> Yellow -> Red)
  const handleCycleSignal = () => {
    setTrafficSignal((prev) => {
      if (prev === 'red') return 'green';
      if (prev === 'green') return 'yellow';
      return 'red';
    });
  };

  // Real-time Motion Simulation & Computer Vision Frame Loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameCounter = 0;

    const renderLoop = (time: number) => {
      const delta = time - lastTime;
      frameCounter++;

      if (delta >= 1000) {
        setFps(Math.round((frameCounter * 1000) / delta));
        frameCounter = 0;
        lastTime = time;
        setLatencyMs(13 + Math.round(Math.random() * 4));
      }

      // Physics motion update for vehicles in simulation mode
      if (isSimRunning && feedMode === 'preset') {
        setLiveVehicles((prevVehicles) =>
          prevVehicles.map((veh) => {
            if (!veh.baseBbox || !veh.velocity) return veh;

            const [vx, vy] = veh.velocity;
            let [x, y, w, h] = veh.bbox;

            // Violator accelerates through intersection when signal is red
            if (veh.status === 'violation') {
              x += vx * 0.4;
              y += vy * 0.4;
            } else {
              // Safe vehicles brake before stop limit line if signal is red
              if (trafficSignal === 'red') {
                if (y < 58) {
                  y += vy * 0.1;
                }
              } else {
                // If green, safe vehicles move freely
                x += vx * 0.3;
                y += vy * 0.3;
              }
            }

            // Loop back when reaching bottom of screen
            if (y > 78 || x > 85) {
              x = veh.baseBbox[0];
              y = veh.baseBbox[1];
            }

            // Sync driver pose coordinates with vehicle
            let updatedPose = veh.driverPose;
            if (updatedPose) {
              const dx = x - veh.bbox[0];
              const dy = y - veh.bbox[1];
              updatedPose = {
                ...updatedPose,
                driverBox: [
                  updatedPose.driverBox[0] + dx,
                  updatedPose.driverBox[1] + dy,
                  updatedPose.driverBox[2],
                  updatedPose.driverBox[3],
                ],
                headBox: [
                  updatedPose.headBox[0] + dx,
                  updatedPose.headBox[1] + dy,
                  updatedPose.headBox[2],
                  updatedPose.headBox[3],
                ],
                keypoints: updatedPose.keypoints.map((kp) => ({
                  ...kp,
                  x: kp.x + dx,
                  y: kp.y + dy,
                })),
              };
            }

            return {
              ...veh,
              bbox: [x, y, w, h],
              driverPose: updatedPose,
            };
          })
        );
      }

      // Canvas Rendering
      const canvas = canvasRef.current;
      if (canvas && isScanning) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          if (feedMode === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
            ctx.drawImage(videoRef.current, 0, 0, w, h);
          } else {
            ctx.clearRect(0, 0, w, h);
          }

          drawComputerVisionOverlays(ctx, w, h, liveVehicles, {
            showDriverOverlay: settings.showDriverOverlay,
            showSpeedRadar: settings.showSpeedRadar,
            showLaneGuides: settings.showLaneGuides,
            activeSignal: trafficSignal,
            timestampMs: time,
          });
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isScanning, isSimRunning, feedMode, settings, trafficSignal]);

  // Capture Snapshot & Trigger Alert
  const handleCaptureScan = () => {
    sound.playShutterClick(!soundMuted);
    setScanPulse(true);
    setTimeout(() => setScanPulse(false), 400);

    const violator = liveVehicles.find((v) => v.status === 'violation') || liveVehicles[0];

    if (violator && violator.status === 'violation') {
      const isVi = lang === 'vi';
      const speechText = isVi
        ? `Cảnh báo: Phát hiện xe ${violator.plateNumber || ''} ${violator.violationTitleVi || 'vi phạm giao thông'}!`
        : `Warning: ${violator.violationTitle || 'Traffic Violation'} detected!`;

      sound.speakAlert(speechText, lang, settings.enableVoiceAlerts);

      const newIncident: IncidentRecord = {
        id: `inc-${Date.now().toString().slice(-4)}`,
        violationType: violator.violationType || 'RED_LIGHT_RUNNER',
        title: violator.violationTitle || 'Traffic Signal Breach',
        titleVi: violator.violationTitleVi || 'Vượt Đèn Đỏ',
        timestamp: new Date().toISOString(),
        timeFormatted: isVi ? 'Vừa xong · Quét Camera Trực Tiếp' : 'Just now · Live Camera Scan',
        location: isVi ? currentScene.locationVi : currentScene.location,
        confidenceScore: violator.confidence || 0.965,
        vehicle: {
          type: violator.type,
          label: violator.label,
          color: violator.color,
          plateNumber: violator.plateNumber || '51K-892.44',
          speedKmh: violator.speedKmh,
          speedLimitKmh: violator.speedLimitKmh,
        },
        driverDetails: {
          visible: !!violator.driverPose,
          helmetStatus: violator.type === 'motorcycle'
            ? (violator.driverPose?.helmetDetected ? 'Worn' : 'Not Detected')
            : 'N/A',
          seatbeltStatus: violator.driverPose?.seatbeltFastened ? 'Fastened' : 'Not Detected',
          distraction: violator.driverPose?.phoneDetected ? 'Cell Phone in Hand' : 'None Detected',
          poseConfidence: 0.94,
        },
        legalCode: violator.violationType === 'NO_HELMET'
          ? 'CVC § 27803 · Mandatory Safety Helmet'
          : 'CVC § 21453(a) · Red Signal Compliance',
        legalCodeVi: violator.violationType === 'NO_HELMET'
          ? 'NĐ 100/2019/NĐ-CP · Điểm b Khoản 4 Điều 2'
          : 'NĐ 100/2019/NĐ-CP · Điểm a Khoản 5 Điều 5 (Sửa đổi bởi NĐ 123/2021/NĐ-CP)',
        penaltyEstimate: '$490 Fine + 1 DMV Point',
        penaltyEstimateVi: violator.violationType === 'NO_HELMET'
          ? 'Phạt tiền từ 400.000đ - 600.000đ'
          : 'Phạt tiền từ 4.000.000đ - 6.000.000đ · Tước GPLX 1-3 tháng',
        detailedDescription: `Optical tracking registered vehicle entering regulated road zone at ${violator.speedKmh} km/h. Optical model classified driver pose and violation with ${Math.round(violator.confidence * 100)}% confidence score.`,
        detailedDescriptionVi: `Phương tiện vượt qua vạch dừng khi đèn tín hiệu màu đỏ với tốc độ ${violator.speedKmh} km/h. Mô hình thị giác máy tính nhận diện người lái và hành vi vi phạm với độ tin cậy ${Math.round(violator.confidence * 100)}%.`,
        imageSnapshot: feedMode === 'upload' && uploadedMediaUrl ? uploadedMediaUrl : currentScene.image,
        detectionCoordinates: {
          vehicleBbox: violator.bbox,
          driverBbox: violator.driverPose?.driverBox,
          headBbox: violator.driverPose?.headBox,
        },
        status: 'Validated',
      };

      onViolationDetected(newIncident);
    } else {
      sound.playSafePing(!soundMuted);
    }
  };

  // Analyze current frame with Gemini Vision API
  const handleAnalyzeWithGemini = async () => {
    setIsAnalyzingGemini(true);
    try {
      // Create snapshot from canvas or base image
      const canvas = canvasRef.current;
      let base64Image = '';
      if (canvas) {
        base64Image = canvas.toDataURL('image/jpeg', 0.85);
      }

      const response = await fetch('/api/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image || 'data:image/jpeg;base64,mock',
          language: lang,
          sceneContext: currentScene.name,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setGeminiResult(data.analysis);
        sound.playSafePing(!soundMuted);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsAnalyzingGemini(false);
    }
  };

  const safeCount = liveVehicles.filter((v) => v.status === 'safe').length;
  const violationCount = liveVehicles.filter((v) => v.status === 'violation').length;

  return (
    <div className="relative flex flex-col h-full bg-black text-slate-100 overflow-hidden select-none">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Hidden video element for webcam */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {/* Camera Viewport Canvas & Background Media */}
      <div className="relative flex-1 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Background photo */}
        {feedMode === 'preset' && (
          <img
            src={currentScene.image}
            alt={currentScene.name}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            referrerPolicy="no-referrer"
          />
        )}

        {feedMode === 'upload' && uploadedMediaUrl && (
          <img
            src={uploadedMediaUrl}
            alt="Uploaded Traffic Capture"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Live Canvas Overlay (Green safe boxes, Red violation boxes) */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
        />

        {/* Shutter flash pulse animation */}
        {scanPulse && (
          <div className="absolute inset-0 bg-white/70 z-30 pointer-events-none transition-opacity duration-300" />
        )}

        {/* Top HUD Overlay */}
        <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-auto">
          {/* AI Neural stats */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs shadow-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono font-bold text-[11px] text-white">YOLOv8-TRAFFIC</span>
            <span className="text-slate-500 font-mono">·</span>
            <span className="font-mono text-[10px] text-emerald-400">{fps} FPS</span>
            <span className="text-slate-500 font-mono">·</span>
            <span className="font-mono text-[10px] text-slate-300">{latencyMs}ms</span>
          </div>

          {/* Quick HUD controls */}
          <div className="flex items-center gap-1.5">
            {/* Traffic Signal Cycler Button */}
            <button
              onClick={handleCycleSignal}
              className={`px-2 py-1 rounded-xl backdrop-blur-md border flex items-center gap-1.5 text-xs font-mono font-bold transition-all ${
                trafficSignal === 'red'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : trafficSignal === 'yellow'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              }`}
              title="Click to cycle traffic light (Red / Green / Yellow)"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  trafficSignal === 'red'
                    ? 'bg-rose-500 animate-pulse'
                    : trafficSignal === 'yellow'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="uppercase">{trafficSignal}</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className={`p-2 rounded-xl backdrop-blur-md border transition-colors ${
                soundMuted
                  ? 'bg-slate-900/80 border-slate-800 text-slate-400'
                  : 'bg-rose-950/70 border-rose-600/60 text-rose-300'
              }`}
              title={soundMuted ? 'Unmute alert audio' : 'Mute alert audio'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Flip Camera */}
            <button
              onClick={handleFlipCamera}
              className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-200 hover:text-white transition-colors"
              title="Flip camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Detected Count HUD */}
        <div className="absolute top-14 left-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Safe: {safeCount}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/80 backdrop-blur-md border border-rose-500/50 text-rose-300 text-xs font-mono font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Violation: {violationCount}</span>
          </div>
        </div>

        {/* Gemini Vision Results Floating Overlay Card if active */}
        {geminiResult && (
          <div className="absolute top-14 right-3 z-30 max-w-[240px] p-3 rounded-2xl bg-slate-950/90 backdrop-blur-lg border border-indigo-500/40 shadow-2xl text-xs space-y-1.5 animate-in fade-in slide-in-from-right-4 pointer-events-auto">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-indigo-400 flex items-center gap-1 text-[10px]">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>GEMINI VISION 3.8</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                {Math.round(geminiResult.confidenceScore * 100)}%
              </span>
            </div>

            <p className="text-[11px] font-bold text-white leading-tight">
              {geminiResult.primaryViolation}
            </p>

            <div className="text-[10px] text-slate-300 space-y-0.5 font-mono">
              <p>Plate: <span className="text-amber-300 font-bold">{geminiResult.licensePlateDetected}</span></p>
              <p className="truncate text-slate-400">{geminiResult.driverAssessment.helmetCompliance}</p>
            </div>

            <p className="text-[9px] text-slate-400 border-t border-slate-800 pt-1 leading-snug">
              {geminiResult.legalStatuteNotice}
            </p>
          </div>
        )}

        {/* Scene location & speed limit overlay indicator */}
        <div className="absolute bottom-28 inset-x-3 z-20 flex items-end justify-between pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs max-w-[70%]">
            <p className="font-semibold text-white truncate text-[11px]">
              {feedMode === 'webcam'
                ? t.webcam
                : feedMode === 'upload'
                ? t.upload
                : lang === 'vi' ? currentScene.nameVi : currentScene.name}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {feedMode === 'webcam'
                ? 'Camera cảm biến đường phố'
                : lang === 'vi' ? currentScene.locationVi : currentScene.location}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-white text-slate-950 border-4 border-rose-600 font-extrabold text-xs shadow-lg">
            <span className="text-[9px] font-sans font-bold leading-none">LIMIT</span>
            <span className="text-sm font-mono leading-none">{currentScene.speedLimit}</span>
          </div>
        </div>

        {/* Crosshair Center Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
          <Crosshair className="w-16 h-16 text-white stroke-[1]" />
        </div>
      </div>

      {/* Preset Feeds & Mode Bar */}
      <div className="px-3 py-2 bg-slate-950/95 border-t border-slate-800/80 z-20">
        <div className="flex items-center justify-between gap-1 max-w-md mx-auto text-xs">
          {/* Preset 1 */}
          <button
            onClick={() => {
              setFeedMode('preset');
              setActivePresetIndex(0);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              feedMode === 'preset' && activePresetIndex === 0
                ? 'bg-rose-600 text-white font-semibold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'vi' ? 'Ngã Tư' : 'Intersection'}
          </button>

          {/* Preset 2 */}
          <button
            onClick={() => {
              setFeedMode('preset');
              setActivePresetIndex(1);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              feedMode === 'preset' && activePresetIndex === 1
                ? 'bg-rose-600 text-white font-semibold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'vi' ? 'Cao Tốc' : 'Highway'}
          </button>

          {/* Preset 3 */}
          <button
            onClick={() => {
              setFeedMode('preset');
              setActivePresetIndex(2);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              feedMode === 'preset' && activePresetIndex === 2
                ? 'bg-rose-600 text-white font-semibold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'vi' ? 'Xe Máy' : 'Motorcycle'}
          </button>

          {/* Live Device Camera */}
          <button
            onClick={() => setFeedMode('webcam')}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
              feedMode === 'webcam'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Live</span>
          </button>

          {/* Gemini AI Scan Trigger */}
          <button
            onClick={handleAnalyzeWithGemini}
            disabled={isAnalyzingGemini}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 border border-indigo-500/50 ${
              isAnalyzingGemini
                ? 'bg-indigo-900 text-indigo-300 animate-pulse'
                : 'bg-indigo-600/90 text-white hover:bg-indigo-500 shadow-sm'
            }`}
            title="Analyze frame with Gemini Vision"
          >
            <BrainCircuit className="w-3 h-3" />
            <span>{isAnalyzingGemini ? 'AI...' : 'Gemini'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Physical Shutter / Scan Button Section */}
      <div className="bg-slate-950 px-4 py-3.5 border-t border-slate-900 flex items-center justify-around z-20">
        {/* Play / Pause Traffic Simulation */}
        <button
          onClick={() => setIsSimRunning(!isSimRunning)}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
          title={isSimRunning ? t.simulationPlaying : t.simulationPaused}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            {isSimRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </div>
          <span className="text-[10px] font-mono">{isSimRunning ? 'Pause' : 'Play'}</span>
        </button>

        {/* Primary Shutter Button (Requirement 2 & 3) */}
        <button
          onClick={handleCaptureScan}
          className="relative group p-1.5 rounded-full border-4 border-rose-500/80 hover:border-white transition-all transform active:scale-90"
          aria-label="Capture and scan traffic frame"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center shadow-lg shadow-rose-900/60 group-hover:scale-95 transition-transform">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono uppercase tracking-wider text-rose-400 font-bold">
            {lang === 'vi' ? 'Quét & Báo Động' : 'Scan & Alert'}
          </span>
        </button>

        {/* AI Model Trigger / Pause overlay */}
        <button
          onClick={() => setIsScanning(!isScanning)}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
              isScanning
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono">{isScanning ? t.activeAi : t.pausedAi}</span>
        </button>
      </div>
    </div>
  );
};
