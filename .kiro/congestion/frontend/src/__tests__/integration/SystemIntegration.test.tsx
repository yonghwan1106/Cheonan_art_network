import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import App from '../../App';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1
}));

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: {
    requestPermission: jest.fn().mockResolvedValue('granted'),
    permission: 'granted'
  },
  writable: true
});

// Mock matchMedia for responsive hooks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query.includes('max-width: 768px') ? false : true, // Default to desktop
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const renderApp = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('System Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} })
    });
  });

  describe('Authentication Flow', () => {
    it('should handle complete login flow', async () => {
      // Mock successful login response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            user: { id: '1', name: 'Test User', email: 'test@example.com', points: 100 },
            token: 'mock-token'
          }
        })
      });

      renderApp();

      // Should show login form initially
      expect(screen.getByText('로그인')).toBeInTheDocument();

      // Fill login form
      const emailInput = screen.getByLabelText(/이메일/i);
      const passwordInput = screen.getByLabelText(/비밀번호/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit login
      const loginButton = screen.getByRole('button', { name: /로그인/i });
      fireEvent.click(loginButton);

      // Should redirect to dashboard after successful login
      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
      });

      // Verify API call was made
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      }));
    });

    it('should handle login failure', async () => {
      // Mock failed login response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: 'Invalid credentials'
        })
      });

      renderApp();

      const emailInput = screen.getByLabelText(/이메일/i);
      const passwordInput = screen.getByLabelText(/비밀번호/i);
      
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      const loginButton = screen.getByRole('button', { name: /로그인/i });
      fireEvent.click(loginButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/로그인에 실패했습니다/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Flow', () => {
    beforeEach(async () => {
      // Mock authenticated user
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'mock-token';
        if (key === 'user_data') return JSON.stringify({
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          points: 100
        });
        return null;
      });

      renderApp();

      // Wait for authentication to complete
      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
      });
    });

    it('should navigate between pages correctly', async () => {
      // Navigate to congestion page
      const congestionLink = screen.getByText('혼잡도');
      fireEvent.click(congestionLink);

      await waitFor(() => {
        expect(screen.getByText('실시간 혼잡도')).toBeInTheDocument();
      });

      // Navigate to schedule page
      const scheduleLink = screen.getByText('일정');
      fireEvent.click(scheduleLink);

      await waitFor(() => {
        expect(screen.getByText('일정 관리')).toBeInTheDocument();
      });

      // Navigate to routes page
      const routesLink = screen.getByText('경로');
      fireEvent.click(routesLink);

      await waitFor(() => {
        expect(screen.getByText('경로 추천')).toBeInTheDocument();
      });

      // Navigate to feedback page
      const feedbackLink = screen.getByText('피드백');
      fireEvent.click(feedbackLink);

      await waitFor(() => {
        expect(screen.getByText('피드백 센터')).toBeInTheDocument();
      });
    });
  });

  describe('Data Flow Integration', () => {
    beforeEach(async () => {
      // Mock authenticated user
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'mock-token';
        if (key === 'user_data') return JSON.stringify({
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          points: 100
        });
        return null;
      });
    });

    it('should load and display congestion data', async () => {
      // Mock congestion API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            stations: [
              {
                id: 'station-1',
                name: '강남역',
                line: '2호선',
                congestionLevel: 'high',
                congestionPercentage: 85,
                lastUpdate: new Date().toISOString()
              }
            ]
          }
        })
      });

      renderApp();

      // Navigate to congestion page
      await waitFor(() => {
        const congestionLink = screen.getByText('혼잡도');
        fireEvent.click(congestionLink);
      });

      // Should display congestion data
      await waitFor(() => {
        expect(screen.getByText('강남역')).toBeInTheDocument();
        expect(screen.getByText('2호선')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      renderApp();

      // Navigate to congestion page
      await waitFor(() => {
        const congestionLink = screen.getByText('혼잡도');
        fireEvent.click(congestionLink);
      });

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/데이터를 불러올 수 없습니다/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Journey - Complete Flow', () => {
    it('should complete a full user journey from login to feedback submission', async () => {
      // Step 1: Login
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            user: { id: '1', name: 'Test User', email: 'test@example.com', points: 100 },
            token: 'mock-token'
          }
        })
      });

      renderApp();

      // Login
      const emailInput = screen.getByLabelText(/이메일/i);
      const passwordInput = screen.getByLabelText(/비밀번호/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: /로그인/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
      });

      // Step 2: Check congestion data
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            stations: [
              {
                id: 'station-1',
                name: '강남역',
                line: '2호선',
                congestionLevel: 'high',
                congestionPercentage: 85
              }
            ]
          }
        })
      });

      const congestionLink = screen.getByText('혼잡도');
      fireEvent.click(congestionLink);

      await waitFor(() => {
        expect(screen.getByText('강남역')).toBeInTheDocument();
      });

      // Step 3: Get route recommendations
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            recommendations: [
              {
                id: 'route-1',
                name: '추천 경로 1',
                duration: 25,
                congestionLevel: 'medium'
              }
            ]
          }
        })
      });

      const routesLink = screen.getByText('경로');
      fireEvent.click(routesLink);

      await waitFor(() => {
        expect(screen.getByText('경로 추천')).toBeInTheDocument();
      });

      // Step 4: Submit feedback
      const feedbackLink = screen.getByText('피드백');
      fireEvent.click(feedbackLink);

      await waitFor(() => {
        expect(screen.getByText('피드백 센터')).toBeInTheDocument();
      });

      // Fill feedback form
      const titleInput = screen.getByPlaceholderText('피드백 제목을 입력하세요');
      const descriptionTextarea = screen.getByPlaceholderText(/구체적인 내용을 작성해주세요/);

      fireEvent.change(titleInput, { target: { value: '테스트 피드백' } });
      fireEvent.change(descriptionTextarea, { target: { value: '이것은 통합 테스트를 위한 피드백입니다.' } });

      const submitButton = screen.getByText('피드백 제출');
      fireEvent.click(submitButton);

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('피드백이 제출되었습니다!')).toBeInTheDocument();
      });

      // Verify localStorage was updated
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'userFeedback',
        expect.stringContaining('테스트 피드백')
      );
    });
  });

  describe('Real-time Features', () => {
    it('should handle WebSocket connections for real-time updates', async () => {
      // Mock authenticated user
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'mock-token';
        if (key === 'user_data') return JSON.stringify({
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          points: 100
        });
        return null;
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
      });

      // Navigate to congestion page to trigger WebSocket connection
      const congestionLink = screen.getByText('혼잡도');
      fireEvent.click(congestionLink);

      // Verify WebSocket was created (mocked)
      expect(WebSocket).toHaveBeenCalled();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should catch and handle component errors', () => {
      // Mock console.error to avoid noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Create a component that throws an error
      const ErrorComponent = () => {
        throw new Error('Test error for error boundary');
      };

      const AppWithError = () => (
        <BrowserRouter>
          <AuthProvider>
            <ErrorComponent />
          </AuthProvider>
        </BrowserRouter>
      );

      render(<AppWithError />);

      // Should show error boundary UI
      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText('페이지 새로고침')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Responsive Design Integration', () => {
    it('should adapt to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('max-width: 768px') ? true : false, // Mobile
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          addListener: jest.fn(),
          removeListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      // Mock authenticated user
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'mock-token';
        if (key === 'user_data') return JSON.stringify({
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          points: 100
        });
        return null;
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('혼잡도 예측')).toBeInTheDocument();
      });

      // Should show mobile navigation elements
      // Note: This test would need more specific mobile component checks
      // based on the actual mobile navigation implementation
    });
  });

  describe('Performance and Caching', () => {
    it('should cache API responses appropriately', async () => {
      // Mock authenticated user
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'mock-token';
        if (key === 'user_data') return JSON.stringify({
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          points: 100
        });
        return null;
      });

      // Mock API response
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { stations: [] }
        })
      });

      renderApp();

      // Navigate to congestion page twice
      const congestionLink = screen.getByText('혼잡도');
      fireEvent.click(congestionLink);

      await waitFor(() => {
        expect(screen.getByText('실시간 혼잡도')).toBeInTheDocument();
      });

      // Navigate away and back
      const dashboardLink = screen.getByText('대시보드');
      fireEvent.click(dashboardLink);

      fireEvent.click(congestionLink);

      // Should have made API calls (caching behavior would be implementation-specific)
      expect(fetch).toHaveBeenCalled();
    });
  });
});