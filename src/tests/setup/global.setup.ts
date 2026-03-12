import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Define paths for storage state for multiple users
const authFileUser1 = path.join(__dirname, '../../../playwright/.auth/user1.json');
const authFileUser2 = path.join(__dirname, '../../../playwright/.auth/user2.json');

setup('Authenticate Multi-Users', async ({ page }) => {
  // Check and login each user independently.
  // If auth file already exists for a user, skip login for that user.

  // ===== User 1 =====
  if (fs.existsSync(authFileUser1)) {
    console.log('Auth file exists for User 1. Skipping login.');
  } else {
    console.log('Auth file not found for User 1. Logging in...');

    await page.goto('https://www.linkedin.com/login');
    await page.fill('#username', process.env.USER1_EMAIL || 'user1@example.com');
    await page.fill('#password', process.env.USER1_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    // await expect(page.locator('text=Messaging')).toBeVisible({ timeout: 15000 });

    // Save storage state for reuse in test projects
    await page.context().storageState({ path: authFileUser1 });
    console.log('User 1 login successful. Auth state saved.');
  }

  // ===== User 2 =====
  if (fs.existsSync(authFileUser2)) {
    console.log('Auth file exists for User 2. Skipping login.');
  } else {
    console.log('Auth file not found for User 2. Logging in...');

    // Create a new browser context for User 2 to avoid session conflicts
    const context2 = await page.context().browser()?.newContext();
    if (context2) {
      const page2 = await context2.newPage();
      await page2.goto('https://www.linkedin.com/login');
      await page2.fill('#username', process.env.USER2_EMAIL || 'user2@example.com');
      await page2.fill('#password', process.env.USER2_PASSWORD || 'password123');
      await page2.click('button[type="submit"]');
      // await expect(page2.locator('text=Messaging')).toBeVisible({ timeout: 15000 });

      await context2.storageState({ path: authFileUser2 });
      console.log('User 2 login successful. Auth state saved.');
      await context2.close();
    }
  }
});
