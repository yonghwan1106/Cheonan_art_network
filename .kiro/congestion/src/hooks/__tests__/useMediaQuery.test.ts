import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useIsTouchDevice } from '../useMediaQuery';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  const mockMediaQueryList = {
    matches,
    media: '',
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => mockMediaQueryList),
  });

  return mockMediaQueryList;
};

describe('useMediaQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial match state', () => {
    const mockMQL = mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
  });

  it('returns false when media query does not match', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    
    expect(result.current).toBe(false);
  });

  it('updates when media query changes', () => {
    const mockMQL = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    
    expect(result.current).toBe(false);
    
    // Simulate media query change
    act(() => {
      const changeHandler = mockMQL.addEventListener.mock.calls[0][1];
      changeHandler({ matches: true });
    });
    
    expect(result.current).toBe(true);
  });

  it('cleans up event listeners on unmount', () => {
    const mockMQL = mockMatchMedia(true);
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    
    expect(mockMQL.addEventListener).toHaveBeenCalled();
    
    unmount();
    
    expect(mockMQL.removeEventListener).toHaveBeenCalled();
  });

  it('falls back to legacy methods for older browsers', () => {
    const mockMQL = {
      matches: true,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => mockMQL),
    });

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    
    expect(mockMQL.addListener).toHaveBeenCalled();
    
    unmount();
    
    expect(mockMQL.removeListener).toHaveBeenCalled();
  });
});

describe('Predefined breakpoint hooks', () => {
  it('useIsMobile works correctly', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
  });

  it('useIsTablet works correctly', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsTablet());
    
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 769px) and (max-width: 1024px)');
  });

  it('useIsDesktop works correctly', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsDesktop());
    
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1025px)');
  });

  it('useIsTouchDevice works correctly', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsTouchDevice());
    
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(hover: none) and (pointer: coarse)');
  });
});