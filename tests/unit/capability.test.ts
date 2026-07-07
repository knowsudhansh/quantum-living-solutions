import { describe, it, expect, vi } from 'vitest';
import {
  evaluateRenderState,
  isWebGLAvailable,
  isReducedMotionPreferred,
} from '../../src/lib/utils/capability';

describe('isWebGLAvailable', () => {
  it('should return true if context is mockable', () => {
    const mockContext = {};
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
    } as unknown as HTMLCanvasElement;

    const result = isWebGLAvailable(mockCanvas);
    expect(result).toBe(true);
    expect(mockCanvas.getContext).toHaveBeenCalledWith('webgl');
  });

  it('should return false if getContext throws or returns null', () => {
    const mockCanvas = {
      getContext: vi.fn().mockImplementation(() => {
        throw new Error('No context');
      }),
    } as unknown as HTMLCanvasElement;

    const result = isWebGLAvailable(mockCanvas);
    expect(result).toBe(false);
  });
});

describe('isReducedMotionPreferred', () => {
  it('should return true when media query matches reduce', () => {
    const mockWindow = {
      matchMedia: vi.fn().mockReturnValue({
        matches: true,
      }),
    } as unknown as Window;

    const result = isReducedMotionPreferred(mockWindow);
    expect(result).toBe(true);
    expect(mockWindow.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('should return false when matchMedia returns false', () => {
    const mockWindow = {
      matchMedia: vi.fn().mockReturnValue({
        matches: false,
      }),
    } as unknown as Window;

    const result = isReducedMotionPreferred(mockWindow);
    expect(result).toBe(false);
  });
});

describe('evaluateRenderState', () => {
  it('should return WEBGL_UNAVAILABLE when WebGL check fails', () => {
    const state = evaluateRenderState(false, false, {});
    expect(state).toBe('WEBGL_UNAVAILABLE');
  });

  it('should return REDUCED_MOTION when prefers-reduced-motion is active', () => {
    const state = evaluateRenderState(true, true, {});
    expect(state).toBe('REDUCED_MOTION');
  });

  it('should return LOW_BATTERY when battery discharging and level < 20%', () => {
    const state = evaluateRenderState(true, false, {
      batteryCharging: false,
      batteryLevel: 0.15,
    });
    expect(state).toBe('LOW_BATTERY');
  });

  it('should return STANDARD_WEBGL when battery is low but charging', () => {
    const state = evaluateRenderState(true, false, {
      batteryCharging: true,
      batteryLevel: 0.15,
    });
    expect(state).toBe('STANDARD_WEBGL');
  });

  it('should return LOW_QUALITY_WEBGL when device memory is low', () => {
    const state = evaluateRenderState(true, false, {
      deviceMemory: 2,
    });
    expect(state).toBe('LOW_QUALITY_WEBGL');
  });

  it('should return LOW_QUALITY_WEBGL when CPU core count is low', () => {
    const state = evaluateRenderState(true, false, {
      hardwareConcurrency: 2,
    });
    expect(state).toBe('LOW_QUALITY_WEBGL');
  });

  it('should return STANDARD_WEBGL when capability signals pass standard bounds', () => {
    const state = evaluateRenderState(true, false, {
      deviceMemory: 8,
      hardwareConcurrency: 8,
      batteryCharging: true,
      batteryLevel: 0.8,
    });
    expect(state).toBe('STANDARD_WEBGL');
  });

  it('should default to standard/neutral behavior when signals are missing', () => {
    const state = evaluateRenderState(true, false, {});
    expect(state).toBe('STANDARD_WEBGL');
  });
});
