import { renderHook, act, waitFor } from '@testing-library/react';
import { useDeviceMotion } from '../src';
import React from 'react';

// Mock DeviceMotionEvent and DeviceOrientationEvent APIs
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

beforeAll(() => {
  jest.useFakeTimers();
});

beforeEach(() => {
  jest.clearAllMocks();

  const MockDeviceMotionEvent = function (type: string, eventInitDict?: DeviceMotionEventInit) {
    return {
      accelerationIncludingGravity: {
        x: eventInitDict?.accelerationIncludingGravity?.x ?? null,
        y: eventInitDict?.accelerationIncludingGravity?.y ?? null,
        z: eventInitDict?.accelerationIncludingGravity?.z ?? null,
      },
    } as DeviceMotionEvent;
  };

  const MockDeviceOrientationEvent = function (type: string, eventInitDict?: DeviceOrientationEventInit) {
    return {
      alpha: eventInitDict?.alpha ?? null,
      beta: eventInitDict?.beta ?? null,
      gamma: eventInitDict?.gamma ?? null,
    } as DeviceOrientationEvent;
  };

  Object.defineProperty(window, 'DeviceMotionEvent', {
    value: MockDeviceMotionEvent,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'DeviceOrientationEvent', {
    value: MockDeviceOrientationEvent,
    writable: true,
    configurable: true,
  });

  (window.DeviceMotionEvent as any).requestPermission = jest.fn().mockResolvedValue('granted');
  (window.DeviceOrientationEvent as any).requestPermission = jest.fn().mockResolvedValue('granted');

  window.addEventListener = mockAddEventListener;
  window.removeEventListener = mockRemoveEventListener;
});

afterEach(() => {
  jest.advanceTimersByTime(1000);
});

afterAll(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('useDeviceMotion', () => {
  it('returns initial data with null values', () => {
    const { result } = renderHook(() => useDeviceMotion());
    expect(result.current).toEqual({
      x: null,
      y: null,
      z: null,
      alpha: null,
      beta: null,
      gamma: null,
      timestamp: 0,
    });
  });

  it('sets error when DeviceMotion API is not supported', () => {
    Object.defineProperty(window, 'DeviceMotionEvent', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useDeviceMotion());
    expect(result.current.error).toBe('DeviceMotion API not supported');
  });

  it('sets error when DeviceOrientation API is not supported', () => {
    Object.defineProperty(window, 'DeviceOrientationEvent', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useDeviceMotion());
    expect(result.current.error).toBe('DeviceOrientation API not supported');
  });

  it('updates motion data on devicemotion event', async () => {
    const { result } = renderHook(() => useDeviceMotion(50));

    const mockEvent = new window.DeviceMotionEvent('devicemotion', {
      accelerationIncludingGravity: { x: 1.23, y: 4.56, z: 7.89 },
    });

    await act(async () => {
      jest.advanceTimersByTime(500); // Allow listeners to be added
      const motionListener = mockAddEventListener.mock.calls.find(call => call[0] === 'devicemotion')?.[1];
      if (motionListener) {
        motionListener(mockEvent);
        jest.advanceTimersByTime(50); // Match throttle
        await waitFor(
          () => {
            expect(result.current.x).toBeCloseTo(1.23, 2);
            expect(result.current.y).toBeCloseTo(4.56, 2);
            expect(result.current.z).toBeCloseTo(7.89, 2);
          },
          { timeout: 1000 }
        );
      }
    });
  });

  it('updates orientation data on deviceorientation event', async () => {
    const { result } = renderHook(() => useDeviceMotion(50));

    const mockEvent = new window.DeviceOrientationEvent('deviceorientation', {
      alpha: 90,
      beta: 45,
      gamma: -30,
    });

    await act(async () => {
      jest.advanceTimersByTime(500); // Allow listeners to be added
      const orientationListener = mockAddEventListener.mock.calls.find(call => call[0] === 'deviceorientation')?.[1];
      if (orientationListener) {
        orientationListener(mockEvent);
        jest.advanceTimersByTime(50); // Match throttle
        await waitFor(
          () => {
            expect(result.current.alpha).toBeCloseTo(90, 2);
            expect(result.current.beta).toBeCloseTo(45, 2);
            expect(result.current.gamma).toBeCloseTo(-30, 2);
          },
          { timeout: 1000 }
        );
      }
    });
  });

  it('requests permission and handles denial', async () => {
    (window.DeviceMotionEvent as any).requestPermission = jest.fn().mockResolvedValue('denied');
    (window.DeviceOrientationEvent as any).requestPermission = jest.fn().mockResolvedValue('granted');

    const { result } = renderHook(() => useDeviceMotion());
    await act(async () => {
      jest.advanceTimersByTime(500); // Allow permission check
    });
    await waitFor(
      () => {
        expect((window.DeviceMotionEvent as any).requestPermission).toHaveBeenCalled();
        expect(result.current.error).toBe('Permission denied for motion/orientation');
      },
      { timeout: 1000 }
    );
  });

  it('cleans up event listeners on unmount', async () => {
    const { result, unmount } = renderHook(() => useDeviceMotion(50));

    await act(async () => {
      jest.advanceTimersByTime(1000); // Allow listeners to be added and permissions to resolve
    });

    expect(mockAddEventListener).toHaveBeenCalledWith('devicemotion', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('deviceorientation', expect.any(Function));

    const motionListener = mockAddEventListener.mock.calls.find(call => call[0] === 'devicemotion')?.[1];
    const orientationListener = mockAddEventListener.mock.calls.find(call => call[0] === 'deviceorientation')?.[1];

    await act(async () => {
      unmount();
      jest.advanceTimersByTime(50); // Allow cleanup
    });

    expect(mockRemoveEventListener).toHaveBeenCalledWith('devicemotion', motionListener);
    expect(mockRemoveEventListener).toHaveBeenCalledWith('deviceorientation', orientationListener);
  });
});