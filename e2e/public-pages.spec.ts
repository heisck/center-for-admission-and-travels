import { expect, test } from '@playwright/test'

test('public navigation exposes the core travel journeys', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/CFAAT|CA Travels/i)
  await expect(page.getByRole('link', { name: /Study/i }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /Work/i }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /Travel/i }).first()).toBeVisible()
})

test('booking country picker contains the complete country list', async ({ page }) => {
  await page.goto('/apply')
  const countries = page.locator('#shared-country option')
  await expect(countries).toHaveCount(196)
  await expect(countries.filter({ hasText: 'Ghana' })).toHaveCount(1)
  await expect(countries.filter({ hasText: 'Vatican City' })).toHaveCount(1)
})

test('documentation page uses an image-led layout without duplicate WhatsApp prompts', async ({ page }) => {
  await page.goto('/global-network')
  await expect(page.getByRole('heading', { name: /Travel Documentation Services/i })).toBeVisible()
  await expect(page.getByRole('img', { name: /Travel documentation and professional support/i })).toHaveCount(1)
  await expect(page.getByRole('link', { name: /Contact Our Team/i })).toHaveCount(1)
  await expect(page.getByRole('link', { name: /Ask on WhatsApp|Chat on WhatsApp/i })).toHaveCount(0)
})
