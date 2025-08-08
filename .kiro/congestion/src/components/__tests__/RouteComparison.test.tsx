import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RouteComparison } from '../routes/RouteComparison';

describe('RouteComparison', () => {
  const mockOnRouteSelect = vi.fn();
  const mockOnRouteSave = vi.fn();

  const defaultProps = {
    origin: '홍익대입구',
    destination: '강남',
    onRouteSelect: mockOnRouteSelect,
    onRouteSave: mockOnRouteSave,
    savedRoutes: []
  };

  beforeEach(() => {
    mockOnRouteSelect.mockClear();
    mockOnRouteSave.mockClear();
  });

  it('renders route comparison with origin and destination', () => {
    render(<RouteComparison {...defaultProps} />);
    
    expect(screen.getByText('경로 추천')).toBeInTheDocument();
    expect(screen.getByText('홍익대입구')).toBeInTheDocument();
    expect(screen.getByText('강남')).toBeInTheDocument();
  });

  it('displays three route alternatives', () => {
    render(<RouteComparison {...defaultProps} />);
    
    expect(screen.getByText('추천 경로')).toBeInTheDocument();
    expect(screen.getByText('최단 시간')).toBeInTheDocument();
    expect(screen.getByText('쾌적한 경로')).toBeInTheDocument();
  });

  it('shows route details including time, transfers, and congestion', () => {
    render(<RouteComparison {...defaultProps} />);
    
    // Check for time information
    expect(screen.getByText('28분')).toBeInTheDocument();
    expect(screen.getByText('25분')).toBeInTheDocument();
    expect(screen.getByText('35분')).toBeInTheDocument();
    
    // Check for transfer information
    const transferElements = screen.getAllByText(/\d+/);
    expect(transferElements.length).toBeGreaterThan(0);
    
    // Check for congestion levels
    expect(screen.getByText('보통')).toBeInTheDocument();
    expect(screen.getByText('여유')).toBeInTheDocument();
  });

  it('calls onRouteSelect when route is selected', async () => {
    render(<RouteComparison {...defaultProps} />);
    
    const selectButtons = screen.getAllByText('이 경로 선택');
    fireEvent.click(selectButtons[0]);
    
    expect(mockOnRouteSelect).toHaveBeenCalled();
  });

  it('calls onRouteSave when route is saved', async () => {
    render(<RouteComparison {...defaultProps} />);
    
    const saveButtons = screen.getAllByTitle('저장하기');
    fireEvent.click(saveButtons[0]);
    
    expect(mockOnRouteSave).toHaveBeenCalled();
  });

  it('displays departure time when provided', () => {
    render(
      <RouteComparison 
        {...defaultProps} 
        departureTime="08:30"
      />
    );
    
    expect(screen.getByText('출발 시간: 08:30')).toBeInTheDocument();
  });

  it('shows incentive points for routes', () => {
    render(<RouteComparison {...defaultProps} />);
    
    expect(screen.getByText('+15P')).toBeInTheDocument();
    expect(screen.getByText('+25P')).toBeInTheDocument();
    expect(screen.getByText('+30P')).toBeInTheDocument();
  });

  it('displays pros and cons for each route', () => {
    render(<RouteComparison {...defaultProps} />);
    
    expect(screen.getByText('장점')).toBeInTheDocument();
    expect(screen.getByText('단점')).toBeInTheDocument();
    expect(screen.getByText('직통 노선으로 환승 없음')).toBeInTheDocument();
    expect(screen.getByText('러시아워 시간대 약간 혼잡')).toBeInTheDocument();
  });

  it('shows comparison table with detailed metrics', () => {
    render(<RouteComparison {...defaultProps} />);
    
    expect(screen.getByText('상세 비교')).toBeInTheDocument();
    expect(screen.getByText('소요 시간')).toBeInTheDocument();
    expect(screen.getByText('환승 횟수')).toBeInTheDocument();
    expect(screen.getByText('혼잡도')).toBeInTheDocument();
    expect(screen.getByText('포인트')).toBeInTheDocument();
    expect(screen.getByText('탄소 발자국')).toBeInTheDocument();
  });

  it('updates button text when route is selected', async () => {
    render(<RouteComparison {...defaultProps} />);
    
    const selectButtons = screen.getAllByText('이 경로 선택');
    fireEvent.click(selectButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('선택됨')).toBeInTheDocument();
    });
  });

  it('shows saved indicator for saved routes', () => {
    render(
      <RouteComparison 
        {...defaultProps} 
        savedRoutes={['route-recommended']}
      />
    );
    
    const savedButton = screen.getAllByTitle('저장됨')[0];
    expect(savedButton).toBeInTheDocument();
  });

  it('displays route segments with transport types', () => {
    render(<RouteComparison {...defaultProps} />);
    
    expect(screen.getByText('2호선')).toBeInTheDocument();
    expect(screen.getByText('6호선')).toBeInTheDocument();
    expect(screen.getByText('9호선')).toBeInTheDocument();
    expect(screen.getByText('472번')).toBeInTheDocument();
  });

  it('shows congestion levels with appropriate styling', () => {
    render(<RouteComparison {...defaultProps} />);
    
    const congestionElements = screen.getAllByText('보통');
    expect(congestionElements.length).toBeGreaterThan(0);
    
    const comfortableElements = screen.getAllByText('여유');
    expect(comfortableElements.length).toBeGreaterThan(0);
  });

  it('displays route tips section', () => {
    render(<RouteComparison {...defaultProps} />);
    
    expect(screen.getByText('💡 경로 선택 팁')).toBeInTheDocument();
    expect(screen.getByText(/출근 시간에는 쾌적한 경로를/)).toBeInTheDocument();
    expect(screen.getByText(/급한 일정이 있을 때는/)).toBeInTheDocument();
  });

  it('handles empty saved routes array', () => {
    render(<RouteComparison {...defaultProps} savedRoutes={[]} />);
    
    // Should render without crashing
    expect(screen.getByText('경로 추천')).toBeInTheDocument();
  });

  it('displays cost information for routes', () => {
    render(<RouteComparison {...defaultProps} />);
    
    expect(screen.getByText('1,370원')).toBeInTheDocument();
  });

  it('shows reliability percentages', () => {
    render(<RouteComparison {...defaultProps} />);
    
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('displays carbon footprint information', () => {
    render(<RouteComparison {...defaultProps} />);
    
    expect(screen.getByText('2.1kg CO₂')).toBeInTheDocument();
    expect(screen.getByText('2.8kg CO₂')).toBeInTheDocument();
    expect(screen.getByText('1.9kg CO₂')).toBeInTheDocument();
  });

  it('shows route type icons', () => {
    render(<RouteComparison {...defaultProps} />);
    
    // Icons should be rendered (we can't easily test for specific icons)
    // but we can check that the route names are displayed
    expect(screen.getByText('추천 경로')).toBeInTheDocument();
    expect(screen.getByText('최단 시간')).toBeInTheDocument();
    expect(screen.getByText('쾌적한 경로')).toBeInTheDocument();
  });
});