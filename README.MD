# react-accelerometer-hook

A TypeScript React hook for accessing accelerometer data on mobile devices.

## Installation

```bash
npm install react-accelerometer-hook

Usage
typescript

import { useAccelerometer } from 'react-accelerometer-hook';

const MyComponent = () => {
  const { x, y, z, error } = useAccelerometer(100); // Update every 100ms

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>X: {x?.toFixed(2)} m/s²</p>
      <p>Y: {y?.toFixed(2)} m/s²</p>
      <p>Z: {z?.toFixed(2)} m/s²</p>
    </div>
  );
};

API
useAccelerometer(updateInterval?: number)
updateInterval: Optional number (in ms) to throttle updates (default: 100ms)

Returns: AccelerometerData object with x, y, z, timestamp, and optional error

Notes
Requires HTTPS for DeviceMotion API

iOS 13+ needs permission request

Browser support: Chrome 31+, Safari 4.1+, Firefox 6+

