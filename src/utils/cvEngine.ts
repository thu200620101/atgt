import { VehicleDetection } from '../types/traffic';

export interface RenderOptions {
  showDriverOverlay: boolean;
  showSpeedRadar: boolean;
  showLaneGuides: boolean;
  activeSignal?: 'red' | 'yellow' | 'green';
  timestampMs?: number;
}

/**
 * Draws professional computer vision bounding boxes, driver pose highlights,
 * speed vectors, and violation HUD over HTML5 Canvas.
 */
export function drawComputerVisionOverlays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  vehicles: VehicleDetection[],
  options: RenderOptions
) {
  const now = options.timestampMs || Date.now();
  const pulse = 0.5 + 0.5 * Math.sin(now / 180);

  // 1. Draw Lane Guidance Vectors if enabled
  if (options.showLaneGuides) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);

    // Left lane boundary
    ctx.beginPath();
    ctx.moveTo(width * 0.1, height);
    ctx.lineTo(width * 0.42, height * 0.42);
    ctx.stroke();

    // Center divider
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height);
    ctx.lineTo(width * 0.49, height * 0.42);
    ctx.stroke();

    // Right lane boundary
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(width * 0.9, height);
    ctx.lineTo(width * 0.56, height * 0.42);
    ctx.stroke();

    // Crosswalk / Stop Limit Line
    if (options.activeSignal === 'red') {
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.3})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(width * 0.15, height * 0.68);
      ctx.lineTo(width * 0.85, height * 0.68);
      ctx.stroke();

      // Red limit label
      ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('STOP LIMIT LINE · SIGNAL RED', width * 0.16, height * 0.68 - 6);
    }
    ctx.restore();
  }

  // 2. Render Vehicle Bounding Boxes
  vehicles.forEach((veh) => {
    const [bx, by, bw, bh] = veh.bbox;
    const x = (bx / 100) * width;
    const y = (by / 100) * height;
    const w = (bw / 100) * width;
    const h = (bh / 100) * height;

    const isViolation = veh.status === 'violation';
    const isWarning = veh.status === 'warning';

    // Non-violating vehicles are highlighted with Green bounding boxes.
    // Violating vehicles are highlighted with Red bounding boxes.
    const primaryColor = isViolation ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e';
    const bgFill = isViolation 
      ? `rgba(239, 68, 68, ${0.12 + pulse * 0.08})`
      : isWarning 
      ? 'rgba(245, 158, 11, 0.08)' 
      : 'rgba(34, 197, 94, 0.06)';

    ctx.save();

    // Box translucent fill
    ctx.fillStyle = bgFill;
    ctx.fillRect(x, y, w, h);

    // Glowing border for violations
    if (isViolation) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8 + pulse * 6;
    } else {
      ctx.shadowBlur = 0;
    }

    // Outer bounding box outline
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = isViolation ? 2.5 : 1.75;
    ctx.strokeRect(x, y, w, h);

    // Tactical corner reticles for authentic CV look
    const cornerSize = Math.min(w, h) * 0.18;
    ctx.lineWidth = isViolation ? 3.5 : 2.5;
    ctx.beginPath();
    // Top-left
    ctx.moveTo(x, y + cornerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerSize, y);
    // Top-right
    ctx.moveTo(x + w - cornerSize, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + cornerSize);
    // Bottom-left
    ctx.moveTo(x, y + h - cornerSize);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + cornerSize, y + h);
    // Bottom-right
    ctx.moveTo(x + w - cornerSize, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - cornerSize);
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Header Tag Banner
    const confPercent = Math.round(veh.confidence * 100);
    const headerTitle = isViolation
      ? `VIOLATION: ${veh.violationTitle || 'TRAFFIC BREACH'}`
      : `${veh.label.toUpperCase()}`;
    const headerSub = isViolation
      ? `CONF: ${confPercent}% · ${veh.speedKmh} km/h`
      : `SAFE · ${confPercent}% · ${veh.speedKmh} km/h`;

    const tagHeight = isViolation ? 32 : 22;
    const tagY = Math.max(0, y - tagHeight - 2);

    ctx.fillStyle = primaryColor;
    ctx.fillRect(x, tagY, Math.max(w * 0.9, 140), tagHeight);

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 10px JetBrains Mono, monospace';
    ctx.fillText(headerTitle, x + 6, tagY + 13);

    ctx.fillStyle = isViolation ? '#ffffff' : '#042f2e';
    ctx.font = '600 9px JetBrains Mono, monospace';
    ctx.fillText(headerSub, x + 6, tagY + 25);

    // Speed Radar Vector if enabled
    if (options.showSpeedRadar && veh.speedKmh > 0) {
      const vectorLength = (veh.speedKmh / 120) * 40;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h);
      ctx.lineTo(x + w / 2, y + h + vectorLength);
      ctx.stroke();

      // Velocity arrow
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - 4, y + h + vectorLength - 4);
      ctx.lineTo(x + w / 2, y + h + vectorLength);
      ctx.lineTo(x + w / 2 + 4, y + h + vectorLength - 4);
      ctx.stroke();

      // Speed Tag
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + w / 2 - 28, y + h + vectorLength + 2, 56, 14);
      ctx.fillStyle = isViolation ? '#ef4444' : '#22c55e';
      ctx.font = '700 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${veh.speedKmh} km/h`, x + w / 2, y + h + vectorLength + 12);
      ctx.textAlign = 'start';
    }

    // 3. Highlighted position of the driver (Headbox + Pose keypoints)
    if (options.showDriverOverlay && veh.driverPose) {
      const pose = veh.driverPose;
      const [hx, hy, hw, hh] = pose.headBox;
      const headX = (hx / 100) * width;
      const headY = (hy / 100) * height;
      const headW = (hw / 100) * width;
      const headH = (hh / 100) * height;

      // Driver cabin box
      if (pose.driverBox) {
        const [dx, dy, dw, dh] = pose.driverBox;
        const cabX = (dx / 100) * width;
        const cabY = (dy / 100) * height;
        const cabW = (dw / 100) * width;
        const cabH = (dh / 100) * height;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)'; // Cyan for driver compartment
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(cabX, cabY, cabW, cabH);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.font = '600 8px JetBrains Mono, monospace';
        ctx.fillText('DRIVER POSE', cabX + 3, cabY - 4);
      }

      // Head / Helmet Bounding Box
      const helmetColor = pose.helmetDetected ? '#22c55e' : '#f59e0b';
      ctx.strokeStyle = helmetColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(headX, headY, headW, headH);

      // Head label
      ctx.fillStyle = helmetColor;
      ctx.font = '700 8px JetBrains Mono, monospace';
      const headLabel = veh.type === 'motorcycle'
        ? (pose.helmetDetected ? 'HELMET: YES' : 'NO HELMET!')
        : (pose.phoneDetected ? 'PHONE IN HAND!' : 'DRIVER HEAD');
      ctx.fillText(headLabel, headX, headY - 3);

      // Driver keypoint joints
      pose.keypoints.forEach((kp) => {
        const kx = (kp.x / 100) * width;
        const ky = (kp.y / 100) * height;

        ctx.fillStyle = pose.phoneDetected && kp.name === 'left_wrist' ? '#ef4444' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(kx, ky, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Keypoint connector if phone detected
      if (pose.phoneDetected) {
        const ear = pose.keypoints.find((k) => k.name.includes('eye') || k.name.includes('nose'));
        const wrist = pose.keypoints.find((k) => k.name.includes('wrist'));
        if (ear && wrist) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo((ear.x / 100) * width, (ear.y / 100) * height);
          ctx.lineTo((wrist.x / 100) * width, (wrist.y / 100) * height);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    ctx.restore();
  });
}
