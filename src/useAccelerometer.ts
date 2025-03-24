import { useState, useEffect, useRef, useCallback } from 'react';
import { AccelerometerData } from './types';

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

export const useAccelerometer = (updateInterval = 100): AccelerometerData => {
  const [data, setData] = useState<AccelerometerData>({
    x: null,
    y: null,
    z: null,
    timestamp: 0,
  });
  const isMounted = useRef(true);

  const updateData = useCallback(
    throttle((event: DeviceMotionEvent) => {
      if (!isMounted.current) return;
      setData({
        x: event.accelerationIncludingGravity?.x ?? null,
        y: event.accelerationIncludingGravity?.y ?? null,
        z: event.accelerationIncludingGravity?.z ?? null,
        timestamp: Date.now(),
      });
    }, updateInterval),
    [updateInterval]
  );

  useEffect(() => {
    if (!('DeviceMotionEvent' in window)) {
      setData(prev => ({
        ...prev,
        error: 'DeviceMotion API not supported',
      }));
      return;
    }

    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission !== 'granted') {
            setData(prev => ({
              ...prev,
              error: 'Permission denied for accelerometer',
            }));
            return false;
          }
          return true;
        } catch (error) {
          setData(prev => ({
            ...prev,
            error: 'Error requesting permission',
          }));
          return false;
        }
      }
      return true;
    };

    let listenerAdded = false;

    const setupListener = async () => {
      const hasPermission = await requestPermission();
      if (hasPermission && isMounted.current) {
        window.addEventListener('devicemotion', updateData);
        listenerAdded = true;
      }
    };

    setupListener();

    return () => {
      isMounted.current = false;
      if (listenerAdded) {
        window.removeEventListener('devicemotion', updateData);
      }
    };
  }, [updateData]);

  return data;
};
