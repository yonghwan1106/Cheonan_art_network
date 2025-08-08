import { renderHook, act } from '@testing-library/react';
import { useRetry, useApiWithRetry } from '../useRetry';

// Mock timers
jest.useFakeTimers();

describe('useRetry', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('executes function successfully on first attempt', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useRetry(mockFn));

    let promise: Promise<string>;
    act(() => {
      promise = result.current.execute();
    });

    const value = await promise!;
    expect(value).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.attempt).toBe(1);
    expect(result.current.isRetrying).toBe(false);
  });

  it('retries on failure and eventually succeeds', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');

    const { result } = renderHook(() => useRetry(mockFn, { maxAttempts: 3, delay: 100 }));

    let promise: Promise<string>;
    act(() => {
      promise = result.current.execute();
    });

    // Fast-forward through delays
    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const value = await promise!;
    expect(value).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('fails after max attempts', async () => {
    const error = new Error('Persistent failure');
    const mockFn = jest.fn().mockRejectedValue(error);
    const onMaxAttemptsReached = jest.fn();

    const { result } = renderHook(() => 
      useRetry(mockFn, { 
        maxAttempts: 2, 
        delay: 100,
        onMaxAttemptsReached 
      })
    );

    let promise: Promise<string>;
    act(() => {
      promise = result.current.execute();
    });

    // Fast-forward through delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await expect(promise!).rejects.toThrow('Persistent failure');
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(onMaxAttemptsReached).toHaveBeenCalledWith(error);
    expect(result.current.canRetry).toBe(false);
  });

  it('uses exponential backoff correctly', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');

    const { result } = renderHook(() => 
      useRetry(mockFn, { 
        maxAttempts: 3, 
        delay: 100, 
        backoff: 'exponential' 
      })
    );

    let promise: Promise<string>;
    act(() => {
      promise = result.current.execute();
    });

    // First retry: 100ms delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Second retry: 200ms delay (exponential)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    const value = await promise!;
    expect(value).toBe('success');
  });

  it('uses linear backoff correctly', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');

    const { result } = renderHook(() => 
      useRetry(mockFn, { 
        maxAttempts: 3, 
        delay: 100, 
        backoff: 'linear' 
      })
    );

    let promise: Promise<string>;
    act(() => {
      promise = result.current.execute();
    });

    // First retry: 100ms delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Second retry: 200ms delay (linear)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    const value = await promise!;
    expect(value).toBe('success');
  });

  it('respects max delay', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValue('success');

    const { result } = renderHook(() => 
      useRetry(mockFn, { 
        maxAttempts: 2, 
        delay: 1000, 
        backoff: 'exponential',
        maxDelay: 500
      })
    );

    let promise: Promise<string>;
    act(() => {
      promise = result.current.execute();
    });

    // Should use maxDelay (500ms) instead of calculated delay (1000ms)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    const value = await promise!;
    expect(value).toBe('success');
  });

  it('calls onRetry callback', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Failure'))
      .mockResolvedValue('success');
    
    const onRetry = jest.fn();

    const { result } = renderHook(() => 
      useRetry(mockFn, { maxAttempts: 2, delay: 100, onRetry })
    );

    let promise: Promise<string>;
    act(() => {
      promise = result.current.execute();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await promise!;
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  it('can be cancelled', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));
    const { result } = renderHook(() => useRetry(mockFn, { maxAttempts: 3, delay: 1000 }));

    let promise: Promise<string>;
    act(() => {
      promise = result.current.execute();
    });

    act(() => {
      result.current.cancel();
    });

    expect(result.current.isRetrying).toBe(false);
  });

  it('can be reset', () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));
    const { result } = renderHook(() => useRetry(mockFn));

    act(() => {
      result.current.reset();
    });

    expect(result.current.attempt).toBe(0);
    expect(result.current.lastError).toBe(null);
    expect(result.current.canRetry).toBe(true);
    expect(result.current.isRetrying).toBe(false);
  });
});

describe('useApiWithRetry', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('manages loading state correctly', async () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => useApiWithRetry(mockApiCall));

    expect(result.current.isLoading).toBe(false);

    let promise: Promise<any>;
    act(() => {
      promise = result.current.execute();
    });

    expect(result.current.isLoading).toBe(true);

    await promise!;

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual({ data: 'test' });
  });

  it('handles errors correctly', async () => {
    const error = new Error('API Error');
    const mockApiCall = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useApiWithRetry(mockApiCall, { maxAttempts: 1 }));

    let promise: Promise<any>;
    act(() => {
      promise = result.current.execute();
    });

    await expect(promise!).rejects.toThrow('API Error');
    expect(result.current.error).toBe(error);
    expect(result.current.data).toBe(null);
  });

  it('auto-retries on network errors', async () => {
    const networkError = new Error('NetworkError');
    networkError.name = 'NetworkError';
    
    const mockApiCall = jest
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue({ data: 'success' });

    const { result } = renderHook(() => 
      useApiWithRetry(mockApiCall, { maxAttempts: 2, delay: 100 })
    );

    let promise: Promise<any>;
    act(() => {
      promise = result.current.execute();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const data = await promise!;
    expect(data).toEqual({ data: 'success' });
    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });

  it('uses custom auto-retry condition', async () => {
    const customError = new Error('Custom retryable error');
    const mockApiCall = jest
      .fn()
      .mockRejectedValueOnce(customError)
      .mockResolvedValue({ data: 'success' });

    const autoRetryOn = jest.fn().mockReturnValue(true);

    const { result } = renderHook(() => 
      useApiWithRetry(mockApiCall, { 
        maxAttempts: 2, 
        delay: 100,
        autoRetryOn 
      })
    );

    let promise: Promise<any>;
    act(() => {
      promise = result.current.execute();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const data = await promise!;
    expect(data).toEqual({ data: 'success' });
    expect(autoRetryOn).toHaveBeenCalledWith(customError);
  });

  it('resets state correctly', () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => useApiWithRetry(mockApiCall));

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });
});