export type Language = 'vi' | 'en';

export interface Translations {
  appName: string;
  slogan: string;
  scanCamera: string;
  scanCameraNow: string;
  uploadVideo: string;
  uploadDesc: string;
  settings: string;
  settingsDesc: string;
  todayTelemetry: string;
  todayViolations: string;
  todayWarnings: string;
  eventsUnit: string;
  warningsUnit: string;
  recentViolations: string;
  viewAll: string;
  onlineStatus: string;
  visionAiEnforcement: string;
  back: string;
  backToFeed: string;
  incidentDetails: string;
  confidence: string;
  violationType: string;
  timestamp: string;
  location: string;
  observedSpeed: string;
  speedLimit: string;
  driverCabin: string;
  driverDiagnostics: string;
  helmetStatus: string;
  seatbeltStatus: string;
  driverAttention: string;
  vehicleSpecs: string;
  licensePlate: string;
  statutoryCode: string;
  estimatedPenalty: string;
  enforcementStatus: string;
  exportCitation: string;
  printCitation: string;
  officialCitationTicket: string;
  dismiss: string;
  viewDetails: string;
  realtimeAlert: string;
  trafficViolationDetected: string;
  nextScene: string;
  webcam: string;
  upload: string;
  activeAi: string;
  pausedAi: string;
  voiceAlerts: string;
  audibleAlarms: string;
  detectionThreshold: string;
  nativeCodeTitle: string;
  trafficSignal: string;
  cycleSignal: string;
  simulationPlaying: string;
  simulationPaused: string;
  analyzeGemini: string;
  analyzingGemini: string;
  geminiReport: string;
  inspectDriver: string;
  inspectPlate: string;
  overview: string;
  citationNotice: string;
  paymentNotice: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  vi: {
    appName: 'SafeTraffic AI',
    slogan: 'An toàn trên mọi làn đường — Trực quan hóa AI & Thị giác Máy tính',
    scanCamera: 'Quét Camera',
    scanCameraNow: 'Bắt đầu Quét Camera',
    uploadVideo: 'Tải Video / Ảnh',
    uploadDesc: 'Phân tích video giao thông hoặc ảnh',
    settings: 'Cài Đặt',
    settingsDesc: 'Độ nhạy, âm thanh & mô hình',
    todayTelemetry: 'Dữ Liệu An Toàn Giao Thông Hôm Nay',
    todayViolations: 'Vi Phạm Hôm Nay',
    todayWarnings: 'Cảnh Báo Hôm Nay',
    eventsUnit: 'vụ vi phạm',
    warningsUnit: 'cảnh báo',
    recentViolations: 'Lịch Sử Phân Tích Gần Đây',
    viewAll: 'Xem tất cả',
    onlineStatus: 'Hoạt động',
    visionAiEnforcement: 'Hệ Thống Giám Sát Thị Giác AI',
    back: 'Quay lại',
    backToFeed: 'Quay lại Luồng Giám Sát',
    incidentDetails: 'Chi Tiết Vi Phạm',
    confidence: 'Độ Tin Cậy',
    violationType: 'Hành Vi Vi Phạm',
    timestamp: 'Thời Điểm',
    location: 'Địa Điểm',
    observedSpeed: 'Tốc Độ Đo Được',
    speedLimit: 'Giới Hạn Tốc Độ',
    driverCabin: 'Vùng Người Lái',
    driverDiagnostics: 'Chẩn Đoán Tư Thế & Hành Vi Người Lái',
    helmetStatus: 'Mũ Bảo Hiểm',
    seatbeltStatus: 'Dây An Toàn',
    driverAttention: 'Sự Tập Trung',
    vehicleSpecs: 'Thông Tin Phương Tiện & Radar',
    licensePlate: 'Biển Số Xe',
    statutoryCode: 'Điều Khoản Pháp Lý',
    estimatedPenalty: 'Mức Phạt Dự Kiến',
    enforcementStatus: 'Trạng Thái Xử Lý',
    exportCitation: 'Xuất Dữ Liệu Biên Bản',
    printCitation: 'In Biên Bản Xử Phạt',
    officialCitationTicket: 'BIÊN BẢN VI PHẠM GIAO THÔNG ĐIỆN TỬ',
    dismiss: 'Bỏ Qua',
    viewDetails: 'Xem Chi Tiết',
    realtimeAlert: 'Cảnh Báo Thời Gian Thực',
    trafficViolationDetected: 'Phát Hiện Vi Phạm Giao Thông',
    nextScene: 'Đổi Cảnh',
    webcam: 'Camera Trực Tiếp',
    upload: 'Tải Tệp Lên',
    activeAi: 'AI Đang Quét',
    pausedAi: 'Tạm Dừng',
    voiceAlerts: 'Giọng Nói Cảnh Báo',
    audibleAlarms: 'Âm Thanh Cảnh Báo',
    detectionThreshold: 'Ngưỡng Nhận Diện',
    nativeCodeTitle: 'Mã Nguồn Native (Flutter & React Native)',
    trafficSignal: 'Đèn Tín Hiệu',
    cycleSignal: 'Đổi Đèn Giao Thông',
    simulationPlaying: 'Mô phỏng đang chạy',
    simulationPaused: 'Mô phỏng tạm dừng',
    analyzeGemini: 'Phân Tích Bằng Gemini Vision',
    analyzingGemini: 'Gemini đang quét...',
    geminiReport: 'Báo Cáo Đánh Giá AI Gemini',
    inspectDriver: 'Soi Người Lái',
    inspectPlate: 'Soi Biển Số',
    overview: 'Toàn Cảnh',
    citationNotice: 'Căn cứ Nghị định 100/2019/NĐ-CP và Nghị định 123/2021/NĐ-CP về xử phạt vi phạm hành chính lĩnh vực giao thông đường bộ.',
    paymentNotice: 'Vui lòng nộp phạt qua Cổng Dịch vụ công Quốc gia hoặc kho bạc Nhà nước trong thời hạn 10 ngày.',
  },
  en: {
    appName: 'SafeTraffic AI',
    slogan: 'Zero Harm on Every Lane — Powered by Real-Time Computer Vision',
    scanCamera: 'Scan Camera',
    scanCameraNow: 'Start Live Camera Scan',
    uploadVideo: 'Upload Video',
    uploadDesc: 'Analyze traffic clip or photo',
    settings: 'Settings',
    settingsDesc: 'Sensitivity, audio & models',
    todayTelemetry: "Today's Road Safety Telemetry",
    todayViolations: "Today's Violations",
    todayWarnings: "Today's Warnings",
    eventsUnit: 'events',
    warningsUnit: 'warnings',
    recentViolations: 'Analysis History',
    viewAll: 'View All',
    onlineStatus: 'Online',
    visionAiEnforcement: 'Vision AI Enforcement',
    back: 'Back',
    backToFeed: 'Back to Feed',
    incidentDetails: 'Incident Analysis',
    confidence: 'AI Confidence',
    violationType: 'Violation Type',
    timestamp: 'Timestamp',
    location: 'Location',
    observedSpeed: 'Observed Speed',
    speedLimit: 'Speed Limit',
    driverCabin: 'Driver Cabin',
    driverDiagnostics: 'Highlighted Driver Diagnostics',
    helmetStatus: 'Helmet Safety',
    seatbeltStatus: 'Seatbelt Status',
    driverAttention: 'Driver Attention',
    vehicleSpecs: 'Vehicle Specifications & Radar',
    licensePlate: 'License Plate',
    statutoryCode: 'Statutory Code',
    estimatedPenalty: 'Estimated Penalty',
    enforcementStatus: 'Enforcement Status',
    exportCitation: 'Export Citation Report',
    printCitation: 'Print Citation Notice',
    officialCitationTicket: 'OFFICIAL TRAFFIC VIOLATION CITATION',
    dismiss: 'Dismiss',
    viewDetails: 'View Details',
    realtimeAlert: 'Real-Time AI Alert',
    trafficViolationDetected: 'Traffic Violation Detected',
    nextScene: 'Next Scene',
    webcam: 'Webcam',
    upload: 'Upload',
    activeAi: 'AI Active',
    pausedAi: 'Paused',
    voiceAlerts: 'Voice Announcements',
    audibleAlarms: 'Audible Violation Alarms',
    detectionThreshold: 'Confidence Threshold',
    nativeCodeTitle: 'Native Mobile Architecture & Code',
    trafficSignal: 'Traffic Signal',
    cycleSignal: 'Cycle Traffic Light',
    simulationPlaying: 'Simulation Playing',
    simulationPaused: 'Simulation Paused',
    analyzeGemini: 'Analyze with Gemini Vision',
    analyzingGemini: 'Gemini Scanning...',
    geminiReport: 'Gemini Vision AI Evaluation',
    inspectDriver: 'Driver Crop',
    inspectPlate: 'Plate OCR',
    overview: 'Overview',
    citationNotice: 'Issued pursuant to applicable vehicle code and statutory highway traffic enforcement laws.',
    paymentNotice: 'Please remit payment via state citation portal or municipal court clerk within 21 calendar days.',
  },
};
