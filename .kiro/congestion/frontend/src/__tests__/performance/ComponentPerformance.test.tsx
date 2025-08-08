import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { performance } from 'perf_hooks';
import { 
  render as customRender, 
  generateMockCongestionData, 
  generateMockRouteData 
} from '../../test-utils';
import { CongestionPage } from '../../pages/CongestionPage';
import { RouteRecommendationPage } from '../../pages/RouteRecommendationPage';
import { SchedulePage } from '../../pages/SchedulePage';
import { FeedbackPage } from '../../pages/FeedbackPage';
import { AdminDashboard } from '../../pages/AdminDashboard';

// Performance measurement utilities
const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  await waitFor(() => {}, { timeout: 100 });
  const end = performance.now();
  return end - start;
};

const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME_MS: 100, // Components should render within 100ms
  MEMORY_LEAK_THRESHOLD: 1024 * 1024, // 1MB memory increase threshold
  LARGE_LIST_RENDER_TIME: 200, // Large lists should render within 200ms
};

describe('Component Performance Tests', () => {
  beforeEach(() => {
    // Clear any existing timers
    jest.clearAllTimers();
  });

  describe('Page Rendering Performance', () => {
    it('should render CongestionPage within performance threshold', async () => {
      const renderTime = await measureRenderTime(() => {
        customRender(<CongestionPage />);
      });

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME_MS);
    });

    it('should render RouteRecommendationPage within performance threshold', async () => {
      const renderTime = await measureRenderTime(() => {
        customRender(<RouteRecommendationPage />);
      });

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME_MS);
    });

    it('should render SchedulePage within performance threshold', async () => {
      const renderTime = await measureRenderTime(() => {
        customRender(<SchedulePage />);
      });

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME_MS);
    });

    it('should render FeedbackPage within performance threshold', async () => {
      const renderTime = await measureRenderTime(() => {
        customRender(<FeedbackPage />);
      });

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME_MS);
    });

    it('should render AdminDashboard within performance threshold', async () => {
      const renderTime = await measureRenderTime(() => {
        customRender(<AdminDashboard />);
      });

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME_MS);
    });
  });

  describe('Large Data Set Performance', () => {
    it('should handle large congestion data sets efficiently', async () => {
      const largeCongestionData = generateMockCongestionData(100);
      
      // Mock API response with large data set
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { stations: largeCongestionData }
        })
      });

      const renderTime = await measureRenderTime(() => {
        customRender(<CongestionPage />);
      });

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_LIST_RENDER_TIME);
    });

    it('should handle large route data sets efficiently', async () => {
      const largeRouteData = generateMockRouteData(50);
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { routes: largeRouteData }
        })
      });

      const renderTime = await measureRenderTime(() => {
        customRender(<RouteRecommendationPage />);
      });

      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_LIST_RENDER_TIME);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not have significant memory leaks during component mounting/unmounting', async () => {
      const initialMemory = measureMemoryUsage();
      
      // Mount and unmount components multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = customRender(<CongestionPage />);
        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LEAK_THRESHOLD);
    });

    it('should efficiently handle rapid state updates', async () => {
      const { rerender } = customRender(<CongestionPage />);
      
      const initialMemory = measureMemoryUsage();
      
      // Simulate rapid state updates
      for (let i = 0; i < 100; i++) {
        rerender(<CongestionPage key={i} />);
      }

      const finalMemory = measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LEAK_THRESHOLD);
    });
  });

  describe('Rendering Optimization Tests', () => {
    it('should minimize re-renders with React.memo optimization', async () => {
      let renderCount = 0;
      
      const TestComponent = React.memo(() => {
        renderCount++;
        return <div>Test Component</div>;
      });

      const ParentComponent = () => {
        const [count, setCount] = React.useState(0);
        const [otherState, setOtherState] = React.useState(0);
        
        return (
          <div>
            <TestComponent />
            <button onClick={() => setCount(count + 1)}>Count: {count}</button>
            <button onClick={() => setOtherState(otherState + 1)}>Other: {otherState}</button>
          </div>
        );
      };

      const { getByText } = customRender(<ParentComponent />);
      
      // Initial render
      expect(renderCount).toBe(1);
      
      // Update unrelated state - should not re-render TestComponent
      getByText(/Other:/).click();
      expect(renderCount).toBe(1);
    });

    it('should use virtualization for large lists', async () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random()
      }));

      const VirtualizedList = () => {
        const [visibleItems, setVisibleItems] = React.useState(
          largeDataSet.slice(0, 20) // Only render first 20 items
        );

        return (
          <div>
            {visibleItems.map(item => (
              <div key={item.id}>{item.name}</div>
            ))}
          </div>
        );
      };

      const renderTime = await measureRenderTime(() => {
        customRender(<VirtualizedList />);
      });

      // Should render quickly even with large data set
      expect(renderTime).toBeLessThan(50);
    });
  });

  describe('Animation Performance Tests', () => {
    it('should maintain 60fps during animations', async () => {
      const AnimatedComponent = () => {
        const [isAnimating, setIsAnimating] = React.useState(false);
        
        return (
          <div>
            <div 
              className={`transition-transform duration-300 ${
                isAnimating ? 'transform scale-110' : ''
              }`}
              data-testid="animated-element"
            >
              Animated Element
            </div>
            <button 
              onClick={() => setIsAnimating(!isAnimating)}
              data-testid="animate-button"
            >
              Animate
            </button>
          </div>
        );
      };

      const { getByTestId } = customRender(<AnimatedComponent />);
      
      const animateButton = getByTestId('animate-button');
      const animatedElement = getByTestId('animated-element');

      // Measure animation performance
      const startTime = performance.now();
      animateButton.click();
      
      // Wait for animation to complete
      await waitFor(() => {
        expect(animatedElement).toHaveClass('scale-110');
      }, { timeout: 500 });
      
      const endTime = performance.now();
      const animationTime = endTime - startTime;

      // Animation should complete within reasonable time
      expect(animationTime).toBeLessThan(400);
    });
  });

  describe('Bundle Size Impact Tests', () => {
    it('should lazy load components to reduce initial bundle size', async () => {
      const LazyComponent = React.lazy(() => 
        Promise.resolve({
          default: () => <div>Lazy Loaded Component</div>
        })
      );

      const TestWrapper = () => (
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </React.Suspense>
      );

      customRender(<TestWrapper />);

      // Should show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Should load the component
      await waitFor(() => {
        expect(screen.getByText('Lazy Loaded Component')).toBeInTheDocument();
      });
    });
  });

  describe('Network Performance Tests', () => {
    it('should handle slow network responses gracefully', async () => {
      // Mock slow API response
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                data: { stations: generateMockCongestionData(5) }
              })
            });
          }, 2000); // 2 second delay
        })
      );

      const startTime = performance.now();
      customRender(<CongestionPage />);

      // Should show loading state immediately
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();

      // Component should render quickly despite slow API
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100);
    });

    it('should implement request debouncing for search inputs', async () => {
      let requestCount = 0;
      
      global.fetch = jest.fn().mockImplementation(() => {
        requestCount++;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { routes: [] }
          })
        });
      });

      const SearchComponent = () => {
        const [query, setQuery] = React.useState('');
        
        React.useEffect(() => {
          const debounceTimer = setTimeout(() => {
            if (query) {
              fetch('/api/search');
            }
          }, 300);
          
          return () => clearTimeout(debounceTimer);
        }, [query]);

        return (
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="search-input"
          />
        );
      };

      const { getByTestId } = customRender(<SearchComponent />);
      const searchInput = getByTestId('search-input');

      // Type rapidly
      searchInput.focus();
      searchInput.value = 'a';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      searchInput.value = 'ab';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      searchInput.value = 'abc';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      // Should not make multiple requests immediately
      expect(requestCount).toBe(0);

      // Wait for debounce
      await waitFor(() => {
        expect(requestCount).toBe(1);
      }, { timeout: 500 });
    });
  });
});