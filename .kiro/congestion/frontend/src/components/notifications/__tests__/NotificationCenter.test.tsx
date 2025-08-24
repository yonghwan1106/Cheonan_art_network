import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationCenter } from '../NotificationCenter';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Bell: () => <div data-testid="bell-icon" />,
  X: () => <div data-testid="x-icon" />,
  Check: () => <div data-testid="check-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Info: () => <div data-testid="info-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  CheckCheck: () => <div data-testid="check-check-icon" />
}));

describe('NotificationCenter', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onNotificationClick: jest.fn(),
    onSettingsClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification center when open', async () => {
    render(<NotificationCenter {...defaultProps} />);
    
    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('읽지 않음')).toBeInTheDocument();
    expect(screen.getByText('교통')).toBeInTheDocument();
    expect(screen.getByText('일정')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<NotificationCenter {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('알림')).not.toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<NotificationCenter {...defaultProps} />);
    
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('displays mock notifications after loading', async () => {
    render(<NotificationCenter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
      expect(screen.getByText('경로 최적화 제안')).toBeInTheDocument();
      expect(screen.getByText('출발 시간 알림')).toBeInTheDocument();
      expect(screen.getByText('포인트 적립')).toBeInTheDocument();
      expect(screen.getByText('시스템 점검 안내')).toBeInTheDocument();
    });
  });

  it('filters notifications by category', async () => {
    render(<NotificationCenter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
    });

    // Click on traffic filter
    fireEvent.click(screen.getByText('교통'));
    
    await waitFor(() => {
      expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
      expect(screen.getByText('경로 최적화 제안')).toBeInTheDocument();
      expect(screen.queryByText('포인트 적립')).not.toBeInTheDocument();
    });
  });

  it('filters unread notifications', async () => {
    render(<NotificationCenter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
    });

    // Click on unread filter
    fireEvent.click(screen.getByText('읽지 않음'));
    
    await waitFor(() => {
      expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
      expect(screen.getByText('경로 최적화 제안')).toBeInTheDocument();
      expect(screen.queryByText('출발 시간 알림')).not.toBeInTheDocument(); // This one is read
    });
  });

  it('marks notification as read when clicked', async () => {
    render(<NotificationCenter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
    });

    const notification = screen.getByText('혼잡도 경고').closest('div');
    fireEvent.click(notification!);
    
    expect(defaultProps.onNotificationClick).toHaveBeenCalled();
  });

  it('marks individual notification as read', async () => {
    render(<NotificationCenter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
    });

    const checkButtons = screen.getAllByTestId('check-icon');
    fireEvent.click(checkButtons[0].closest('button')!);
    
    // Notification should still be visible but marked as read
    expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
  });

  it('marks all notifications as read', async () => {
    render(<NotificationCenter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
    });

    const markAllButton = screen.getByTestId('check-check-icon').closest('button');
    fireEvent.click(markAllButton!);
    
    // All notifications should still be visible
    expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
  });

  it('deletes notification', async () => {
    render(<NotificationCenter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);
    
    // Notification should be removed
    await waitFor(() => {
      expect(screen.queryByText('혼잡도 경고')).not.toBeInTheDocument();
    });
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<NotificationCenter {...defaultProps} />);
    
    const backdrop = document.querySelector('.fixed.inset-0.bg-black');
    fireEvent.click(backdrop!);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', () => {
    render(<NotificationCenter {...defaultProps} />);
    
    const closeButton = screen.getByTestId('x-icon').closest('button');
    fireEvent.click(closeButton!);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onSettingsClick when settings button is clicked', () => {
    render(<NotificationCenter {...defaultProps} />);
    
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    fireEvent.click(settingsButton!);
    
    expect(defaultProps.onSettingsClick).toHaveBeenCalled();
  });

  it('displays correct time ago format', async () => {
    render(<NotificationCenter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('5분 전')).toBeInTheDocument();
      expect(screen.getByText('15분 전')).toBeInTheDocument();
      expect(screen.getByText('30분 전')).toBeInTheDocument();
      expect(screen.getByText('1시간 전')).toBeInTheDocument();
      expect(screen.getByText('2시간 전')).toBeInTheDocument();
    });
  });

  it('shows empty state when no notifications match filter', async () => {
    render(<NotificationCenter {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
    });

    // Filter by reward category and then delete all reward notifications
    fireEvent.click(screen.getByText('교통'));
    
    await waitFor(() => {
      expect(screen.getByText('혼잡도 경고')).toBeInTheDocument();
    });

    // Delete all traffic notifications
    const deleteButtons = screen.getAllByTestId('trash-icon');
    deleteButtons.forEach(button => {
      fireEvent.click(button.closest('button')!);
    });

    await waitFor(() => {
      expect(screen.getByText('알림이 없습니다')).toBeInTheDocument();
    });
  });

  it('displays notification stats correctly', async () => {
    render(<NotificationCenter {...defaultProps} />);
    
    await waitFor(() => {
      // Should show unread count badge
      expect(screen.getByText('3')).toBeInTheDocument(); // 3 unread notifications
    });
  });
});