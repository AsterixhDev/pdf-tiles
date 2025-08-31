import { test, expect } from '@playwright/test'

test.describe('PDF Tiles App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows empty state initially', async ({ page }) => {
    await expect(page.getByText(/No PDF files uploaded yet/i)).toBeVisible()
  })

  test('opens upload dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Add PDF/i }).click()
    await page.getByRole('menuitem', { name: /Upload File/i }).click()
    await expect(page.getByText(/Drop a PDF file here/i)).toBeVisible()
  })

  test('opens manual add dialog', async ({ page }) => {
    await page.getByRole('button', { name: /Add PDF/i }).click()
    await page.getByRole('menuitem', { name: /Add by URL/i }).click()
    await expect(page.getByText(/Add PDF by URL/i)).toBeVisible()
  })

  test('validates manual add form', async ({ page }) => {
    await page.getByRole('button', { name: /Add PDF/i }).click()
    await page.getByRole('menuitem', { name: /Add by URL/i }).click()
    await page.getByRole('button', { name: /Add PDF$/i }).click()
    await expect(page.getByText(/Name is required/i)).toBeVisible()
    await expect(page.getByText(/URL is required/i)).toBeVisible()
  })
})
