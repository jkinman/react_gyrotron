export interface AccelerometerData {
  x: number | null;
  y: number | null;
  z: number | null;
  timestamp: number;
  error?: string;
}
