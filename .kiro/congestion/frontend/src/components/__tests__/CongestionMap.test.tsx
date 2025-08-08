import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CongestionMap } from '../congestion/CongestionMap';
import { beforeEach } from 'node:test';

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
  }
];

describe('CongestionMap', () => {
  const mockOnRouteClick = vi.fn();

  beforeEach(() => {
    mockOnRouteClick.mockClear();
  });

  it('renders congestion map with data', () => {
    render(<CongestionMap data={mockData} onRouteClick={mockOnRouteClick} />);
    
    expect(screen.getByText('지하철 노선')).toBeInTheDocument();
    expect(screen.getByText('버스 노선')).toBeInTheDocument();
    expect(screen.getByText('1호선')).toBeInTheDocument();
    expect(screen.getByText('472번')).toBeInTheDocument();
  });

  it('displays stations for each route', () => {
    render(<CongestionMap data={mockData} onRouteClick={mockOnRouteClick} />);
    
    expect(screen.getByText('홍익대입구')).toBeInTheDocument();
    expect(screen.getByText('강남역')).toBeInTheDocument();
  });

  it('shows correct station count for each route', () => {
    render(<CongestionMap data={mockData} onRouteClick={mockOnRouteClick} />);
    
    expect(screen.getByText('1개 구간')).toBeInTheDocument();
    expect(screen.getByText('1개 정류장')).toBeInTheDocument();
  });

  it('calls onRouteClick when station is clicked', () => {
    render(<CongestionMap data={mockData} onRouteClick={mockOnRouteClick} />);
    
    const stationButton = screen.getByText('홍익대입구');
    fireEvent.click(stationButton);
    
    expect(mockOnRouteClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('displays route average congestion', () => {
    render(<CongestionMap data={mockData} onRouteClick={mockOnRouteClick} />);
    
    expect(screen.getByText('노선별 평균 혼잡도')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('shows correct congestion colors', () => {
    render(<CongestionMap data={mockData} onRouteClick={mockOnRouteClick} />);
    
    const highCongestionStation = screen.getByText('홍익대입구');
    const lowCongestionStation = screen.getByText('강남역');
    
    expect(highCongestionStation).toHaveClass('bg-red-500');
    expect(lowCongestionStation).toHaveClass('bg-green-500');
  });

  it('displays transport type sections correctly', () => {
    render(<CongestionMap data={mockData} onRouteClick={mockOnRouteClick} />);
    
    // Check that both subway and bus sections are rendered
    expect(screen.getByText('지하철 노선')).toBeInTheDocument();
    expect(screen.getByText('버스 노선')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<CongestionMap data={[]} onRouteClick={mockOnRouteClick} />);
    
    expect(screen.getByText('지하철 노선')).toBeInTheDocument();
    expect(screen.getByText('버스 노선')).toBeInTheDocument();
    expect(screen.getByText('노선별 평균 혼잡도')).toBeInTheDocument();
  });

  it('groups stations by route correctly', () => {
    const multiStationData = [
      ...mockData,
      {
        id: 'line1-2',
        routeId: 'line1',
        routeName: '1호선',
        stationId: 'station-2',
        stationName: '신촌',
        congestionLevel: 'medium' as const,
        congestionPercentage: 60,
        passengerCount: 720,
        vehicleCapacity: 1200,
        transportType: 'subway' as const,
        timestamp: '2025-01-08T10:00:00Z'
      }
    ];

    render(<CongestionMap data={multiStationData} onRouteClick={mockOnRouteClick} />);
    
    expect(screen.getByText('2개 구간')).toBeInTheDocument();
    expect(screen.getByText('홍익대입구')).toBeInTheDocument();
    expect(screen.getByText('신촌')).toBeInTheDocument();
  });

  it('shows hover tooltips with congestion percentage', () => {
    render(<CongestionMap data={mockData} onRouteClick={mockOnRouteClick} />);
    
    const stationButton = screen.getByText('홍익대입구');
    expect(stationButton).toHaveAttribute('title', '홍익대입구 - 85%');
  });
});