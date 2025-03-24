# react-gyrotron

A TypeScript React hook for accessing device motion (accelerometer) and orientation data on mobile devices.

## Installation

```bash
npm install react-gyrotron
```

## Usage

```typescript
import { useDeviceMotion } from 'react-gyrotron';

const MyComponent = () => {
  const { x, y, z, alpha, beta, gamma, error } = useDeviceMotion(100);

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>X: {x?.toFixed(2)} m/s²</p>
      <p>Y: {y?.toFixed(2)} m/s²</p>
      <p>Z: {z?.toFixed(2)} m/s²</p>
      <p>Alpha: {alpha?.toFixed(2)}°</p>
      <p>Beta: {beta?.toFixed(2)}°</p>
      <p>Gamma: {gamma?.toFixed(2)}°</p>
    </div>
  );
};
```

## API
useDeviceMotion(updateInterval?: number)
- updateInterval: Optional number (in ms) to throttle updates (default: 100ms)
- Returns: MotionData object with x, y, z (accelerometer), alpha, beta, gamma (orientation), timestamp, and optional error


## Notes
Requires HTTPS for DeviceMotion API

iOS 13+ needs permission request

Browser support: Chrome 31+, Safari 4.1+, Firefox 6+

