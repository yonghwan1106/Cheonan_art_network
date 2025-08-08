import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  render as customRender, 
  mockApiResponses, 
  mockFetch,
  mockLocalStorage,
  waitForLoadingToFinish 
} from '../../test-utils';
import App from '../../App';

// Mock browser APIs
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: jest.fn()
  },
  writable: true
});

describe('End-to-End User Journey Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    
    // Default successful API responses
    global.fetch = mockFetch(mockApiResponses.userProfile);
  });

  describe('Complete User Journey: New User Registration to Route Planning', () => {
    it('should complete full user journey from registration to route planning', async () => {
      const user = userEvent.setup();
      
      render(<App />);

      // Step 1: User sees landing page and decides to register
      expect(screen.getByText('로그인')).toBeInTheDocument();
      
      // Click register link
      await user.click(screen.getByText('회원가입'));
      
      // Step 2: Fill registration form
      await user.type(screen.getByPlaceholderText('이름'), 'Test User');
      await user.type(screen.getByPlaceholderText('이메일'), 'newuser@example.com');
      await user.type(screen.getByPlaceholderText('비밀번호'), 'password123');
      await user.type(screen.getByPlaceholderText('비밀번호 확인'), 'password123');
      
      // Mock successful registration
      global.fetch = mockFetch({
        success: true,
        data: {
          user: {
            id: 'new-user-1',
            email: 'newuser@example.com',
            name: 'Test User',
            points: 0,
            preferences: null
          },
          token: 'new-user-token'
        }
      });
      
      await user.click(screen.getByRole('button', { name: /회원가입/i }));

      // Step 3: User is redirected to onboarding/preferences setup
      await waitFor(() => {
        expect(screen.getByText('환영합니다!')).toBeInTheDocument();
      });

      // Step 4: Set up user preferences
      await user.click(screen.getByText('지하철'));
      await user.click(screen.getByText('버스'));
      
      // Set preferred departure time
      await user.type(screen.getByLabelText('선호 출발 시간'), '09:00');
      
      // Enable notifications
      await user.click(screen.getByLabelText('혼잡도 알림'));
      await user.click(screen.getByLabelText('경로 추천'));
      
      await user.click(screen.getByText('설정 완료'));

      // Step 5: User reaches dashboard
      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
      });

      // Step 6: User explores congestion data
      global.fetch = mockFetch(mockApiResponses.congestionData);
      await user.click(screen.getByText('혼잡도'));
      
      await waitFor(() => {
        expect(screen.getByText('실시간 혼잡도')).toBeInTheDocument();
        expect(screen.getByText('강남역')).toBeInTheDocument();
      });

      // Step 7: User checks detailed congestion info
      await user.click(screen.getByText('강남역'));
      
      await waitFor(() => {
        expect(screen.getByText('혼잡도 상세 정보')).toBeInTheDocument();
        expect(screen.getByText('85%')).toBeInTheDocument();
      });

      // Close modal
      await user.click(screen.getByRole('button', { name: /닫기/i }));

      // Step 8: User plans a route
      global.fetch = mockFetch(mockApiResponses.routeRecommendations);
      await user.click(screen.getByText('경로'));
      
      await waitFor(() => {
        expect(screen.getByText('경로 추천')).toBeInTheDocument();
      });

      // Fill route search form
      await user.type(screen.getByPlaceholderText('출발지'), '강남역');
      await user.type(screen.getByPlaceholderText('도착지'), '홍대입구역');
      
      await user.click(screen.getByRole('button', { name: /경로 검색/i }));

      // Step 9: User sees route recommendations
      await waitFor(() => {
        expect(screen.getByText('추천 경로')).toBeInTheDocument();
        expect(screen.getByText('45분')).toBeInTheDocument();
      });

      // Step 10: User saves favorite route
      await user.click(screen.getByRole('button', { name: /즐겨찾기 추가/i }));
      
      await waitFor(() => {
        expect(screen.getByText('즐겨찾기에 추가되었습니다')).toBeInTheDocument();
      });

      // Step 11: User sets up schedule
      await user.click(screen.getByText('일정'));
      
      await waitFor(() => {
        expect(screen.getByText('일정 관리')).toBeInTheDocument();
      });

      // Add new schedule
      await user.click(screen.getByText('일정 추가'));
      await user.type(screen.getByPlaceholderText('일정 제목'), '출근');
      await user.type(screen.getByPlaceholderText('출발 시간'), '08:30');
      
      await user.click(screen.getByRole('button', { name: /저장/i }));

      // Step 12: User provides feedback
      await user.click(screen.getByText('피드백'));
      
      await waitFor(() => {
        expect(screen.getByText('피드백 제출')).toBeInTheDocument();
      });

      await user.type(screen.getByPlaceholderText('피드백을 입력하세요'), '앱이 매우 유용합니다!');
      await user.click(screen.getByText('★★★★★'));
      
      await user.click(screen.getByRole('button', { name: /제출/i }));

      // Step 13: User checks profile and points
      await user.click(screen.getByRole('button', { name: /사용자 메뉴/i }));
      await user.click(screen.getByText('프로필'));
      
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText(/포인트/i)).toBeInTheDocument();
      });

      // Verify user journey completion
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user_preferences',
        expect.any(String)
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'favorite_routes',
        expect.any(String)
      );
    });
  });

  describe('Returning User Journey: Login to Daily Usage', () => {
    it('should handle returning user daily usage pattern', async () => {
      const user = userEvent.setup();
      
      // Mock returning user with existing preferences
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'existing-user-token';
        if (key === 'user_preferences') return JSON.stringify({
          preferredTransportModes: ['subway'],
          avoidCrowdedRoutes: true,
          maxWalkingDistance: 1000
        });
        if (key === 'favorite_routes') return JSON.stringify([
          { origin: '강남역', destination: '홍대입구역', name: '출근 경로' }
        ]);
        return null;
      });
      
      render(<App />);

      // Step 1: User is automatically logged in
      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
      });

      // Step 2: User checks morning congestion
      global.fetch = mockFetch(mockApiResponses.congestionData);
      await user.click(screen.getByText('혼잡도'));
      
      await waitFor(() => {
        expect(screen.getByText('강남역')).toBeInTheDocument();
      });

      // Step 3: User uses quick route from favorites
      await user.click(screen.getByText('경로'));
      
      // Should see saved favorite routes
      await waitFor(() => {
        expect(screen.getByText('즐겨찾기 경로')).toBeInTheDocument();
        expect(screen.getByText('출근 경로')).toBeInTheDocument();
      });

      // Use favorite route
      await user.click(screen.getByText('출근 경로'));
      
      global.fetch = mockFetch(mockApiResponses.routeRecommendations);
      await waitFor(() => {
        expect(screen.getByText('45분')).toBeInTheDocument();
      });

      // Step 4: User checks notifications
      global.fetch = mockFetch(mockApiResponses.notifications);
      await user.click(screen.getByRole('button', { name: /알림/i }));
      
      await waitFor(() => {
        expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
      });

      // Step 5: User marks notification as read
      await user.click(screen.getByRole('button', { name: /읽음 처리/i }));
      
      // Notification should be marked as read
      await waitFor(() => {
        expect(screen.queryByText('1')).not.toBeInTheDocument(); // Unread count
      });
    });
  });

  describe('Error Recovery Journey', () => {
    it('should handle network errors and allow user to recover', async () => {
      const user = userEvent.setup();
      
      render(<App />);

      // Step 1: User tries to login but network fails
      global.fetch = mockFetch(
        { success: false, error: 'Network error' },
        { shouldFail: true }
      );
      
      await user.type(screen.getByPlaceholderText('이메일'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      // Step 2: User sees error message
      await waitFor(() => {
        expect(screen.getByText(/네트워크 오류가 발생했습니다/i)).toBeInTheDocument();
      });

      // Step 3: User retries after network recovers
      global.fetch = mockFetch(mockApiResponses.userProfile);
      await user.click(screen.getByText('다시 시도'));

      // Step 4: Login succeeds
      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
      });

      // Step 5: User encounters API error while browsing
      global.fetch = mockFetch(
        { success: false, error: 'Server error' },
        { shouldFail: true }
      );
      
      await user.click(screen.getByText('혼잡도'));

      // Step 6: User sees error state with retry option
      await waitFor(() => {
        expect(screen.getByText(/데이터를 불러올 수 없습니다/i)).toBeInTheDocument();
        expect(screen.getByText('다시 시도')).toBeInTheDocument();
      });

      // Step 7: User successfully retries
      global.fetch = mockFetch(mockApiResponses.congestionData);
      await user.click(screen.getByText('다시 시도'));

      await waitFor(() => {
        expect(screen.getByText('강남역')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile User Journey', () => {
    it('should work seamlessly on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      const user = userEvent.setup();
      
      render(<App />);

      // Step 1: Login on mobile
      await user.type(screen.getByPlaceholderText('이메일'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
      });

      // Step 2: Use mobile navigation
      expect(screen.getByRole('button', { name: /메뉴/i })).toBeInTheDocument();
      
      // Step 3: Check mobile-optimized congestion view
      await user.click(screen.getByText('혼잡도'));
      
      global.fetch = mockFetch(mockApiResponses.congestionData);
      await waitFor(() => {
        expect(screen.getByText('강남역')).toBeInTheDocument();
      });

      // Step 4: Use touch-friendly interactions
      const stationCard = screen.getByText('강남역').closest('[data-testid="station-card"]');
      if (stationCard) {
        // Simulate touch interaction
        fireEvent.touchStart(stationCard);
        fireEvent.touchEnd(stationCard);
      }

      // Step 5: Use mobile route search with geolocation
      await user.click(screen.getByText('경로'));
      
      // Mock geolocation
      const mockGeolocation = {
        getCurrentPosition: jest.fn().mockImplementation((success) => {
          success({
            coords: {
              latitude: 37.5665,
              longitude: 126.9780
            }
          });
        })
      };
      
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true
      });

      await user.click(screen.getByRole('button', { name: /현재 위치/i }));
      
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });

  describe('Accessibility Journey', () => {
    it('should be fully accessible via keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<App />);

      // Step 1: Navigate login form with keyboard
      await user.tab();
      expect(screen.getByPlaceholderText('이메일')).toHaveFocus();
      
      await user.type(screen.getByPlaceholderText('이메일'), 'test@example.com');
      
      await user.tab();
      expect(screen.getByPlaceholderText('비밀번호')).toHaveFocus();
      
      await user.type(screen.getByPlaceholderText('비밀번호'), 'password123');
      
      await user.tab();
      expect(screen.getByRole('button', { name: /로그인/i })).toHaveFocus();
      
      await user.keyboard('{Enter}');

      // Step 2: Navigate dashboard with keyboard
      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
      });

      // Tab through navigation items
      await user.tab();
      await user.tab();
      expect(screen.getByText('혼잡도')).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      global.fetch = mockFetch(mockApiResponses.congestionData);
      await waitFor(() => {
        expect(screen.getByText('실시간 혼잡도')).toBeInTheDocument();
      });

      // Step 3: Use screen reader friendly elements
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Check for proper ARIA labels
      expect(screen.getByLabelText('메인 네비게이션')).toBeInTheDocument();
      expect(screen.getByLabelText('사용자 메뉴')).toBeInTheDocument();
    });

    it('should provide proper focus management in modals', async () => {
      const user = userEvent.setup();
      
      render(<App />);

      // Login first
      await user.type(screen.getByPlaceholderText('이메일'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
      });

      // Open congestion modal
      global.fetch = mockFetch(mockApiResponses.congestionData);
      await user.click(screen.getByText('혼잡도'));
      
      await waitFor(() => {
        expect(screen.getByText('강남역')).toBeInTheDocument();
      });

      await user.click(screen.getByText('강남역'));
      
      // Modal should trap focus
      await waitFor(() => {
        expect(screen.getByText('혼잡도 상세 정보')).toBeInTheDocument();
      });

      // Focus should be on close button or first focusable element
      const closeButton = screen.getByRole('button', { name: /닫기/i });
      expect(closeButton).toBeInTheDocument();
      
      // Escape key should close modal
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByText('혼잡도 상세 정보')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance Under Load Journey', () => {
    it('should maintain performance with concurrent user actions', async () => {
      const user = userEvent.setup();
      
      render(<App />);

      // Login
      await user.type(screen.getByPlaceholderText('이메일'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: /로그인/i }));

      await waitFor(() => {
        expect(screen.getByText('대시보드')).toBeInTheDocument();
      });

      // Simulate rapid navigation
      const startTime = performance.now();
      
      global.fetch = mockFetch(mockApiResponses.congestionData);
      await user.click(screen.getByText('혼잡도'));
      
      global.fetch = mockFetch(mockApiResponses.routeRecommendations);
      await user.click(screen.getByText('경로'));
      
      await user.click(screen.getByText('일정'));
      await user.click(screen.getByText('피드백'));
      
      const endTime = performance.now();
      const navigationTime = endTime - startTime;
      
      // Navigation should be responsive
      expect(navigationTime).toBeLessThan(2000);
      
      // UI should remain responsive
      expect(screen.getByText('피드백 제출')).toBeInTheDocument();
    });
  });
});