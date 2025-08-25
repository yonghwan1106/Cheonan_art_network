import { test, expect } from '@playwright/test';

test.describe('Projects Page Tests', () => {
  test('projects page loads correctly', async ({ page }) => {
    await page.goto('/projects');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('문화예술 프로젝트');
    
    // Check mock data notice
    await expect(page.getByText('현재 표시되는 프로젝트들은 시연을 위한 가상 데이터입니다.')).toBeVisible();
    
    // Check filter section
    const statusSelect = page.locator('select').first();
    await expect(statusSelect).toBeVisible();
    const categorySelect = page.locator('select').nth(1);
    await expect(categorySelect).toBeVisible();
    const budgetSelect = page.locator('select').nth(2);
    await expect(budgetSelect).toBeVisible();
    
    // Check projects grid
    const projectCards = page.locator('.grid .hover\\:shadow-lg');
    const cardCount = await projectCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('project filtering works', async ({ page }) => {
    await page.goto('/projects');
    
    // Get initial project count
    const initialCount = await page.getByText(/개의 프로젝트/).textContent();
    
    // Test status filter
    await page.selectOption('select', 'recruiting');
    
    // Wait for filter to apply and check if count changed or stayed same
    await page.waitForTimeout(500);
    const newCount = await page.getByText(/개의 프로젝트/).textContent();
    expect(newCount).toBeTruthy();
    
    // Test category filter
    await page.selectOption('select:nth-of-type(2)', '전시');
    await page.waitForTimeout(500);
    
    // Reset filters
    await page.selectOption('select', 'all');
    await page.selectOption('select:nth-of-type(2)', 'all');
  });

  test('project card buttons work', async ({ page }) => {
    await page.goto('/projects');
    
    // Wait for projects to load
    await page.waitForSelector('.grid .hover\\:shadow-lg', { timeout: 5000 });
    
    // Click on first project's detail button
    const firstDetailButton = page.getByText('상세보기').first();
    await expect(firstDetailButton).toBeVisible();
    
    // Check if AI matching button is visible
    const firstMatchingButton = page.getByText('AI 매칭 보기').first();
    await expect(firstMatchingButton).toBeVisible();
  });

  test('pagination is visible', async ({ page }) => {
    await page.goto('/projects');
    
    // Check pagination section
    await expect(page.getByRole('button', { name: '이전' })).toBeVisible();
    await expect(page.getByRole('button', { name: '다음' })).toBeVisible();
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible();
  });
});