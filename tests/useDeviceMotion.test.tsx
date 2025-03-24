import { renderHook, act } from '@testing-library/react-hooks';
import { useDeviceMotion } from '../src';

// Mock DeviceMotionEvent and DeviceOrientationEvent APIs
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

beforeAll(() => {
  // Mock DeviceMotionEvent
  class MockDeviceMotionEvent {
    accelerationIncludingGravity: { x: number | null; y: number | null; z: number | null } = {
      x: null,
      y: null,
      z: null,
    };
    constructor(type: string, eventInitDict?: DeviceMotionEventInit) {
      this.accelerationIncludingGravity = eventInitDict?.accelerationIncludingGravity || {
        x: null,
        y: null,
        z: null,
      };
    }
  }
  MockDeviceMotionEvent.requestPermission = undefined; // Define static separately

  Object.defineProperty(window, 'DeviceMotionEvent', {
    value: MockDeviceMotionEvent,
    writable: true,
  });

  // Mock DeviceOrientationEvent
  class MockDeviceOrientationEvent {
    alpha: number | null = null;
    beta: number | null = null;
    gamma: number | null = null;
    constructor(type: string, eventInitDict?: DeviceOrientationEventInit) {
      this.alpha = eventInitDict?.alpha ?? null;
      this.beta = eventInitDict?.beta ?? null;
      this.gamma = eventInitDict?.gamma ?? null;
    }
  }
  MockDeviceOrientationEvent.requestPermission = undefined;

  Object.defineProperty(window, 'DeviceOrientationEvent', {
    value: MockDeviceOrientationEvent,
    writable: true,
  });

  window.addEventListener = mockAddEventListener;
  window.removeEventListener = mockRemoveEventListener;
});

afterEach(() => {
  jest.clearAllMocks();
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
    const original = window.DeviceMotionEvent;
    delete (window as any).DeviceMotionEvent;

    const { result } = renderHook(() => useDeviceMotion());
    expect(result.current.error).toBe('DeviceMotion API not supported');

    window.DeviceMotionEvent = original;
  });

  it('sets error when DeviceOrientation API is not supported', () => {
    const original = window.DeviceOrientationEvent;
    delete (window as any).DeviceOrientationEvent;

    const { result } = renderHook(() => useDeviceMotion());
    expect(result.current.error).toBe('DeviceOrientation API not supported');

    window.DeviceOrientationEvent = original;
  });

  it('updates motion data on devicemotion event', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useDeviceMotion(50));

    const mockEvent = new window.DeviceMotionEvent('devicemotion', {
      accelerationIncludingGravity: { x: 1.23, y: 4.56, z: 7.89 },
    });

    act(() => {
      mockAddEventListener.mock.calls.find(call => call[0] === 'devicemotion')?.[1](mockEvent);
    });

    await waitForNextUpdate({ timeout: 100 });

    expect(result.current.x).toBeCloseTo(1.23, 2);
    expect(result.current.y).toBeCloseTo(4.56, 2);
    expect(result.current.z).toBeCloseTo(7.89, 2);
  });

  it('updates orientation data on deviceorientation event', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useDeviceMotion(50));

    const mockEvent = new window.DeviceOrientationEvent('deviceorientation', {
      alpha: 90,
      beta: 45,
      gamma: -30,
    });

    act(() => {
      mockAddEventListener.mock.calls.find(call => call[0] === 'deviceorientation')?.[1](mockEvent);
    });

    await waitForNextUpdate({ timeout: 100 });

    expect(result.current.alpha).toBeCloseTo(90, 2);
    expect(result.current.beta).toBeCloseTo(45, 2);
    expect(result.current.gamma).toBeCloseTo(-30, 2);
  });

  it('requests permission and handles denial', async () => {
    window.DeviceMotionEvent.requestPermission = jest.fn().mockResolvedValue('denied');
    window.DeviceOrientationEvent.requestPermission = jest.fn().mockResolvedValue('granted');

    const { result, waitForNextUpdate } = renderHook(() => useDeviceMotion());

    await waitForNextUpdate({ timeout: 100 });

    expect(result.current.error).toBe('Permission denied for motion/orientation');
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useDeviceMotion());
    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('devicemotion', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('deviceorientation', expect.any(Function));
  });
});