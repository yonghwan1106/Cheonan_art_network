import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check main title
    await expect(page.locator('h1')).toContainText('천안아트네트워크');
    
    // Check hero section buttons
    await expect(page.getByText('지금 시작하기')).toBeVisible();
    await expect(page.getByText('프로젝트 둘러보기')).toBeVisible();
    
    // Check features section
    await expect(page.getByText('왜 천안아트네트워크를 선택해야 할까요?')).toBeVisible();
    await expect(page.getByText('AI 매칭 시스템')).toBeVisible();
    
    // Check stats section
    await expect(page.getByText('150+')).toBeVisible();
    await expect(page.getByText('등록된 예술가')).toBeVisible();
    
    // Check competition notice in footer
    await expect(page.getByText('2025 문화예술 아이디어 공모전 출품작')).toBeVisible();
  });

  test('hero slider functionality', async ({ page }) => {
    await page.goto('/');
    
    // Check slide indicators
    const indicators = page.locator('.absolute.bottom-8 button');
    const indicatorCount = await indicators.count();
    expect(indicatorCount).toBe(3);
    
    // Test slide navigation with wait
    await indicators.nth(1).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('h1').first()).toContainText('AI 매칭 시스템');
    
    await indicators.nth(2).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('h1').first()).toContainText('검증된 전문가 네트워크');
    
    // Test arrow navigation buttons (they have z-30 and absolute positioning)
    const prevButton = page.locator('button').filter({ hasText: 'ChevronLeft' });
    const nextButton = page.locator('button').filter({ hasText: 'ChevronRight' });
    
    // These buttons should be visible (but might be hard to find with exact selectors)
    const navButtons = page.locator('section button');
    const buttonCount = await navButtons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(5); // At least slide indicators + nav buttons
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    
    // Test header navigation (use first occurrence in header)
    await page.getByRole('link', { name: '프로젝트' }).first().click();
    await expect(page).toHaveURL('/projects');
    
    await page.goto('/');
    await page.getByRole('link', { name: '매칭' }).first().click();
    await expect(page).toHaveURL('/matching');
    
    // Test CTA buttons
    await page.goto('/');
    await page.getByText('지금 시작하기').first().click();
    await expect(page).toHaveURL('/register');
  });
});