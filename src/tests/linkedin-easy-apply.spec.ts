import { test } from '@playwright/test';
import { JobsPage } from '../pages/JobsPage';
import { JobApplicationModal } from '../pages/JobApplicationModal';
import { Logger } from '../utils/logger';

// We simulate testing with multi-user sessions
const users = ['user1', 'user2'];

for (const user of users) {
    test.describe(`LinkedIn Easy Apply Flow - User: ${user}`, () => {

        // Use the saved session from global setup for the current user
        test.use({ storageState: `playwright/.auth/${user}.json` });

        test('Locate "Easy Apply" job and validate application form requirements', async ({ page }) => {
            const jobsPage = new JobsPage(page);
            const applicationModal = new JobApplicationModal(page);

            try {
                // 1. Navigation
                await jobsPage.navigate();

                // 2. Search & Filter
                await jobsPage.searchForJob('QA Engineer');
                await jobsPage.filterByEasyApply();

                // 3. Select Job
                await jobsPage.clickFirstJobCard();

                // 4. Filter by Easy Apply
                await applicationModal.filterByEasyApply();

                // 5. Open Application Modal
                const isOpen = await applicationModal.clickEasyApply();
                if (!isOpen) return;

                // 6. Validations
                await applicationModal.validateEmailRequired();
                await applicationModal.validateNextButtonFeedback();
                await applicationModal.validateFileUpload();

                // 7. Graceful Exit
                await applicationModal.gracefullyClose();

            } catch (e) {
                Logger.error(`Test failed for ${user}`, e);
                throw e;
            }
        });

    });
}
