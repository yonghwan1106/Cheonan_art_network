import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock user data for testing
export const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  points: 1250,
  preferences: {
    preferredTransportModes: ['subway'],
    avoidCrowdedRoutes: true,
    maxWalkingDistance: 1000,
    preferredDepartureTime: '09:00',
    notificationSettings: {
      congestionAlerts: true,
      routeRecommendations: true,
      scheduleReminders: true
    }
  },
  frequentRoutes: [
    {
      origin: '강남역',
      destination: '홍대입구역',
      routeName: '2호선',
      frequency: 5
    }
  ],
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString()
};

// Mock authentication context
const MockAuthProvider: React.FC<{ children: React.ReactNode; user?: any }> = ({ 
  children, 
  user = mockUser 
}) => {
  const mockAuthValue = {
    user,
    login: jest.fn().mockResolvedValue(user),
    logout: jest.fn(),
    register: jest.fn().mockResolvedValue(user),
    isLoading: false,
    error: null
  };

  return (
    <AuthProvider value={mockAuthValue}>
      {children}
    </AuthProvider>
  );
};

// Custom render function with providers
const AllTheProviders: React.FC<{ 
  children: React.ReactNode;
  user?: any;
  initialEntries?: string[];
}> = ({ 
  children, 
  user,
  initialEntries = ['/'] 
}) => {
  return (
    <BrowserRouter>
      <MockAuthProvider user={user}>
        {children}
      </MockAuthProvider>
    </BrowserRouter>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: any;
  initialEntries?: string[];
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, initialEntries, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders user={user} initialEntries={initialEntries}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Mock API responses
export const mockApiResponses = {
  congestionData: {
    success: true,
    data: {
      stations: [
        {
          id: 'station-1',
          name: '강남역',
          line: '2호선',
          congestionLevel: 'high',
          congestionPercentage: 85,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'station-2',
          name: '홍대입구역',
          line: '2호선',
          congestionLevel: 'medium',
          congestionPercentage: 60,
          lastUpdated: new Date().toISOString()
        }
      ],
      timestamp: new Date().toISOString()
    }
  },
  routeRecommendations: {
    success: true,
    data: {
      routes: [
        {
          id: 'route-1',
          origin: '강남역',
          destination: '홍대입구역',
          duration: 45,
          transfers: 1,
          congestionScore: 7.5,
          steps: [
            { station: '강남역', line: '2호선', action: 'board' },
            { station: '신촌역', line: '2호선', action: 'transfer' },
            { station: '홍대입구역', line: '6호선', action: 'alight' }
          ]
        }
      ]
    }
  },
  userProfile: {
    success: true,
    data: mockUser
  },
  notifications: {
    success: true,
    data: {
      notifications: [
        {
          id: 'notif-1',
          title: '혼잡도 경고',
          message: '2호선에서 높은 혼잡도가 감지되었습니다.',
          type: 'warning',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ],
      stats: {
        total: 1,
        unread: 1
      }
    }
  }
};

// Mock fetch function
export const mockFetch = (response: any, options: { delay?: number; shouldFail?: boolean } = {}) => {
  const { delay = 0, shouldFail = false } = options;
  
  return jest.fn().mockImplementation(() => 
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error('Network error'));
        } else {
          resolve({
            ok: true,
            json: () => Promise.resolve(response),
            status: 200,
            statusText: 'OK'
          });
        }
      }, delay);
    })
  );
};

// Test data generators
export const generateMockCongestionData = (count: number = 5) => {
  const stations = ['강남역', '홍대입구역', '신촌역', '이대역', '아현역'];
  const lines = ['1호선', '2호선', '3호선', '4호선', '5호선'];
  const levels = ['low', 'medium', 'high'] as const;
  
  return Array.from({ length: count }, (_, index) => ({
    id: `station-${index + 1}`,
    name: stations[index % stations.length],
    line: lines[index % lines.length],
    congestionLevel: levels[Math.floor(Math.random() * levels.length)],
    congestionPercentage: Math.floor(Math.random() * 100),
    lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString()
  }));
};

export const generateMockRouteData = (count: number = 3) => {
  const origins = ['강남역', '홍대입구역', '신촌역'];
  const destinations = ['이대역', '아현역', '서울역'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `route-${index + 1}`,
    origin: origins[index % origins.length],
    destination: destinations[index % destinations.length],
    duration: Math.floor(Math.random() * 60) + 15,
    transfers: Math.floor(Math.random() * 3),
    congestionScore: Math.round((Math.random() * 10) * 10) / 10,
    steps: [
      { station: origins[index % origins.length], line: '2호선', action: 'board' },
      { station: destinations[index % destinations.length], line: '2호선', action: 'alight' }
    ]
  }));
};

// Mock browser APIs
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });
  
  return mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: mockResizeObserver,
  });
  
  return mockResizeObserver;
};

export const mockMatchMedia = (matches: boolean = false) => {
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

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';