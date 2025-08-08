import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDashboard } from '../AdminDashboard';

// Mock the admin components
jest.mock('../../components/admin/SystemMonitoring', () => ({
  SystemMonitoring: () => <div data-testid="system-monitoring">System Monitoring Component</div>
}));

jest.mock('../../components/admin/CongestionAnalytics', () => ({
  CongestionAnalytics: () => <div data-testid="congestion-analytics">Congestion Analytics Component</div>
}));

jest.mock('../../components/admin/FeedbackAnalysis', () => ({
  FeedbackAnalysis: () => <div data-testid="feedback-analysis">Feedback Analysis Component</div>
}));

jest.mock('../../components/admin/UserManagement', () => ({
  UserManagement: () => <div data-testid="user-management">User Management Component</div>
}));

jest.mock('../../components/admin/SystemSettings', () => ({
  SystemSettings: () => <div data-testid="system-settings">System Settings Component</div>
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Shield: () => <div data-testid="shield-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  MessageSquare: () => <div data-testid="message-square-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Server: () => <div data-testid="server-icon" />,
  Database: () => <div data-testid="database-icon" />,
  Wifi: () => <div data-testid="wifi-icon" />,
  Clock: () => <div data-testid="clock-icon" />
}));

describe('AdminDashboard', () => {
  it('renders admin dashboard header correctly', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('관리자 대시보드')).toBeInTheDocument();
    expect(screen.getByText('시스템 상태 및 운영 현황 모니터링')).toBeInTheDocument();
  });

  it('displays system overview metrics', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('시스템 상태')).toBeInTheDocument();
    expect(screen.getByText('98.5%')).toBeInTheDocument();
    
    expect(screen.getByText('활성 사용자')).toBeInTheDocument();
    expect(screen.getByText('15,247')).toBeInTheDocument();
    
    expect(screen.getByText('총 요청 수')).toBeInTheDocument();
    expect(screen.getByText('892,456')).toBeInTheDocument();
    
    expect(screen.getByText('평균 응답시간')).toBeInTheDocument();
    expect(screen.getByText('145ms')).toBeInTheDocument();
    
    expect(screen.getByText('가동률')).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();
  });

  it('shows recent alerts section', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('최근 알림')).toBeInTheDocument();
    expect(screen.getByText('2호선 강남역 센서 응답 지연 (3분)')).toBeInTheDocument();
    expect(screen.getByText('시스템 업데이트 완료 - v2.1.3')).toBeInTheDocument();
    expect(screen.getByText('데이터베이스 연결 일시 중단 (복구됨)')).toBeInTheDocument();
  });

  it('renders tab navigation', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('시스템 모니터링')).toBeInTheDocument();
    expect(screen.getByText('혼잡도 분석')).toBeInTheDocument();
    expect(screen.getByText('피드백 분석')).toBeInTheDocument();
    expect(screen.getByText('사용자 관리')).toBeInTheDocument();
    expect(screen.getByText('시스템 설정')).toBeInTheDocument();
  });

  it('shows system monitoring by default', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByTestId('system-monitoring')).toBeInTheDocument();
    expect(screen.queryByTestId('congestion-analytics')).not.toBeInTheDocument();
    expect(screen.queryByTestId('feedback-analysis')).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-management')).not.toBeInTheDocument();
    expect(screen.queryByTestId('system-settings')).not.toBeInTheDocument();
  });

  it('switches to congestion analytics tab when clicked', () => {
    render(<AdminDashboard />);
    
    const congestionTab = screen.getByText('혼잡도 분석');
    fireEvent.click(congestionTab);
    
    expect(screen.getByTestId('congestion-analytics')).toBeInTheDocument();
    expect(screen.queryByTestId('system-monitoring')).not.toBeInTheDocument();
  });

  it('switches to feedback analysis tab when clicked', () => {
    render(<AdminDashboard />);
    
    const feedbackTab = screen.getByText('피드백 분석');
    fireEvent.click(feedbackTab);
    
    expect(screen.getByTestId('feedback-analysis')).toBeInTheDocument();
    expect(screen.queryByTestId('system-monitoring')).not.toBeInTheDocument();
  });

  it('switches to user management tab when clicked', () => {
    render(<AdminDashboard />);
    
    const userTab = screen.getByText('사용자 관리');
    fireEvent.click(userTab);
    
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
    expect(screen.queryByTestId('system-monitoring')).not.toBeInTheDocument();
  });

  it('switches to system settings tab when clicked', () => {
    render(<AdminDashboard />);
    
    const settingsTab = screen.getByText('시스템 설정');
    fireEvent.click(settingsTab);
    
    expect(screen.getByTestId('system-settings')).toBeInTheDocument();
    expect(screen.queryByTestId('system-monitoring')).not.toBeInTheDocument();
  });

  it('highlights active tab correctly', () => {
    render(<AdminDashboard />);
    
    const monitoringTab = screen.getByText('시스템 모니터링');
    const congestionTab = screen.getByText('혼잡도 분석');
    
    // Monitoring tab should be active by default
    expect(monitoringTab.closest('button')).toHaveClass('border-red-500', 'text-red-600');
    expect(congestionTab.closest('button')).toHaveClass('border-transparent', 'text-gray-500');
    
    // Click congestion tab
    fireEvent.click(congestionTab);
    
    // Congestion tab should now be active
    expect(congestionTab.closest('button')).toHaveClass('border-red-500', 'text-red-600');
    expect(monitoringTab.closest('button')).toHaveClass('border-transparent', 'text-gray-500');
  });

  it('displays all required icons', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('activity-icon')).toHaveLength(2); // Header + stats
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument();
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('server-icon')).toBeInTheDocument();
  });

  it('shows last update timestamp', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('마지막 업데이트')).toBeInTheDocument();
    // The timestamp should be present (exact value will vary)
    const timestampElement = screen.getByText('마지막 업데이트').nextElementSibling;
    expect(timestampElement).toBeInTheDocument();
  });

  it('displays alert icons correctly', () => {
    render(<AdminDashboard />);
    
    // Should have alert triangle icons for different alert types
    expect(screen.getAllByTestId('alert-triangle-icon')).toHaveLength(2); // Warning and error alerts
    expect(screen.getByTestId('activity-icon')).toBeInTheDocument(); // Info alert
  });

  it('maintains tab state when switching', () => {
    render(<AdminDashboard />);
    
    // Switch to feedback analysis
    fireEvent.click(screen.getByText('피드백 분석'));
    expect(screen.getByTestId('feedback-analysis')).toBeInTheDocument();
    
    // Switch to user management
    fireEvent.click(screen.getByText('사용자 관리'));
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
    
    // Switch back to monitoring
    fireEvent.click(screen.getByText('시스템 모니터링'));
    expect(screen.getByTestId('system-monitoring')).toBeInTheDocument();
  });

  it('has proper responsive layout classes', () => {
    render(<AdminDashboard />);
    
    // Check for responsive grid classes in overview metrics
    const overviewGrid = screen.getByText('시스템 상태').closest('.grid');
    expect(overviewGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-5');
  });
});