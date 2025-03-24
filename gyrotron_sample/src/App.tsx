import React, { useState } from 'react';
import { useDeviceMotion, MotionData } from 'react-gyrotron';

const App: React.FC = () => {
  const [permissionRequested, setPermissionRequested] = useState(false);
  const { x, y, z, alpha, beta, gamma, error }: MotionData = useDeviceMotion(100);

  const requestPermission = async () => {
    const request = async (event: any) =>
      typeof event.requestPermission === 'function'
        ? await event.requestPermission().then((p: string) => p === 'granted')
        : true;

    try {
      const motionGranted = await request(DeviceMotionEvent);
      const orientationGranted = await request(DeviceOrientationEvent);
      if (motionGranted && orientationGranted) {
        setPermissionRequested(true);
      } else {
        alert('Permission denied. Please enable motion/orientation access in settings.');
      }
    } catch (err) {
      console.error('Permission request failed:', err);
      alert('Failed to request permission.');
    }
  };

  if (!permissionRequested) {
    return (
      <div style={styles.container}>
        <h1>GyroTron Test</h1>
        <button style={styles.button} onClick={requestPermission}>
          Enable Motion & Orientation
        </button>
        <p style={styles.info}>Click to allow access (required on iOS).</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1>Error</h1>
        <p style={styles.error}>{error}</p>
        <p style={styles.info}>Check browser settings or device compatibility.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>GyroTron Test</h1>
      <div style={styles.data}>
        <h2>Accelerometer</h2>
        <p>X: {x !== null ? x.toFixed(2) : 'N/A'} m/s²</p>
        <p>Y: {y !== null ? y.toFixed(2) : 'N/A'} m/s²</p>
        <p>Z: {z !== null ? z.toFixed(2) : 'N/A'} m/s²</p>
        <h2>Orientation</h2>
        <p>Alpha: {alpha !== null ? alpha.toFixed(2) : 'N/A'}°</p>
        <p>Beta: {beta !== null ? beta.toFixed(2) : 'N/A'}°</p>
        <p>Gamma: {gamma !== null ? gamma.toFixed(2) : 'N/A'}°</p>
      </div>
      <p style={styles.info}>Move or rotate your device to see changes!</p>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '400px',
    margin: '0 auto',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  data: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '5px',
    margin: '20px 0',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  info: {
    fontSize: '14px',
    color: '#666',
  },
};

export default App;