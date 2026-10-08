export type VehicleType = 'sedan' | 'suv' | 'motorcycle' | 'truck' | 'bus' | 'van';

export type ViolationType = 
  | 'RED_LIGHT_RUNNER'
  | 'WRONG_WAY'
  | 'NO_HELMET'
  | 'SPEED_EXCESS'
  | 'CROSSWALK_ENCROACHMENT'
  | 'PHONE_USE';

export type ViolationSeverity = 'critical' | 'high' | 'warning';

export interface DriverPoseInfo {
  headBox: [number, number, number, number]; // [x, y, w, h] in % (0-100)
  driverBox: [number, number, number, number]; // [x, y, w, h]
  helmetDetected: boolean;
  phoneDetected: boolean;
  seatbeltFastened: boolean;
  keypoints: Array<{
    name: string;
    x: number;
    y: number;
    score: number;
  }>;
}

export interface VehicleDetection {
  id: string;
  type: VehicleType;
  label: string;
  status: 'safe' | 'violation' | 'warning';
  bbox: [number, number, number, number]; // [x, y, width, height] in % (0-100)
  velocity?: [number, number]; // [vx, vy] in % per frame
  baseBbox?: [number, number, number, number]; // reset anchor
  confidence: number; // 0.0 - 1.0
  speedKmh: number;
  speedLimitKmh: number;
  violationType?: ViolationType;
  violationTitle?: string;
  violationTitleVi?: string;
  violationSeverity?: ViolationSeverity;
  plateNumber?: string;
  lane: string;
  driverPose?: DriverPoseInfo;
  color: string;
  direction?: 'forward' | 'reverse' | 'wrong-way' | 'turning';
}

export interface GeminiAnalysisResult {
  detectedVehiclesCount: number;
  primaryViolation: string;
  licensePlateDetected: string;
  driverAssessment: {
    helmetCompliance: string;
    phoneDistraction: string;
    seatbeltObserved: string;
  };
  recommendedAction: string;
  legalStatuteNotice: string;
  confidenceScore: number;
  generatedAt: string;
}

export interface IncidentRecord {
  id: string;
  violationType: ViolationType;
  title: string;
  titleVi?: string;
  timestamp: string;
  timeFormatted: string;
  location: string;
  confidenceScore: number;
  vehicle: {
    type: VehicleType;
    label: string;
    color: string;
    plateNumber: string;
    speedKmh: number;
    speedLimitKmh: number;
  };
  driverDetails: {
    visible: boolean;
    helmetStatus: 'Worn' | 'Not Detected' | 'N/A';
    seatbeltStatus: 'Fastened' | 'Not Detected' | 'N/A';
    distraction: 'None Detected' | 'Cell Phone in Hand' | 'Unknown';
    poseConfidence: number;
  };
  legalCode: string;
  legalCodeVi?: string;
  penaltyEstimate: string;
  penaltyEstimateVi?: string;
  detailedDescription: string;
  detailedDescriptionVi?: string;
  imageSnapshot: string;
  detectionCoordinates: {
    vehicleBbox: [number, number, number, number];
    driverBbox?: [number, number, number, number];
    headBbox?: [number, number, number, number];
  };
  status: 'Validated' | 'Pending Review' | 'Dismissed';
  geminiAnalysis?: GeminiAnalysisResult;
}

export interface AppSettings {
  detectionConfidenceThreshold: number; // 0.50 - 0.95
  enableSoundAlerts: boolean;
  enableVoiceAlerts: boolean;
  autoCaptureViolations: boolean;
  alertCooldownSeconds: number;
  activeViolations: Record<ViolationType, boolean>;
  showDriverOverlay: boolean;
  showSpeedRadar: boolean;
  showLaneGuides: boolean;
  cameraResolution: '720p' | '1080p' | '4k';
  language: 'vi' | 'en';
}

export interface PresetScene {
  id: string;
  name: string;
  nameVi: string;
  subtitle: string;
  image: string;
  location: string;
  locationVi: string;
  speedLimit: number;
  vehicles: VehicleDetection[];
  activeSignal: 'red' | 'yellow' | 'green';
}
