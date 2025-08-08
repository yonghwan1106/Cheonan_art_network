import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from '../auth/LoginForm';

describe('LoginForm', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
  });

  it('renders login form correctly', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    expect(screen.getByText('로그인')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '데모 계정으로 로그인' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const submitButton = screen.getByRole('button', { name: '로그인' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email format', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    const submitButton = screen.getByRole('button', { name: '로그인' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요')).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('shows validation error for short password', async () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    const submitButton = screen.getByRole('button', { name: '로그인' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('비밀번호는 6자 이상이어야 합니다')).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('calls onLogin with correct credentials when form is valid', async () => {
    mockOnLogin.mockResolvedValue(undefined);
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    const submitButton = screen.getByRole('button', { name: '로그인' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows loading state during login', async () => {
    render(<LoginForm onLogin={mockOnLogin} isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: '로그인 중...' });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('로그인 중...')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = '로그인에 실패했습니다.';
    render(<LoginForm onLogin={mockOnLogin} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('fills demo credentials when demo button is clicked', () => {
    render(<LoginForm onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;
    const demoButton = screen.getByRole('button', { name: '데모 계정으로 로그인' });

    fireEvent.click(demoButton);

    expect(emailInput.value).toBe('demo@example.com');
    expect(passwordInput.value).toBe('demo123');
  });

  it('disables form inputs when loading', () => {
    render(<LoginForm onLogin={mockOnLogin} isLoading={true} />);
    
    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    const submitButton = screen.getByRole('button', { name: '로그인 중...' });
    const demoButton = screen.getByRole('button', { name: '데모 계정으로 로그인' });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(demoButton).toBeDisabled();
  });
});