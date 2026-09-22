import { expect, test } from '@playwright/test'

test.describe('authenticated admin workspace', () => {
  test.skip(!process.env.RUN_ADMIN_E2E, 'Set RUN_ADMIN_E2E=1 against the seeded development stack.')

  test('logs in and switches between the authoritative preview and editor', async ({ page }) => {
    await page.goto('/admin-login')
    await page.getByLabel(/email|username/i).fill(process.env.DEV_ADMIN_EMAIL || 'admin@localhost.test')
    await page.getByLabel(/password/i).fill(process.env.DEV_ADMIN_PASSWORD || 'ChangeMe123!')
    await page.getByRole('button', { name: /sign in|login/i }).click()

    await expect(page).toHaveURL(/\/admin(?:\/|$)/)
    await expect(page.getByRole('button', { name: /Live page/i })).toBeVisible()
    await expect(page.locator('iframe[title^="Live preview"]')).toBeVisible()

    await page.getByRole('button', { name: /Edit content/i }).click()
    await expect(page.getByTitle('Save all changes to database')).toBeVisible()
    await expect(page.locator('iframe[title^="Live preview"]')).toHaveCount(0)
  })
})
