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
