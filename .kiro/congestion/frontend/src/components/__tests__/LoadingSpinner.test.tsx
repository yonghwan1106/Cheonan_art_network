import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { 
  LoadingSpinner, 
  LoadingOverlay, 
  LoadingCard, 
  Skeleton, 
  LoadingButton 
} from '../common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-6', 'w-6', 'border-blue-600');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('renders with custom color', () => {
    render(<LoadingSpinner color="white" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('border-white');
  });

  it('includes accessibility attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', '로딩 중');
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });
});

describe('LoadingOverlay', () => {
  it('renders with default message', () => {
    render(<LoadingOverlay />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = '데이터를 불러오는 중...';
    render(<LoadingOverlay message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('has correct overlay styling', () => {
    const { container } = render(<LoadingOverlay />);
    const overlay = container.firstChild;
    expect(overlay).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50');
  });
});

describe('LoadingCard', () => {
  it('renders with default message', () => {
    render(<LoadingCard />);
    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = '사용자 정보를 불러오는 중...';
    render(<LoadingCard message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('has card styling', () => {
    const { container } = render(<LoadingCard />);
    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow', 'p-6');
  });
});

describe('Skeleton', () => {
  it('renders single line by default', () => {
    const { container } = render(<Skeleton />);
    const skeletonLines = container.querySelectorAll('.bg-gray-200');
    expect(skeletonLines).toHaveLength(1);
  });

  it('renders multiple lines when specified', () => {
    const { container } = render(<Skeleton lines={3} />);
    const skeletonLines = container.querySelectorAll('.bg-gray-200');
    expect(skeletonLines).toHaveLength(3);
  });

  it('has animation class', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('last line has different width when multiple lines', () => {
    const { container } = render(<Skeleton lines={2} />);
    const skeletonLines = container.querySelectorAll('.bg-gray-200');
    expect(skeletonLines[0]).toHaveClass('w-full');
    expect(skeletonLines[1]).toHaveClass('w-3/4');
  });
});

describe('LoadingButton', () => {
  it('renders children when not loading', () => {
    render(
      <LoadingButton isLoading={false}>
        Click me
      </LoadingButton>
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    render(
      <LoadingButton isLoading={true}>
        Click me
      </LoadingButton>
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(
      <LoadingButton isLoading={true}>
        Click me
      </LoadingButton>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <LoadingButton isLoading={false} disabled={true}>
        Click me
      </LoadingButton>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick when clicked and not loading', () => {
    const mockClick = vi.fn();
    render(
      <LoadingButton isLoading={false} onClick={mockClick}>
        Click me
      </LoadingButton>
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when loading', () => {
    const mockClick = vi.fn();
    render(
      <LoadingButton isLoading={true} onClick={mockClick}>
        Click me
      </LoadingButton>
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockClick).not.toHaveBeenCalled();
  });

  it('has correct button type', () => {
    render(
      <LoadingButton isLoading={false} type="submit">
        Submit
      </LoadingButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});