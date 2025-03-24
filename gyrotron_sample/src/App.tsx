import React, { useState } from 'react';
import { useAccelerometer, AccelerometerData } from 'react-gyrotron';

const App: React.FC = () => {
  const [permissionRequested, setPermissionRequested] = useState(false);
  const { x, y, z, error }: AccelerometerData = useAccelerometer(100); // Update every 100ms

  const requestPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionRequested(true);
        } else {
          alert('Permission denied. Please enable motion access in your browser settings.');
        }
      } catch (err) {
        console.error('Permission request failed:', err);
        alert('Failed to request permission. Check console for details.');
      }
    } else {
      // Non-iOS devices or older browsers don’t need explicit permission
      setPermissionRequested(true);
    }
  };

  if (!permissionRequested) {
    return (
      <div style={styles.container}>
        <h1>GyroTron Test</h1>
        <button style={styles.button} onClick={requestPermission}>
          Enable Accelerometer
        </button>
        <p style={styles.info}>
          Click to allow motion access (required on iOS).
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1>Error</h1>
        <p style={styles.error}>{error}</p>
        <p style={styles.info}>
          Check your browser settings or device compatibility.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>GyroTron Test</h1>
      <div style={styles.data}>
        <p>X: {x !== null ? x.toFixed(2) : 'N/A'} m/s²</p>
        <p>Y: {y !== null ? y.toFixed(2) : 'N/A'} m/s²</p>
        <p>Z: {z !== null ? z.toFixed(2) : 'N/A'} m/s²</p>
      </div>
      <p style={styles.info}>Move your device to see changes!</p>
    </div>
  );
};

// Inline styles for simplicity
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