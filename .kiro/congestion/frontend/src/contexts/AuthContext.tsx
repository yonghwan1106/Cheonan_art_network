import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { getStoredAuth, setStoredAuth, removeStoredAuth } from '../utils/localStorage';

interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  preferences: {
    congestionTolerance: 'low' | 'medium' | 'high';
    maxWalkingDistance: number;
    maxTransfers: number;
    notificationEnabled: boolean;
    notificationTiming: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedAuth = getStoredAuth();
    if (storedAuth && storedAuth.token && storedAuth.user) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: storedAuth.user,
          token: storedAuth.token,
        },
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data - replace with actual API response
      const mockUser: User = {
        id: 'user-001',
        email: email,
        name: email === 'demo@example.com' ? '김철수' : '사용자',
        points: 1250,
        preferences: {
          congestionTolerance: 'medium',
          maxWalkingDistance: 800,
          maxTransfers: 2,
          notificationEnabled: true,
          notificationTiming: 30,
        },
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Store in localStorage
      setStoredAuth({
        user: mockUser,
        token: mockToken,
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: mockUser,
          token: mockToken,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  };

  const logout = (): void => {
    removeStoredAuth();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
    
    // Update localStorage
    const storedAuth = getStoredAuth();
    if (storedAuth && storedAuth.user) {
      setStoredAuth({
        ...storedAuth,
        user: { ...storedAuth.user, ...updates },
      });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};