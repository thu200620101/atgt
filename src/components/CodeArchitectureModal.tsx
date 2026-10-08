import React, { useState } from 'react';
import { X, Copy, Check, Code2, Smartphone, Terminal, Cpu, Layers } from 'lucide-react';

interface CodeArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeArchitectureModal: React.FC<CodeArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'flutter' | 'react-native' | 'pipeline'>('flutter');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const flutterCode = `// lib/features/traffic_scan/presentation/traffic_camera_screen.dart
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:tflite_flutter/tflite_flutter.dart';

class SafeTrafficScanScreen extends StatefulWidget {
  const SafeTrafficScanScreen({Key? key}) : super(key: key);

  @override
  State<SafeTrafficScanScreen> createState() => _SafeTrafficScanScreenState();
}

class _SafeTrafficScanScreenState extends State<SafeTrafficScanScreen> {
  CameraController? _cameraController;
  Interpreter? _interpreter;
  bool _isProcessingFrame = false;
  List<VehicleDetection> _detections = [];

  @override
  void initState() {
    super.initState();
    _initCameraAndModel();
  }

  Future<void> _initCameraAndModel() async {
    // 1. Load YOLOv8-Traffic quantized model
    _interpreter = await Interpreter.fromAsset('assets/models/yolov8n_traffic_float16.tflite');

    // 2. Initialize CameraController with 30fps streaming
    final cameras = await availableCameras();
    _cameraController = CameraController(
      cameras.firstWhere((c) => c.lensDirection == CameraLensDirection.back),
      ResolutionPreset.high,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.yuv420,
    );

    await _cameraController!.initialize();
    _cameraController!.startImageStream((CameraImage image) {
      if (!_isProcessingFrame) {
        _isProcessingFrame = true;
        _runInference(image).then((_) => _isProcessingFrame = false);
      }
    });
    setState(() {});
  }

  Future<void> _runInference(CameraImage image) async {
    // Tensor input normalization and YOLOv8 inference loop
    // Outputs: Bounding boxes [ymin, xmin, ymax, xmax], classes, confidences
    final detected = await TrafficVisionEngine.process(image, _interpreter!);
    setState(() => _detections = detected);

    // Trigger Real-time Alert popup if violation detected
    for (var d in detected) {
      if (d.isViolation && !d.alerted) {
        d.alerted = true;
        _showViolationAlert(d);
        break;
      }
    }
  }

  void _showViolationAlert(VehicleDetection violation) {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ViolationAlertSheet(
        violationType: violation.typeString,
        confidence: violation.confidence,
        timestamp: DateTime.now(),
        location: "Main St & 4th Ave Intersection",
        onDismiss: () => Navigator.pop(ctx),
        onViewDetails: () {
          Navigator.pop(ctx);
          Navigator.pushNamed(context, '/detail', arguments: violation);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      body: Stack(
        children: [
          CameraPreview(_cameraController!),
          // AI Bounding Box Overlay
          CustomPaint(
            painter: BoundingBoxPainter(detections: _detections),
            size: Size.infinite,
          ),
          // HUD & Shutter Controls
          Positioned(bottom: 30, left: 0, right: 0, child: _buildShutterButton()),
        ],
      ),
    );
  }
}

// Bounding Box Painter: Green for safe, Red for violation
class BoundingBoxPainter extends CustomPainter {
  final List<VehicleDetection> detections;
  BoundingBoxPainter({required this.detections});

  @override
  void paint(Canvas canvas, Size size) {
    for (var v in detections) {
      final paint = Paint()
        ..color = v.isViolation ? Colors.redAccent : Colors.greenAccent
        ..style = PaintingStyle.stroke
        ..strokeWidth = v.isViolation ? 3.5 : 2.0;

      final rect = Rect.fromLTWH(
        v.x * size.width, v.y * size.height, 
        v.width * size.width, v.height * size.height
      );
      canvas.drawRect(rect, paint);

      // Draw Driver Cabin and Head Position Highlight
      if (v.driverBox != null) {
        final driverPaint = Paint()..color = Colors.cyanAccent..style = PaintingStyle.stroke;
        canvas.drawRect(Rect.fromLTWH(
          v.driverBox!.x * size.width, v.driverBox!.y * size.height,
          v.driverBox!.width * size.width, v.driverBox!.height * size.height
        ), driverPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}`;

  const reactNativeCode = `// src/screens/CameraScanScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { Canvas, Rect, Text as SkiaText } from '@shopify/react-native-skia';
import { useTrafficStore } from '../store/trafficStore';
import { ViolationAlertModal } from '../components/ViolationAlertModal';

export const CameraScanScreen = ({ navigation }: any) => {
  const device = useCameraDevice('back');
  const model = useTensorflowModel(require('../assets/yolov8n_traffic.tflite'));
  const { activeAlert, setAlert, dismissAlert } = useTrafficStore();
  const [detections, setDetections] = useState<any[]>([]);

  // High-performance real-time Worklet frame processor
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (model.state !== 'loaded') return;

    // Run YOLO inference directly in C++ worker thread
    const outputs = model.model.runSync([frame]);
    const parsedBoxes = parseYoloOutput(outputs[0]);

    // Check for violations (Red light, no helmet, wrong-way)
    for (const box of parsedBoxes) {
      if (box.isViolation) {
        setAlert({
          type: box.violationType,
          confidence: box.confidence,
          location: 'Grand Ave & 5th St',
          timestamp: new Date().toISOString(),
          vehicle: box,
        });
        break;
      }
    }
  }, [model]);

  return (
    <View style={styles.container}>
      {device && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          fps={30}
        />
      )}

      {/* Skia Hardware-Accelerated Bounding Boxes */}
      <Canvas style={StyleSheet.absoluteFill}>
        {detections.map((veh, idx) => (
          <Rect
            key={idx}
            x={veh.x}
            y={veh.y}
            width={veh.width}
            height={veh.height}
            color={veh.isViolation ? '#ef4444' : '#22c55e'} // Red vs Green
            style="stroke"
            strokeWidth={veh.isViolation ? 3 : 2}
          />
        ))}
      </Canvas>

      {/* Real-time Alert Popup (Requirement 4) */}
      <ViolationAlertModal
        visible={!!activeAlert}
        alert={activeAlert}
        onDismiss={dismissAlert}
        onViewDetails={() => {
          const alert = activeAlert;
          dismissAlert();
          navigation.navigate('DetailView', { incident: alert });
        }}
      />
    </View>
  );
};`;

  const pipelineSpec = `# SafeTraffic AI — Edge Computer Vision Pipeline Architecture

1. Model Hierarchy & Execution Pipeline:
┌─────────────────────────────────────────────────────────────┐
│ 1. Raw Camera Stream (30 FPS, 1280x720 YUV420)              │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Pre-Processing & Letterboxing (416x416 RGB Tensor)        │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Primary Object Detection: YOLOv8n-Traffic (INT8/FP16)     │
│    - Classes: Car, SUV, Bus, Truck, Motorcycle, Pedestrian  │
│    - Non-violating vehicles -> Green Bounding Box (#22c55e) │
│    - Violating vehicles     -> Red Bounding Box   (#ef4444) │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Driver Pose & Attention: YOLOv8n-Pose (Secondary pass)   │
│    - Keypoints: Head crown, Eyes, Neck, Shoulders, Wrists   │
│    - Classifies Helmet Worn vs Unprotected Rider            │
│    - Classifies Mobile Phone Hand-to-Ear Attention Drift    │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Trajectory & Rule Evaluation Engine                      │
│    - Traffic Light Phase Intersect (Stop Limit Line Math)   │
│    - Optical Flow Lucas-Kanade Speed Vector Estimation      │
│    - Wrong-Way Vector Directional Dot-Product Check         │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Real-Time Alert Dispatch (Popup within 100ms)            │
│    - Violation Type · Timestamp · Location · AI Confidence  │
│    - "View Details" & "Dismiss" Action Handlers             │
└─────────────────────────────────────────────────────────────┘`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Native Mobile Architecture & Code
              </h2>
              <p className="text-[11px] text-slate-400">
                Flutter (Dart) & React Native (Vision Camera + TFLite)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('flutter')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'flutter'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Flutter (Dart)</span>
          </button>

          <button
            onClick={() => setActiveTab('react-native')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'react-native'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>React Native (TS)</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'pipeline'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Computer Vision Pipeline</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="relative flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-slate-300">
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={() => {
                const code = activeTab === 'flutter' ? flutterCode : activeTab === 'react-native' ? reactNativeCode : pipelineSpec;
                copyCode(activeTab, code);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
            >
              {copiedKey === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="overflow-x-auto whitespace-pre leading-relaxed select-text">
            {activeTab === 'flutter' && flutterCode}
            {activeTab === 'react-native' && reactNativeCode}
            {activeTab === 'pipeline' && pipelineSpec}
          </pre>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Targeting iOS (CoreML/Metal) & Android (NNAPI/GPU Delegate)</span>
          <span className="font-mono text-rose-400">SafeTraffic AI v1.0-Prod</span>
        </div>
      </div>
    </div>
  );
};
