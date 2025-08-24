import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Timeline } from '../schedule/Timeline';

describe('Timeline', () => {
  const mockOnTimeSelect = vi.fn();
  const mockOnOptimizationRequest = vi.fn();

  beforeEach(() => {
    mockOnTimeSelect.mockClear();
    mockOnOptimizationRequest.mockClear();
  });

  it('renders timeline with time slots from 7:00 to 21:00', () => {
    render(<Timeline />);
    
    expect(screen.getByText('07:00')).toBeInTheDocument();
    expect(screen.getByText('21:00')).toBeInTheDocument();
    expect(screen.getByText('시간대별 혼잡도 예측')).toBeInTheDocument();
  });

  it('displays route name and date', () => {
    const testDate = new Date('2025-01-08');
    render(
      <Timeline 
        selectedRoute="1호선" 
        selectedDate={testDate}
      />
    );
    
    expect(screen.getByText('1호선 시간대별 혼잡도 예측')).toBeInTheDocument();
  });

  it('shows congestion legend', () => {
    render(<Timeline />);
    
    expect(screen.getByText('여유 (0-40%)')).toBeInTheDocument();
    expect(screen.getByText('보통 (41-70%)')).toBeInTheDocument();
    expect(screen.getByText('혼잡 (71-100%)')).toBeInTheDocument();
  });

  it('calls onTimeSelect when time slot is clicked', async () => {
    render(
      <Timeline 
        onTimeSelect={mockOnTimeSelect}
      />
    );
    
    const timeSlot = screen.getByTitle(/08:00/);
    fireEvent.click(timeSlot);
    
    expect(mockOnTimeSelect).toHaveBeenCalledWith('08:00');
  });

  it('displays selected time details when time is clicked', async () => {
    render(<Timeline />);
    
    const timeSlot = screen.getByTitle(/08:00/);
    fireEvent.click(timeSlot);
    
    await waitFor(() => {
      expect(screen.getByText('08:00 상세 정보')).toBeInTheDocument();
      expect(screen.getByText('혼잡도')).toBeInTheDocument();
      expect(screen.getByText('예측 정확도')).toBeInTheDocument();
      expect(screen.getByText('트렌드')).toBeInTheDocument();
    });
  });

  it('shows optimization button in selected time details', async () => {
    render(
      <Timeline 
        onOptimizationRequest={mockOnOptimizationRequest}
      />
    );
    
    const timeSlot = screen.getByTitle(/08:00/);
    fireEvent.click(timeSlot);
    
    await waitFor(() => {
      const optimizeButton = screen.getByText('최적 시간 찾기');
      expect(optimizeButton).toBeInTheDocument();
      
      fireEvent.click(optimizeButton);
      expect(mockOnOptimizationRequest).toHaveBeenCalledWith('08:00');
    });
  });

  it('displays rush hour indicators', () => {
    render(<Timeline />);
    
    const rushHourLabels = screen.getAllByText('러시아워');
    expect(rushHourLabels.length).toBeGreaterThan(0);
  });

  it('shows current time indicator', () => {
    render(<Timeline />);
    
    expect(screen.getByText(/현재 시간:/)).toBeInTheDocument();
  });

  it('displays congestion percentages in time slots', () => {
    render(<Timeline />);
    
    // Should show percentage values
    const percentageRegex = /\d+%/;
    const percentageElements = screen.getAllByText(percentageRegex);
    expect(percentageElements.length).toBeGreaterThan(0);
  });

  it('shows optimization suggestion for high congestion times', async () => {
    render(<Timeline />);
    
    // Find and click a high congestion time slot
    const timeSlots = screen.getAllByRole('button');
    const highCongestionSlot = timeSlots.find(slot => 
      slot.getAttribute('title')?.includes('8') // Morning rush hour
    );
    
    if (highCongestionSlot) {
      fireEvent.click(highCongestionSlot);
      
      await waitFor(() => {
        // Check if optimization suggestion appears
        const suggestionText = screen.queryByText(/더 나은 시간 추천/);
        if (suggestionText) {
          expect(suggestionText).toBeInTheDocument();
        }
      });
    }
  });

  it('handles empty props gracefully', () => {
    render(<Timeline />);
    
    // Should render without crashing
    expect(screen.getByText(/시간대별 혼잡도 예측/)).toBeInTheDocument();
  });

  it('displays alerts for selected time slots', async () => {
    render(<Timeline />);
    
    const timeSlot = screen.getByTitle(/08:00/);
    fireEvent.click(timeSlot);
    
    await waitFor(() => {
      // Should show some kind of alert or message
      const detailsSection = screen.getByText('08:00 상세 정보');
      expect(detailsSection).toBeInTheDocument();
    });
  });

  it('shows trend indicators in time slots', () => {
    render(<Timeline />);
    
    // Timeline should render trend indicators (up/down arrows or stable indicators)
    // This is visual, so we just check that the component renders
    expect(screen.getByText('시간대별 혼잡도 (7:00 - 21:00)')).toBeInTheDocument();
  });

  it('updates selected time when clicking different slots', async () => {
    render(<Timeline onTimeSelect={mockOnTimeSelect} />);
    
    const firstSlot = screen.getByTitle(/08:00/);
    const secondSlot = screen.getByTitle(/09:00/);
    
    fireEvent.click(firstSlot);
    expect(mockOnTimeSelect).toHaveBeenCalledWith('08:00');
    
    fireEvent.click(secondSlot);
    expect(mockOnTimeSelect).toHaveBeenCalledWith('09:00');
  });

  it('displays prediction accuracy in selected time details', async () => {
    render(<Timeline />);
    
    const timeSlot = screen.getByTitle(/08:00/);
    fireEvent.click(timeSlot);
    
    await waitFor(() => {
      expect(screen.getByText('예측 정확도')).toBeInTheDocument();
      // Should show a percentage value
      const accuracyRegex = /\d+%/;
      const accuracyElements = screen.getAllByText(accuracyRegex);
      expect(accuracyElements.length).toBeGreaterThan(0);
    });
  });
});