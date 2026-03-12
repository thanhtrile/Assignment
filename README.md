# LinkedIn Easy Apply Automation

This project automates the testing of the LinkedIn "Easy Apply" flow using Playwright (TypeScript). 
It follows the Page Object Model (POM) design pattern for maintainability and scalability.

## Architecture

- **`pages/`**: Contains Page Object Models (`JobsPage`, `JobApplicationModal`) abstracting structural details.
- **`utils/`**: Utility scripts like `logger.ts` for standardized logging.
- **`tests/`**: Contains the test specifications leveraging pages.
- **`playwright.config.ts`**: Playwright configurations, including Mobile Emulation and environments.

## Multi-User Session Handling

To support multi-user workflows without hitting logins continuously (which invokes CAPTCHAs), we employ Playwright's state management:
1. **Global Setup** (`tests/setup/global.setup.ts`): We simulate a global setup script that logs in multiple users once.
2. **State Storage**: Cookies and localStorage for each user are exported (e.g., to `playwright/.auth/user1.json`).
3. **Session Reuse**: The test files utilize `test.use({ storageState: ... })` to seamlessly adopt active sessions per user iteration.

### Workarounds for Login Persistence
LinkedIn frequently cycles sessions or enforces challenges:
- Ensure testing happens via an API token if possible.
- If UI login is enforced, rotate credentials and use Proxies to maintain stable geolocation profiles.

## CI/CD Pipeline Integration

This test suite is designed for seamless integration into a CI/CD pipeline (e.g., GitHub Actions, GitLab CI/CD, Jenkins):

### Example GitHub Actions Flow:
1. **Trigger**: On pull requests to `main`.
2. **Setup**: Use a Playwright Docker image or install dependencies via `npm ci`.
3. **Install Browsers**: Run `npx playwright install --with-deps`.
4. **Execution**: Run the test script `npm test`.
5. **Artifacts**: Upload trace files (`playwright-report/`) on failure to debug easily via Playwright Trace Viewer.

## Maintenance Strategy

- **Selector Fragility**: We use ARIA roles and text-based selectors where possible (`getByRole`, `getByText`) as they withstand DOM mutations better than raw CSS/XPath.
- **Wait Mechanisms**: No hardcoded `page.waitForTimeout()`. Rely strictly on explicit auto-waiting assertions (`toBeVisible`, `waitForLoadState('networkidle')`).
- **Regular Executions**: Schedule daily cron jobs to identify visual or functional regressions introduced by LinkedIn A/B tests.
