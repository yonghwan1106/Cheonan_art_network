import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TouchFriendlyButton } from '../TouchFriendlyButton';

// Mock the useIsTouchDevice hook
jest.mock('../../../hooks/useMediaQuery', () => ({
  useIsTouchDevice: jest.fn()
}));

import { useIsTouchDevice } from '../../../hooks/useMediaQuery';

const mockUseIsTouchDevice = useIsTouchDevice as jest.MockedFunction<typeof useIsTouchDevice>;

describe('TouchFriendlyButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with children', () => {
    mockUseIsTouchDevice.mockReturnValue(false);
    
    render(
      <TouchFriendlyButton onClick={mockOnClick}>
        Click me
      </TouchFriendlyButton>
    );
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    mockUseIsTouchDevice.mockReturnValue(false);
    
    render(
      <TouchFriendlyButton onClick={mockOnClick}>
        Click me
      </TouchFriendlyButton>
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    mockUseIsTouchDevice.mockReturnValue(false);
    
    render(
      <TouchFriendlyButton onClick={mockOnClick} disabled>
        Click me
      </TouchFriendlyButton>
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies touch-friendly styles on touch devices', () => {
    mockUseIsTouchDevice.mockReturnValue(true);
    
    render(
      <TouchFriendlyButton onClick={mockOnClick} size="md">
        Click me
      </TouchFriendlyButton>
    );
    
    const button = screen.getByText('Click me');
    expect(button).toHaveClass('min-h-[48px]');
    expect(button).toHaveClass('active:scale-95');
  });

  it('applies desktop styles on non-touch devices', () => {
    mockUseIsTouchDevice.mockReturnValue(false);
    
    render(
      <TouchFriendlyButton onClick={mockOnClick} size="md">
        Click me
      </TouchFriendlyButton>
    );
    
    const button = screen.getByText('Click me');
    expect(button).not.toHaveClass('min-h-[48px]');
    expect(button).toHaveClass('hover:scale-105');
  });

  it('renders with icon', () => {
    mockUseIsTouchDevice.mockReturnValue(false);
    
    render(
      <TouchFriendlyButton 
        onClick={mockOnClick} 
        icon={<span data-testid="test-icon">🔥</span>}
      >
        Click me
      </TouchFriendlyButton>
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant styles correctly', () => {
    mockUseIsTouchDevice.mockReturnValue(false);
    
    const { rerender } = render(
      <TouchFriendlyButton onClick={mockOnClick} variant="primary">
        Primary
      </TouchFriendlyButton>
    );
    
    expect(screen.getByText('Primary')).toHaveClass('bg-blue-600');
    
    rerender(
      <TouchFriendlyButton onClick={mockOnClick} variant="secondary">
        Secondary
      </TouchFriendlyButton>
    );
    
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-600');
    
    rerender(
      <TouchFriendlyButton onClick={mockOnClick} variant="outline">
        Outline
      </TouchFriendlyButton>
    );
    
    expect(screen.getByText('Outline')).toHaveClass('bg-transparent', 'border-blue-600');
  });

  it('applies size styles correctly', () => {
    mockUseIsTouchDevice.mockReturnValue(false);
    
    const { rerender } = render(
      <TouchFriendlyButton onClick={mockOnClick} size="sm">
        Small
      </TouchFriendlyButton>
    );
    
    expect(screen.getByText('Small')).toHaveClass('text-sm');
    
    rerender(
      <TouchFriendlyButton onClick={mockOnClick} size="lg">
        Large
      </TouchFriendlyButton>
    );
    
    expect(screen.getByText('Large')).toHaveClass('text-lg');
  });

  it('applies fullWidth when specified', () => {
    mockUseIsTouchDevice.mockReturnValue(false);
    
    render(
      <TouchFriendlyButton onClick={mockOnClick} fullWidth>
        Full Width
      </TouchFriendlyButton>
    );
    
    expect(screen.getByText('Full Width')).toHaveClass('w-full');
  });

  it('applies disabled styles when disabled', () => {
    mockUseIsTouchDevice.mockReturnValue(false);
    
    render(
      <TouchFriendlyButton onClick={mockOnClick} disabled>
        Disabled
      </TouchFriendlyButton>
    );
    
    const button = screen.getByText('Disabled');
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    mockUseIsTouchDevice.mockReturnValue(false);
    
    render(
      <TouchFriendlyButton onClick={mockOnClick} className="custom-class">
        Custom
      </TouchFriendlyButton>
    );
    
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });
});