import { test, expect } from '@playwright/test'

/** Navigate landing → intentions → session → immersive (audio + p5). */
async function goToImmersive(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/')
  await page.getByRole('button', { name: /begin a session/i }).click()
  await page.locator('.intention-card').first().click()
  await expect(page.locator('#session-play')).toBeVisible({ timeout: 10_000 })
  await page.locator('#session-play').click()
  await expect(page.locator('#immersive-root')).toBeVisible({ timeout: 20_000 })
}

test.describe('Bug-finding plan smoke', () => {
  test('immersive mandala canvas exists with non-zero size after session start', async ({
    page,
  }) => {
    await goToImmersive(page)
    const canvas = page.locator('#immersive-canvas canvas.p5Canvas')
    await expect(canvas).toBeVisible({ timeout: 20_000 })
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThan(0)
    expect(box!.height).toBeGreaterThan(0)
  })

  test('immersive shell and ephemeris panel node present', async ({ page }) => {
    await goToImmersive(page)
    await expect(page.locator('#immersive-root')).toBeVisible()
    await expect(page.locator('#immersive-planet-panel')).toBeAttached()
  })

  test('play then stop returns to session card', async ({ page }) => {
    await goToImmersive(page)
    await page.locator('#immersive-stop').click()
    await expect(page.locator('#session-play')).toBeVisible({ timeout: 15_000 })
  })
})
