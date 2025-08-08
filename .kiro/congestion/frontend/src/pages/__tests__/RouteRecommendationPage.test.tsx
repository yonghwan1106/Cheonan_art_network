import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouteRecommendationPage } from '../RouteRecommendationPage';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('RouteRecommendationPage', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('renders route recommendation page with search form', () => {
    render(<RouteRecommendationPage />);
    
    expect(screen.getByText('경로 추천')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('출발지를 입력하세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('도착지를 입력하세요')).toBeInTheDocument();
    expect(screen.getByText('경로 검색')).toBeInTheDocument();
  });

  it('displays popular destinations', () => {
    render(<RouteRecommendationPage />);
    
    expect(screen.getByText('인기 목적지')).toBeInTheDocument();
    expect(screen.getByText('강남역')).toBeInTheDocument();
    expect(screen.getByText('홍대입구')).toBeInTheDocument();
    expect(screen.getByText('명동')).toBeInTheDocument();
  });

  it('allows entering origin and destination', () => {
    render(<RouteRecommendationPage />);
    
    const originInput = screen.getByPlaceholderText('출발지를 입력하세요');
    const destinationInput = screen.getByPlaceholderText('도착지를 입력하세요');
    
    fireEvent.change(originInput, { target: { value: '홍익대입구' } });
    fireEvent.change(destinationInput, { target: { value: '강남' } });
    
    expect(originInput).toHaveValue('홍익대입구');
    expect(destinationInput).toHaveValue('강남');
  });

  it('shows alert when searching without origin or destination', async () => {
    // Mock window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<RouteRecommendationPage />);
    
    const searchButton = screen.getByText('경로 검색');
    fireEvent.click(searchButton);
    
    expect(alertSpy).toHaveBeenCalledWith('출발지와 도착지를 모두 입력해주세요.');
    
    alertSpy.mockRestore();
  });

  it('shows alert when origin and destination are the same', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<RouteRecommendationPage />);
    
    const originInput = screen.getByPlaceholderText('출발지를 입력하세요');
    const destinationInput = screen.getByPlaceholderText('도착지를 입력하세요');
    
    fireEvent.change(originInput, { target: { value: '강남' } });
    fireEvent.change(destinationInput, { target: { value: '강남' } });
    
    const searchButton = screen.getByText('경로 검색');
    fireEvent.click(searchButton);
    
    expect(alertSpy).toHaveBeenCalledWith('출발지와 도착지가 같습니다.');
    
    alertSpy.mockRestore();
  });

  it('performs search and shows loading state', async () => {
    render(<RouteRecommendationPage />);
    
    const originInput = screen.getByPlaceholderText('출발지를 입력하세요');
    const destinationInput = screen.getByPlaceholderText('도착지를 입력하세요');
    
    fireEvent.change(originInput, { target: { value: '홍익대입구' } });
    fireEvent.change(destinationInput, { target: { value: '강남' } });
    
    const searchButton = screen.getByText('경로 검색');
    fireEvent.click(searchButton);
    
    expect(screen.getByText('검색 중...')).toBeInTheDocument();
    expect(screen.getByText('최적의 경로를 찾고 있습니다...')).toBeInTheDocument();
  });

  it('shows search results after successful search', async () => {
    render(<RouteRecommendationPage />);
    
    const originInput = screen.getByPlaceholderText('출발지를 입력하세요');
    const destinationInput = screen.getByPlaceholderText('도착지를 입력하세요');
    
    fireEvent.change(originInput, { target: { value: '홍익대입구' } });
    fireEvent.change(destinationInput, { target: { value: '강남' } });
    
    const searchButton = screen.getByText('경로 검색');
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(screen.getByText('추천 경로')).toBeInTheDocument();
      expect(screen.getByText('최단 시간')).toBeInTheDocument();
      expect(screen.getByText('쾌적한 경로')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('allows selecting quick destinations', () => {
    render(<RouteRecommendationPage />);
    
    const gangnamButton = screen.getByText('강남역');
    fireEvent.click(gangnamButton);
    
    const destinationInput = screen.getByPlaceholderText('도착지를 입력하세요');
    expect(destinationInput).toHaveValue('강남역');
  });

  it('swaps origin and destination when swap button is clicked', () => {
    render(<RouteRecommendationPage />);
    
    const originInput = screen.getByPlaceholderText('출발지를 입력하세요');
    const destinationInput = screen.getByPlaceholderText('도착지를 입력하세요');
    
    fireEvent.change(originInput, { target: { value: '홍익대입구' } });
    fireEvent.change(destinationInput, { target: { value: '강남' } });
    
    const swapButton = screen.getByText('⇄ 바꾸기');
    fireEvent.click(swapButton);
    
    expect(originInput).toHaveValue('강남');
    expect(destinationInput).toHaveValue('홍익대입구');
  });

  it('clears form when clear button is clicked', () => {
    render(<RouteRecommendationPage />);
    
    const originInput = screen.getByPlaceholderText('출발지를 입력하세요');
    const destinationInput = screen.getByPlaceholderText('도착지를 입력하세요');
    
    fireEvent.change(originInput, { target: { value: '홍익대입구' } });
    fireEvent.change(destinationInput, { target: { value: '강남' } });
    
    const clearButton = screen.getByText('초기화');
    fireEvent.click(clearButton);
    
    expect(originInput).toHaveValue('');
    expect(destinationInput).toHaveValue('');
  });

  it('sets default departure time to current time', () => {
    render(<RouteRecommendationPage />);
    
    const timeInput = screen.getByDisplayValue(/\d{2}:\d{2}/);
    expect(timeInput).toBeInTheDocument();
  });

  it('displays statistics section', () => {
    render(<RouteRecommendationPage />);
    
    expect(screen.getByText('이용 통계')).toBeInTheDocument();
    expect(screen.getByText('총 검색 횟수')).toBeInTheDocument();
    expect(screen.getByText('저장된 경로')).toBeInTheDocument();
    expect(screen.getByText('총 이용 횟수')).toBeInTheDocument();
    expect(screen.getByText('평균 절약 시간')).toBeInTheDocument();
  });

  it('shows search tips', () => {
    render(<RouteRecommendationPage />);
    
    expect(screen.getByText('💡 검색 팁')).toBeInTheDocument();
    expect(screen.getByText(/역명이나 주요 건물명으로 검색하세요/)).toBeInTheDocument();
  });

  it('loads saved routes from localStorage on mount', () => {
    const mockSavedRoutes = JSON.stringify([
      {
        id: 'saved-1',
        name: '홍익대입구 → 강남',
        origin: '홍익대입구',
        destination: '강남',
        savedAt: '2025-01-08T10:00:00Z',
        usageCount: 5
      }
    ]);
    
    localStorageMock.getItem.mockReturnValue(mockSavedRoutes);
    
    render(<RouteRecommendationPage />);
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('savedRoutes');
  });

  it('loads recent searches from localStorage on mount', () => {
    const mockRecentSearches = JSON.stringify([
      {
        id: 'search-1',
        origin: '홍익대입구',
        destination: '강남',
        searchedAt: '2025-01-08T10:00:00Z'
      }
    ]);
    
    localStorageMock.getItem.mockReturnValue(mockRecentSearches);
    
    render(<RouteRecommendationPage />);
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('recentSearches');
  });

  it('handles empty localStorage gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<RouteRecommendationPage />);
    
    // Should render without crashing
    expect(screen.getByText('경로 추천')).toBeInTheDocument();
  });

  it('allows changing departure time', () => {
    render(<RouteRecommendationPage />);
    
    const timeInput = screen.getByDisplayValue(/\d{2}:\d{2}/);
    fireEvent.change(timeInput, { target: { value: '09:30' } });
    
    expect(timeInput).toHaveValue('09:30');
  });

  it('disables search button during search', async () => {
    render(<RouteRecommendationPage />);
    
    const originInput = screen.getByPlaceholderText('출발지를 입력하세요');
    const destinationInput = screen.getByPlaceholderText('도착지를 입력하세요');
    
    fireEvent.change(originInput, { target: { value: '홍익대입구' } });
    fireEvent.change(destinationInput, { target: { value: '강남' } });
    
    const searchButton = screen.getByText('경로 검색');
    fireEvent.click(searchButton);
    
    const searchingButton = screen.getByText('검색 중...');
    expect(searchingButton).toBeDisabled();
  });
});