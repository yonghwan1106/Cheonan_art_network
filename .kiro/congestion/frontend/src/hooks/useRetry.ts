import { useState, useCallback, useRef } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  maxDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxAttemptsReached?: (error: Error) => void;
}

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: Error | null;
  canRetry: boolean;
}

export const useRetry = <T extends any[], R>(
  asyncFunction: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    maxDelay = 30000,
    onRetry,
    onMaxAttemptsReached
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
    canRetry: true
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const calculateDelay = useCallback((attempt: number): number => {
    let calculatedDelay: number;
    
    if (backoff === 'exponential') {
      calculatedDelay = delay * Math.pow(2, attempt - 1);
    } else {
      calculatedDelay = delay * attempt;
    }
    
    return Math.min(calculatedDelay, maxDelay);
  }, [delay, backoff, maxDelay]);

  const executeWithRetry = useCallback(async (...args: T): Promise<R> => {
    // Cancel any ongoing retry
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setState(prev => ({
      ...prev,
      isRetrying: true,
      attempt: 0,
      lastError: null,
      canRetry: true
    }));

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (signal.aborted) {
        throw new Error('Operation was aborted');
      }

      setState(prev => ({ ...prev, attempt }));

      try {
        const result = await asyncFunction(...args);
        
        setState(prev => ({
          ...prev,
          isRetrying: false,
          lastError: null
        }));

        return result;
      } catch (error) {
        lastError = error as Error;
        
        setState(prev => ({
          ...prev,
          lastError: lastError
        }));

        if (attempt < maxAttempts) {
          onRetry?.(attempt, lastError);
          
          const retryDelay = calculateDelay(attempt);
          
          // Wait for the calculated delay
          await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(resolve, retryDelay);
            
            signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              reject(new Error('Operation was aborted'));
            });
          });
        }
      }
    }

    // All attempts failed
    setState(prev => ({
      ...prev,
      isRetrying: false,
      canRetry: false
    }));

    onMaxAttemptsReached?.(lastError!);
    throw lastError!;
  }, [asyncFunction, maxAttempts, onRetry, onMaxAttemptsReached, calculateDelay]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState({
      isRetrying: false,
      attempt: 0,
      lastError: null,
      canRetry: true
    });
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState(prev => ({
      ...prev,
      isRetrying: false
    }));
  }, []);

  return {
    execute: executeWithRetry,
    reset,
    cancel,
    ...state
  };
};

// Hook for API calls with retry logic
export const useApiWithRetry = <T>(
  apiCall: () => Promise<T>,
  options: RetryOptions & {
    autoRetryOn?: (error: Error) => boolean;
  } = {}
) => {
  const { autoRetryOn, ...retryOptions } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const shouldAutoRetry = useCallback((error: Error): boolean => {
    if (autoRetryOn) {
      return autoRetryOn(error);
    }
    
    // Default auto-retry conditions
    if (error.name === 'NetworkError') return true;
    if (error.message.includes('timeout')) return true;
    if (error.message.includes('500')) return true;
    if (error.message.includes('502')) return true;
    if (error.message.includes('503')) return true;
    if (error.message.includes('504')) return true;
    
    return false;
  }, [autoRetryOn]);

  const retry = useRetry(apiCall, {
    ...retryOptions,
    onRetry: (attempt, error) => {
      console.log(`Retrying API call (attempt ${attempt}):`, error.message);
      retryOptions.onRetry?.(attempt, error);
    }
  });

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await retry.execute();
      setData(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      // Auto-retry if conditions are met
      if (shouldAutoRetry(error) && retry.canRetry) {
        console.log('Auto-retrying due to retryable error:', error.message);
        return execute();
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [retry, shouldAutoRetry]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    retry.reset();
  }, [retry]);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
    retry: retry.execute,
    retryState: {
      isRetrying: retry.isRetrying,
      attempt: retry.attempt,
      canRetry: retry.canRetry
    }
  };
};

// Utility function to create retryable fetch
export const createRetryableFetch = (options: RetryOptions = {}) => {
  return async (url: string, init?: RequestInit) => {
    const fetchWithRetry = useRetry(
      async (url: string, init?: RequestInit) => {
        const response = await fetch(url, init);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      },
      options
    );

    return fetchWithRetry.execute(url, init);
  };
};