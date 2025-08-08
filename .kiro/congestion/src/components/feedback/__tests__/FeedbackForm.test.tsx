import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbackForm } from '../FeedbackForm';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Star: () => <div data-testid="star-icon" />,
  Send: () => <div data-testid="send-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Lightbulb: () => <div data-testid="lightbulb-icon" />,
  Bug: () => <div data-testid="bug-icon" />,
  Heart: () => <div data-testid="heart-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />
}));

describe('FeedbackForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');
  });

  it('renders feedback form with all required fields', () => {
    render(<FeedbackForm />);
    
    expect(screen.getByText('피드백 유형')).toBeInTheDocument();
    expect(screen.getByText('카테고리')).toBeInTheDocument();
    expect(screen.getByText('서비스 만족도')).toBeInTheDocument();
    expect(screen.getByText('제목 *')).toBeInTheDocument();
    expect(screen.getByText('상세 내용 *')).toBeInTheDocument();
    expect(screen.getByText('피드백 제출')).toBeInTheDocument();
  });

  it('displays feedback type options', () => {
    render(<FeedbackForm />);
    
    expect(screen.getByText('개선 제안')).toBeInTheDocument();
    expect(screen.getByText('버그 신고')).toBeInTheDocument();
    expect(screen.getByText('칭찬')).toBeInTheDocument();
    expect(screen.getByText('불만사항')).toBeInTheDocument();
  });

  it('allows selecting feedback type', () => {
    render(<FeedbackForm />);
    
    const bugReportButton = screen.getByText('버그 신고');
    fireEvent.click(bugReportButton);
    
    // The button should be selected (this would be visually indicated by styling)
    expect(bugReportButton.closest('button')).toHaveClass('border-red-500');
  });

  it('allows selecting category', () => {
    render(<FeedbackForm />);
    
    const categorySelect = screen.getByDisplayValue('혼잡도 정보');
    fireEvent.change(categorySelect, { target: { value: 'route' } });
    
    expect(categorySelect).toHaveValue('route');
  });

  it('allows rating selection', () => {
    render(<FeedbackForm />);
    
    const starButtons = screen.getAllByTestId('star-icon');
    fireEvent.click(starButtons[3]); // Click 4th star (4/5 rating)
    
    expect(screen.getByText('4/5 (만족)')).toBeInTheDocument();
  });

  it('shows route and station fields for congestion/route categories', () => {
    render(<FeedbackForm />);
    
    // Should show by default since congestion is selected
    expect(screen.getByText('관련 노선 (선택사항)')).toBeInTheDocument();
    expect(screen.getByText('관련 역 (선택사항)')).toBeInTheDocument();
  });

  it('hides route and station fields for other categories', () => {
    render(<FeedbackForm />);
    
    const categorySelect = screen.getByDisplayValue('혼잡도 정보');
    fireEvent.change(categorySelect, { target: { value: 'ui' } });
    
    expect(screen.queryByText('관련 노선 (선택사항)')).not.toBeInTheDocument();
    expect(screen.queryByText('관련 역 (선택사항)')).not.toBeInTheDocument();
  });

  it('validates required fields', () => {
    render(<FeedbackForm />);
    
    const submitButton = screen.getByText('피드백 제출');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when required fields are filled', () => {
    render(<FeedbackForm />);
    
    const titleInput = screen.getByPlaceholderText('피드백 제목을 입력하세요');
    const descriptionTextarea = screen.getByPlaceholderText(/구체적인 내용을 작성해주세요/);
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'This is a test description with more than 10 characters' } });
    
    const submitButton = screen.getByText('피드백 제출');
    expect(submitButton).not.toBeDisabled();
  });

  it('shows character count for description', () => {
    render(<FeedbackForm />);
    
    const descriptionTextarea = screen.getByPlaceholderText(/구체적인 내용을 작성해주세요/);
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });
    
    expect(screen.getByText('(16/500)')).toBeInTheDocument();
  });

  it('submits form and shows success message', async () => {
    render(<FeedbackForm />);
    
    // Fill required fields
    const titleInput = screen.getByPlaceholderText('피드백 제목을 입력하세요');
    const descriptionTextarea = screen.getByPlaceholderText(/구체적인 내용을 작성해주세요/);
    
    fireEvent.change(titleInput, { target: { value: 'Test Feedback' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'This is a detailed test feedback description' } });
    
    // Submit form
    const submitButton = screen.getByText('피드백 제출');
    fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText('제출 중...')).toBeInTheDocument();
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('피드백이 제출되었습니다!')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    expect(screen.getByText('소중한 의견 감사합니다. 검토 후 빠른 시일 내에 답변드리겠습니다.')).toBeInTheDocument();
  });

  it('saves feedback to localStorage on submit', async () => {
    render(<FeedbackForm />);
    
    // Fill and submit form
    const titleInput = screen.getByPlaceholderText('피드백 제목을 입력하세요');
    const descriptionTextarea = screen.getByPlaceholderText(/구체적인 내용을 작성해주세요/);
    
    fireEvent.change(titleInput, { target: { value: 'Test Feedback' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description for localStorage' } });
    
    const submitButton = screen.getByText('피드백 제출');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'userFeedback',
        expect.stringContaining('Test Feedback')
      );
    }, { timeout: 2000 });
  });

  it('resets form after successful submission', async () => {
    render(<FeedbackForm />);
    
    // Fill and submit form
    const titleInput = screen.getByPlaceholderText('피드백 제목을 입력하세요');
    const descriptionTextarea = screen.getByPlaceholderText(/구체적인 내용을 작성해주세요/);
    
    fireEvent.change(titleInput, { target: { value: 'Test Feedback' } });
    fireEvent.change(descriptionTextarea, { target: { value: 'Test description' } });
    
    const submitButton = screen.getByText('피드백 제출');
    fireEvent.click(submitButton);
    
    // Wait for success message and then form reset
    await waitFor(() => {
      expect(screen.getByText('피드백이 제출되었습니다!')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Wait for form reset (after 3 seconds)
    await waitFor(() => {
      expect(screen.getByText('피드백 제출')).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  it('displays helpful tips', () => {
    render(<FeedbackForm />);
    
    expect(screen.getByText('💡 더 나은 피드백을 위한 팁')).toBeInTheDocument();
    expect(screen.getByText('• 구체적인 상황과 예시를 포함해주세요')).toBeInTheDocument();
    expect(screen.getByText('• 문제가 발생한 시간과 장소를 명시해주세요')).toBeInTheDocument();
  });

  it('shows different rating labels', () => {
    render(<FeedbackForm />);
    
    const starButtons = screen.getAllByTestId('star-icon');
    
    fireEvent.click(starButtons[0]); // 1 star
    expect(screen.getByText('1/5 (매우 불만족)')).toBeInTheDocument();
    
    fireEvent.click(starButtons[2]); // 3 stars
    expect(screen.getByText('3/5 (보통)')).toBeInTheDocument();
    
    fireEvent.click(starButtons[4]); // 5 stars
    expect(screen.getByText('5/5 (매우 만족)')).toBeInTheDocument();
  });
});