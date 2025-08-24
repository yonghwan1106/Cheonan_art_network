import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackPage } from '../FeedbackPage';

// Mock the feedback components
jest.mock('../../components/feedback/FeedbackForm', () => ({
  FeedbackForm: () => <div data-testid="feedback-form">Feedback Form Component</div>
}));

jest.mock('../../components/feedback/FeedbackHistory', () => ({
  FeedbackHistory: () => <div data-testid="feedback-history">Feedback History Component</div>
}));

jest.mock('../../components/feedback/FeedbackAnalytics', () => ({
  FeedbackAnalytics: () => <div data-testid="feedback-analytics">Feedback Analytics Component</div>
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  MessageSquare: () => <div data-testid="message-square-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Send: () => <div data-testid="send-icon" />,
  ThumbsUp: () => <div data-testid="thumbs-up-icon" />,
  ThumbsDown: () => <div data-testid="thumbs-down-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />
}));

describe('FeedbackPage', () => {
  it('renders page header correctly', () => {
    render(<FeedbackPage />);
    
    expect(screen.getByText('피드백 센터')).toBeInTheDocument();
    expect(screen.getByText('서비스 개선을 위한 소중한 의견을 들려주세요')).toBeInTheDocument();
  });

  it('displays quick stats cards', () => {
    render(<FeedbackPage />);
    
    expect(screen.getByText('제출한 피드백')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    
    expect(screen.getByText('평균 만족도')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
    
    expect(screen.getByText('처리 완료')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    
    expect(screen.getByText('처리 대기')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders tab navigation', () => {
    render(<FeedbackPage />);
    
    expect(screen.getByText('피드백 제출')).toBeInTheDocument();
    expect(screen.getByText('제출 내역')).toBeInTheDocument();
    expect(screen.getByText('통계')).toBeInTheDocument();
  });

  it('shows feedback form by default', () => {
    render(<FeedbackPage />);
    
    expect(screen.getByTestId('feedback-form')).toBeInTheDocument();
    expect(screen.queryByTestId('feedback-history')).not.toBeInTheDocument();
    expect(screen.queryByTestId('feedback-analytics')).not.toBeInTheDocument();
  });

  it('switches to history tab when clicked', () => {
    render(<FeedbackPage />);
    
    const historyTab = screen.getByText('제출 내역');
    fireEvent.click(historyTab);
    
    expect(screen.getByTestId('feedback-history')).toBeInTheDocument();
    expect(screen.queryByTestId('feedback-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('feedback-analytics')).not.toBeInTheDocument();
  });

  it('switches to analytics tab when clicked', () => {
    render(<FeedbackPage />);
    
    const analyticsTab = screen.getByText('통계');
    fireEvent.click(analyticsTab);
    
    expect(screen.getByTestId('feedback-analytics')).toBeInTheDocument();
    expect(screen.queryByTestId('feedback-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('feedback-history')).not.toBeInTheDocument();
  });

  it('highlights active tab correctly', () => {
    render(<FeedbackPage />);
    
    const submitTab = screen.getByText('피드백 제출');
    const historyTab = screen.getByText('제출 내역');
    
    // Submit tab should be active by default
    expect(submitTab.closest('button')).toHaveClass('border-blue-500', 'text-blue-600');
    expect(historyTab.closest('button')).toHaveClass('border-transparent', 'text-gray-500');
    
    // Click history tab
    fireEvent.click(historyTab);
    
    // History tab should now be active
    expect(historyTab.closest('button')).toHaveClass('border-blue-500', 'text-blue-600');
    expect(submitTab.closest('button')).toHaveClass('border-transparent', 'text-gray-500');
  });

  it('displays all stat icons', () => {
    render(<FeedbackPage />);
    
    expect(screen.getAllByTestId('message-square-icon')).toHaveLength(2); // Header + stats
    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
  });

  it('maintains tab state when switching', () => {
    render(<FeedbackPage />);
    
    // Switch to history
    fireEvent.click(screen.getByText('제출 내역'));
    expect(screen.getByTestId('feedback-history')).toBeInTheDocument();
    
    // Switch to analytics
    fireEvent.click(screen.getByText('통계'));
    expect(screen.getByTestId('feedback-analytics')).toBeInTheDocument();
    
    // Switch back to submit
    fireEvent.click(screen.getByText('피드백 제출'));
    expect(screen.getByTestId('feedback-form')).toBeInTheDocument();
  });

  it('has proper responsive layout classes', () => {
    render(<FeedbackPage />);
    
    // Check for responsive grid classes
    const statsGrid = screen.getByText('제출한 피드백').closest('.grid');
    expect(statsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-4');
    
    // Check for responsive spacing
    const tabNav = screen.getByText('피드백 제출').closest('nav');
    expect(tabNav).toHaveClass('flex', 'space-x-8');
  });
});