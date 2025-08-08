import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RouteList } from '../congestion/RouteList';

const mockData = [
  {
    id: 'line1-1',
    routeId: 'line1',
    routeName: '1호선',
    stationId: 'station-1',
    stationName: '홍익대입구',
    congestionLevel: 'high' as const,
    congestionPercentage: 85,
    passengerCount: 1020,
    vehicleCapacity: 1200,
    transportType: 'subway' as const,
    timestamp: '2025-01-08T10:00:00Z',
    prediction: {
      nextHour: 'medium' as const,
      confidence: 85
    }
  },
  {
    id: 'bus-472-1',
    routeId: 'bus-472',
    routeName: '472번',
    stationId: 'bus-station-1',
    stationName: '강남역',
    congestionLevel: 'low' as const,
    congestionPercentage: 25,
    passengerCount: 11,
    vehicleCapacity: 45,
    transportType: 'bus' as const,
    timestamp: '2025-01-08T10:00:00Z',
    prediction: {
      nextHour: 'low' as const,
      confidence: 90
    }
  },
  {
    id: 'line2-1',
    routeId: 'line2',
    routeName: '2호선',
    stationId: 'station-2',
    stationName: '신촌',
    congestionLevel: 'medium' as const,
    congestionPercentage: 60,
    passengerCount: 720,
    vehicleCapacity: 1200,
    transportType: 'subway' as const,
    timestamp: '2025-01-08T10:00:00Z',
    prediction: {
      nextHour: 'high' as const,
      confidence: 75
    }
  }
];

describe('RouteList', () => {
  const mockOnRouteClick = vi.fn();

  beforeEach(() => {
    mockOnRouteClick.mockClear();
  });

  it('renders route list with data', () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    expect(screen.getByText('총 3개 구간')).toBeInTheDocument();
    expect(screen.getByText('1호선')).toBeInTheDocument();
    expect(screen.getByText('472번')).toBeInTheDocument();
    expect(screen.getByText('2호선')).toBeInTheDocument();
  });

  it('displays search functionality', () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    const searchInput = screen.getByPlaceholderText('노선명 또는 역명 검색...');
    expect(searchInput).toBeInTheDocument();
  });

  it('filters data by search term', async () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    const searchInput = screen.getByPlaceholderText('노선명 또는 역명 검색...');
    fireEvent.change(searchInput, { target: { value: '홍익대' } });

    await waitFor(() => {
      expect(screen.getByText('총 1개 구간')).toBeInTheDocument();
      expect(screen.getByText('홍익대입구')).toBeInTheDocument();
      expect(screen.queryByText('강남역')).not.toBeInTheDocument();
    });
  });

  it('filters data by transport type', async () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    const transportFilter = screen.getByDisplayValue('전체');
    fireEvent.change(transportFilter, { target: { value: 'bus' } });

    await waitFor(() => {
      expect(screen.getByText('총 1개 구간')).toBeInTheDocument();
      expect(screen.getByText('472번')).toBeInTheDocument();
      expect(screen.queryByText('1호선')).not.toBeInTheDocument();
    });
  });

  it('filters data by congestion level', async () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    const congestionFilter = screen.getAllByDisplayValue('모든 혼잡도')[0];
    fireEvent.change(congestionFilter, { target: { value: 'high' } });

    await waitFor(() => {
      expect(screen.getByText('총 1개 구간')).toBeInTheDocument();
      expect(screen.getByText('홍익대입구')).toBeInTheDocument();
      expect(screen.queryByText('강남역')).not.toBeInTheDocument();
    });
  });

  it('sorts data by different fields', async () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    // Click on name column to sort by name
    const nameHeader = screen.getByText('노선/역명');
    fireEvent.click(nameHeader);

    // Check if sorting indicator appears
    await waitFor(() => {
      expect(screen.getByText('↓')).toBeInTheDocument();
    });
  });

  it('displays congestion levels with correct colors', () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    expect(screen.getByText('혼잡')).toBeInTheDocument();
    expect(screen.getByText('여유')).toBeInTheDocument();
    expect(screen.getByText('보통')).toBeInTheDocument();
  });

  it('shows passenger count and capacity', () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    expect(screen.getByText('1,020')).toBeInTheDocument();
    expect(screen.getByText('/ 1,200명')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('/ 45명')).toBeInTheDocument();
  });

  it('displays prediction with trend icons', () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    // Check for prediction confidence percentages
    expect(screen.getByText('(85%)')).toBeInTheDocument();
    expect(screen.getByText('(90%)')).toBeInTheDocument();
    expect(screen.getByText('(75%)')).toBeInTheDocument();
  });

  it('calls onRouteClick when detail button is clicked', () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    const detailButtons = screen.getAllByText('상세보기');
    fireEvent.click(detailButtons[0]);
    
    expect(mockOnRouteClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('shows empty state when no data matches filters', async () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    const searchInput = screen.getByPlaceholderText('노선명 또는 역명 검색...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('다른 검색어나 필터를 시도해보세요.')).toBeInTheDocument();
    });
  });

  it('handles empty data gracefully', () => {
    render(<RouteList data={[]} onRouteClick={mockOnRouteClick} />);
    
    expect(screen.getByText('총 0개 구간')).toBeInTheDocument();
    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
  });

  it('toggles sort order when clicking same column header', async () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    const congestionHeader = screen.getByText('혼잡도');
    
    // First click - should show descending
    fireEvent.click(congestionHeader);
    await waitFor(() => {
      expect(screen.getByText('↓')).toBeInTheDocument();
    });

    // Second click - should show ascending
    fireEvent.click(congestionHeader);
    await waitFor(() => {
      expect(screen.getByText('↑')).toBeInTheDocument();
    });
  });

  it('clears search when empty string is entered', async () => {
    render(<RouteList data={mockData} onRouteClick={mockOnRouteClick} />);
    
    const searchInput = screen.getByPlaceholderText('노선명 또는 역명 검색...');
    
    // First search
    fireEvent.change(searchInput, { target: { value: '홍익대' } });
    await waitFor(() => {
      expect(screen.getByText('총 1개 구간')).toBeInTheDocument();
    });

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getByText('총 3개 구간')).toBeInTheDocument();
    });
  });
});