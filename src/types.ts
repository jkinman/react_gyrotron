export interface MotionData {
  // Accelerometer data
  x: number | null;
  y: number | null;
  z: number | null;
  // Orientation data
  alpha: number | null; // Rotation around Z-axis (0-360°)
  beta: number | null;  // Rotation around X-axis (-180-180°)
  gamma: number | null; // Rotation around Y-axis (-90-90°)
  timestamp: number;
  error?: string;
}