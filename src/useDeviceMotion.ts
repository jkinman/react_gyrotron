import { useState, useEffect, useRef, useCallback } from 'react';
import { MotionData } from './types';

// Throttle utility
const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

export const useDeviceMotion = (updateInterval = 100): MotionData => {
  const initialState: MotionData = {
    x: null,
    y: null,
    z: null,
    alpha: null,
    beta: null,
    gamma: null,
    timestamp: 0,
  };

  // Synchronous API availability check using strict equality
  if (window.DeviceMotionEvent === undefined) {
    initialState.error = 'DeviceMotion API not supported';
  } else if (window.DeviceOrientationEvent === undefined) {
    initialState.error = 'DeviceOrientation API not supported';
  }

  const [data, setData] = useState<MotionData>(initialState);
  const isMounted = useRef(true);

  const updateMotionData = useCallback(
    throttle((motionEvent: DeviceMotionEvent | null, orientationEvent: DeviceOrientationEvent | null) => {
      if (!isMounted.current) return;
      setData(prev => ({
        ...prev,
        x: motionEvent?.accelerationIncludingGravity?.x ?? prev.x,
        y: motionEvent?.accelerationIncludingGravity?.y ?? prev.y,
        z: motionEvent?.accelerationIncludingGravity?.z ?? prev.z,
        alpha: orientationEvent?.alpha ?? prev.alpha,
        beta: orientationEvent?.beta ?? prev.beta,
        gamma: orientationEvent?.gamma ?? prev.gamma,
        timestamp: Date.now(),
      }));
    }, updateInterval),
    [updateInterval]
  );

  useEffect(() => {
    if (data.error) return; // Skip if error is already set

    const requestPermission = async () => {
      let motionGranted = true;
      let orientationGranted = true;

      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const motionPermission = await (DeviceMotionEvent as any).requestPermission();
          motionGranted = motionPermission === 'granted';
        } catch {
          motionGranted = false;
        }
      }

      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();
          orientationGranted = orientationPermission === 'granted';
        } catch {
          orientationGranted = false;
        }
      }

      if (!motionGranted || !orientationGranted) {
        setData(prev => ({
          ...prev,
          error: 'Permission denied for motion/orientation',
        }));
        return false;
      }
      return true;
    };

    let motionListenerAdded = false;
    let orientationListenerAdded = false;
    let cleanupMotionListener: (event: DeviceMotionEvent) => void;
    let cleanupOrientationListener: (event: DeviceOrientationEvent) => void;

    const setupListeners = async () => {
      const hasPermission = await requestPermission();
      if (hasPermission && isMounted.current) {
        const handleMotion = (event: DeviceMotionEvent) => updateMotionData(event, null);
        const handleOrientation = (event: DeviceOrientationEvent) => updateMotionData(null, event);

        window.addEventListener('devicemotion', handleMotion);
        window.addEventListener('deviceorientation', handleOrientation);
        motionListenerAdded = true;
        orientationListenerAdded = true;
        cleanupMotionListener = handleMotion;
        cleanupOrientationListener = handleOrientation;
      }
    };

    setupListeners();

    return () => {
      isMounted.current = false;
      if (motionListenerAdded && cleanupMotionListener) {
        window.removeEventListener('devicemotion', cleanupMotionListener);
      }
      if (orientationListenerAdded && cleanupOrientationListener) {
        window.removeEventListener('deviceorientation', cleanupOrientationListener);
      }
    };
  }, [updateMotionData, data.error]);

  return data;
};