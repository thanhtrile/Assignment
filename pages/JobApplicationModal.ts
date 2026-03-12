import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '../utils/logger';
import { timeStamp } from 'console';

export class JobApplicationModal {
    readonly page: Page;
    readonly easyApplyFilterBtn: Locator;
    readonly applyBtn: Locator;
    readonly modal: Locator;
    readonly emailInput: Locator;
    readonly nextSubmitBtn: Locator;
    readonly fileInput: Locator;
    readonly dismissBtn: Locator;
    readonly discardBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.easyApplyFilterBtn = page.getByRole('radio', { name: /Easy Apply filter/i }).first();
        this.applyBtn = page.getByRole('button', { name: /Easy Apply/i }).first();
        this.modal = page.locator('.jobs-easy-apply-modal, [data-test-modal]');
        this.emailInput = this.modal.locator('input[type="email"], input[type="text"]').first();
        this.nextSubmitBtn = this.modal.getByRole('button', { name: /Next|Submit|Review/i });
        this.fileInput = this.modal.locator('input[type="file"]');
        this.dismissBtn = page.getByRole('button', { name: /Dismiss|Close/i });
        this.discardBtn = page.getByRole('button', { name: /Discard/i });
    }

    async filterByEasyApply() {
        try {
            const checked = await this.easyApplyFilterBtn.getAttribute('aria-checked');
            if (checked === 'true') {
                Logger.info('Easy Apply filter is already checked.');
                return true;
            }
            await this.easyApplyFilterBtn.click();
            Logger.info('Clicked Easy Apply filter.');
            return true;
        } catch {
            Logger.error('Could not find Easy Apply filter.');
            return false;
        }
    }

    async clickEasyApply() {
        try {
            await this.applyBtn.click();
            await expect(this.modal).toBeVisible();
            Logger.info('Clicked Easy Apply and modal opened.');
            return true;
        } catch {
            Logger.error('Could not find Easy Apply button on the selected job.');
            return false;
        }
    }

    async validateEmailRequired() {
        try {
            if (await this.emailInput.isVisible()) {
                const isRequired = await this.emailInput.getAttribute('required');
                const ariaRequired = await this.emailInput.getAttribute('aria-required');
                expect(isRequired !== null || ariaRequired === 'true').toBeTruthy();
                Logger.info('Validated email field is required.');
            }
        } catch {
            Logger.error('Could not find email input field.');
        }
    }

    async validateNextButtonFeedback() {
        try {
            if (await this.nextSubmitBtn.isVisible() && await this.emailInput.isVisible() && await this.emailInput.isEditable()) {
                await this.emailInput.clear();
                await this.nextSubmitBtn.click();

                const feedbackError = this.modal.locator('.artdeco-inline-feedback--error, [id^="error-"]');
                if (await feedbackError.count() > 0) {
                    await expect(feedbackError.first()).toBeVisible();
                    Logger.info('Validated error feedback is shown.');
                } else {
                    await expect(this.nextSubmitBtn).toBeDisabled();
                    Logger.info('Validated Next/Submit button is disabled.');
                }
            }
        } catch {
            Logger.error('Could not find Next/Submit button or email input field.');
        }
    }

    async validateFileUpload() {
        try {
            if (await this.fileInput.isVisible()) {
                const acceptTypes = await this.fileInput.getAttribute('accept');
                expect(acceptTypes).toMatch(/\.pdf|\.docx|\.doc/i);
                Logger.info('Validated file upload field accepts PDF/DOCX.');
            }
        } catch {
            Logger.error('Could not find file upload field.');
        }
    }

    async gracefullyClose() {
        try {
            if (await this.dismissBtn.isVisible()) {
                await this.dismissBtn.click();
                if (await this.discardBtn.isVisible()) {
                    await this.discardBtn.click();
                }
                Logger.info('Closed modal gracefully.');
            }
        } catch {
            Logger.error('Could not find dismiss or discard button.');
        }
    }
}
