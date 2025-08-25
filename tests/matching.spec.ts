import { test, expect } from '@playwright/test';

test.describe('Matching Page Tests', () => {
  test('matching page loads correctly', async ({ page }) => {
    await page.goto('/matching');
    
    // Check page title
    await expect(page.getByText('AI 매칭 시스템')).toBeVisible();
    
    // Check mock data notice
    await expect(page.getByText('현재 표시되는 데이터들은 시연을 위한 가상 데이터입니다.')).toBeVisible();
    
    // Check project selection sidebar
    await expect(page.getByText('프로젝트 선택')).toBeVisible();
    
    // Check filters
    const scoreFilter = page.locator('select').first();
    const locationFilter = page.locator('select').nth(1);
    await expect(scoreFilter).toBeVisible();
    await expect(locationFilter).toBeVisible();
    
    // Check refresh button
    await expect(page.getByText('새로고침')).toBeVisible();
  });

  test('project selection works', async ({ page }) => {
    await page.goto('/matching');
    
    // Wait for projects to load in sidebar
    await page.waitForSelector('[data-testid="project-button"], .p-3.rounded-lg', { timeout: 5000 });
    
    // Get all project buttons in sidebar (they have border styling)
    const projectButtons = page.locator('.border.border-gray-200, .border-2.border-blue-200');
    const buttonCount = await projectButtons.count();
    
    if (buttonCount > 1) {
      // Click on second project
      await projectButtons.nth(1).click();
      
      // Check if project details changed
      await page.waitForTimeout(1000);
      await expect(page.getByText('프로젝트 상세')).toBeVisible();
    }
  });

  test('matching results display', async ({ page }) => {
    await page.goto('/matching');
    
    // Wait for matching results to load
    await page.waitForTimeout(2000);
    
    // Check if results are displayed
    const resultCards = page.locator('.space-y-6 > div');
    await expect(resultCards.first()).toBeVisible({ timeout: 10000 });
    
    // Check if artist cards have expected elements
    await expect(page.getByText('상세 프로필 보기').first()).toBeVisible();
    await expect(page.getByText('협업 제안하기').first()).toBeVisible();
  });

  test('filters work', async ({ page }) => {
    await page.goto('/matching');
    
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // Get initial results count
    const initialCount = await page.getByText(/명의 결과/).textContent();
    
    // Apply score filter
    await page.selectOption('select', '80+');
    await page.waitForTimeout(500);
    
    // Check if filter applied
    const newCount = await page.getByText(/명의 결과/).textContent();
    expect(newCount).toBeTruthy();
    
    // Reset filter
    await page.selectOption('select', 'all');
  });

  test('refresh button works', async ({ page }) => {
    await page.goto('/matching');
    
    // Click refresh button
    await page.getByText('새로고침').click();
    
    // Check loading state
    await expect(page.getByText('AI 분석중...')).toBeVisible();
    
    // Wait for loading to complete
    await page.waitForTimeout(2000);
    
    // Loading should disappear
    await expect(page.getByText('AI 분석중...')).not.toBeVisible();
  });
});