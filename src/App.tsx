import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomTabBar, TabKey } from './components/BottomTabBar';
import { HomeScreen } from './components/HomeScreen';
import { CameraScanScreen } from './components/CameraScanScreen';
import { DetailViewScreen } from './components/DetailViewScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { ViolationAlertModal } from './components/ViolationAlertModal';
import { SettingsModal } from './components/SettingsModal';
import { CodeArchitectureModal } from './components/CodeArchitectureModal';
import { MobileFrameWrapper } from './components/MobileFrameWrapper';
import { IncidentRecord, AppSettings } from './types/traffic';
import { INITIAL_INCIDENT_RECORDS } from './utils/trafficData';

export default function App() {
  // Navigation & Screen State
  const [currentTab, setCurrentTab] = useState<TabKey>('home');
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [activeAlert, setActiveAlert] = useState<IncidentRecord | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // App Data & History State
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENT_RECORDS);

  // Settings State (Defaults to Vietnamese 'vi')
  const [settings, setSettings] = useState<AppSettings>({
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
    language: 'vi',
  });

  const handleToggleLanguage = () => {
    setSettings((prev) => ({
      ...prev,
      language: prev.language === 'vi' ? 'en' : 'vi',
    }));
  };

  // Today's summary counts
  const todayViolationsCount = incidents.filter(
    (inc) =>
      inc.violationType === 'RED_LIGHT_RUNNER' ||
      inc.violationType === 'WRONG_WAY' ||
      inc.violationType === 'NO_HELMET' ||
      inc.violationType === 'SPEED_EXCESS'
  ).length;

  const todayWarningsCount =
    incidents.filter(
      (inc) => inc.violationType === 'CROSSWALK_ENCROACHMENT' || inc.status === 'Pending Review'
    ).length + 4;

  // Real-time violation detected handler
  const handleViolationDetected = (newIncident: IncidentRecord) => {
    setIncidents((prev) => [newIncident, ...prev]);
    setActiveAlert(newIncident);
  };

  const handleViewDetails = (incident: IncidentRecord) => {
    setActiveAlert(null);
    setSelectedIncident(incident);
  };

  const handleDismissAlert = () => {
    setActiveAlert(null);
  };

  const handleUpdateIncidentStatus = (
    id: string,
    newStatus: 'Validated' | 'Pending Review' | 'Dismissed'
  ) => {
    setIncidents((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleUploadMedia = (_file: File) => {
    setCurrentTab('camera');
  };

  const handleSelectTab = (tab: TabKey) => {
    if (tab === 'code') {
      setIsCodeModalOpen(true);
      return;
    }
    setSelectedIncident(null);
    setCurrentTab(tab);
  };

  const isVi = settings.language === 'vi';

  return (
    <MobileFrameWrapper isMobileFrame={isMobileFrame}>
      {/* Top Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        language={settings.language}
        onToggleLanguage={handleToggleLanguage}
        currentScreenTitle={
          selectedIncident
            ? isVi ? 'Chi Tiết Vi Phạm' : 'Incident Analysis'
            : currentTab === 'camera'
            ? isVi ? 'Quét Camera Trực Tiếp' : 'Live AI Camera Scan'
            : currentTab === 'history'
            ? isVi ? 'Nhật Ký Vi Phạm' : 'Violation History'
            : undefined
        }
        onBack={selectedIncident ? () => setSelectedIncident(null) : undefined}
      />

      {/* Screen Routing */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {selectedIncident ? (
          /* Requirement 5: Detail View Screen */
          <DetailViewScreen
            incident={selectedIncident}
            onBack={() => setSelectedIncident(null)}
            onUpdateStatus={handleUpdateIncidentStatus}
            language={settings.language}
          />
        ) : currentTab === 'camera' ? (
          /* Requirement 2 & 3: Camera Scan & AI Analysis Overlays */
          <CameraScanScreen
            onViolationDetected={handleViolationDetected}
            onNavigateToDetail={handleViewDetails}
            settings={settings}
          />
        ) : currentTab === 'history' ? (
          /* History Screen */
          <HistoryScreen
            incidents={incidents}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onBack={() => setCurrentTab('home')}
            language={settings.language}
          />
        ) : (
          /* Requirement 1: Home Screen (Dashboard) */
          <HomeScreen
            onScanCamera={() => setCurrentTab('camera')}
            onUploadMedia={handleUploadMedia}
            onViewHistory={() => setCurrentTab('history')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onSelectPreset={(_idx) => setCurrentTab('camera')}
            todayViolationsCount={todayViolationsCount}
            todayWarningsCount={todayWarningsCount}
            recentIncidents={incidents}
            language={settings.language}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      {!selectedIncident && (
        <BottomTabBar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          unreviewedCount={incidents.filter((i) => i.status === 'Pending Review').length}
        />
      )}

      {/* Requirement 4: Real-time Alert System Popup Modal */}
      <ViolationAlertModal
        alert={activeAlert}
        onViewDetails={handleViewDetails}
        onDismiss={handleDismissAlert}
        soundEnabled={settings.enableSoundAlerts}
        voiceEnabled={settings.enableVoiceAlerts}
        language={settings.language}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Native Mobile Code Architecture Modal (Flutter & React Native) */}
      <CodeArchitectureModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </MobileFrameWrapper>
  );
}
