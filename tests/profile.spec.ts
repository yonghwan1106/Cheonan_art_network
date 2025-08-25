import { test, expect } from '@playwright/test';

test.describe('Profile Page Tests', () => {
  test('artist profile loads correctly', async ({ page }) => {
    await page.goto('/profile/artist_001');
    
    // Check mock data notice
    await expect(page.getByText('현재 표시되는 프로필 정보는 시연을 위한 가상 데이터입니다.')).toBeVisible();
    
    // Check profile name
    await expect(page.getByText('김민수')).toBeVisible();
    
    // Check profile sections
    await expect(page.getByText('소개')).toBeVisible();
    await expect(page.getByText('포트폴리오')).toBeVisible();
    
    // Check portfolio works
    await expect(page.getByText('도시의 리듬')).toBeVisible();
    await expect(page.getByText('침묵의 소리')).toBeVisible();
    
    // Check portfolio details
    await expect(page.getByText('Oil on Canvas')).toBeVisible();
    await expect(page.getByText('Mixed Media')).toBeVisible();
  });

  test('curator profile loads correctly', async ({ page }) => {
    await page.goto('/profile/curator_001');
    
    // Check mock data notice
    await expect(page.getByText('현재 표시되는 프로필 정보는 시연을 위한 가상 데이터입니다.')).toBeVisible();
    
    // Check profile name
    await expect(page.getByText('이수진')).toBeVisible();
    
    // Check organization (should appear in profile info)
    await expect(page.getByText('천안문화재단').first()).toBeVisible();
    
    // Check sections by heading
    await expect(page.getByRole('heading', { name: '소개' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '주요 프로젝트' })).toBeVisible();
  });

  test('profile images load correctly', async ({ page }) => {
    await page.goto('/profile/artist_001');
    
    // Wait for profile image to load
    const profileImage = page.locator('img').first();
    await expect(profileImage).toBeVisible();
    
    // Check portfolio images
    const portfolioImages = page.locator('.aspect-square img');
    await expect(portfolioImages.first()).toBeVisible();
  });

  test('profile not found page works', async ({ page }) => {
    await page.goto('/profile/nonexistent');
    
    // Check error message
    await expect(page.getByText('프로필을 찾을 수 없습니다')).toBeVisible();
    await expect(page.getByText('홈으로 돌아가기')).toBeVisible();
  });

  test('profile action buttons are visible', async ({ page }) => {
    await page.goto('/profile/artist_001');
    
    // Check if action buttons are present in the header
    const actionButtons = page.locator('.pb-4 button');
    const buttonCount = await actionButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('portfolio hover effects work', async ({ page }) => {
    await page.goto('/profile/artist_001');
    
    // Check portfolio items have hover class
    const portfolioItems = page.locator('.group.cursor-pointer');
    await expect(portfolioItems.first()).toBeVisible();
    
    // Check portfolio item details
    const firstPortfolioItem = portfolioItems.first();
    await expect(firstPortfolioItem.locator('h3')).toBeVisible();
    await expect(firstPortfolioItem.locator('p').first()).toBeVisible();
  });
});