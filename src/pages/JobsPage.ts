import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '../utils/logger';

export class JobsPage {
    readonly page: Page;
    readonly searchInput: Locator;
    readonly altSearchInput: Locator;
    readonly allFiltersBtn: Locator;
    readonly easyApplyToggle: Locator;
    readonly showResultsBtn: Locator;
    readonly easyApplyQuickBtn: Locator;
    readonly jobCards: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchInput = page.getByPlaceholder('Title, skill or Company')
        this.altSearchInput = page.locator('input[componentkey="jobSearchBox"]');
        this.allFiltersBtn = page.getByRole('button', { name: /All filters/i });
        this.easyApplyToggle = page.getByText('Easy Apply', { exact: true });
        this.showResultsBtn = page.getByRole('button', { name: /Show results/i });
        this.easyApplyQuickBtn = page.getByRole('button', { name: /Easy Apply/i }).first();
        this.jobCards = page.locator('.job-search-card, .job-card-container');
    }

    async navigate() {
        try {
            await this.page.goto('https://www.linkedin.com/jobs', { waitUntil: 'domcontentloaded' });
            Logger.info('Navigated to LinkedIn Jobs page.');
        } catch (e) {
            Logger.error('Failed to navigate to jobs page or page timed out.', e);
            throw e;
        }
    }

    async searchForJob(jobTitle: string) {
        try {
            await this.searchInput.first().fill(jobTitle);
            await this.page.keyboard.press('Enter');
            await this.page.waitForLoadState('networkidle');
            Logger.info(`Searched for job: ${jobTitle}`);
        } catch (e) {
            Logger.error(`Error during job search for ${jobTitle}`, e);
            throw e;
        }
    }

    async filterByEasyApply() {
        try {
            if (await this.allFiltersBtn.isVisible()) {
                await this.allFiltersBtn.click();
                if (await this.easyApplyToggle.isVisible()) {
                    await this.easyApplyToggle.click();
                    await this.showResultsBtn.click();
                    Logger.info('Filtered by Easy Apply via All Filters.');
                    return;
                }
            }
            if (await this.easyApplyQuickBtn.isVisible()) {
                await this.easyApplyQuickBtn.click();
                Logger.info('Filtered by Easy Apply via Quick Button.');
            }
        } catch (e) {
            Logger.error('Unexpected behavior during filtering', e);
            throw e;
        }
    }

    async clickFirstJobCard() {
        try {
            await expect(this.jobCards.first()).toBeVisible({ timeout: 30000 });
            await this.jobCards.first().click();
            Logger.info('Clicked on the first available job card.');
        } catch (e) {
            Logger.error('Failed to click on job card', e);
            throw e;
        }
    }
}
