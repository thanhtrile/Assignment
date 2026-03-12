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

This test suite is designed for seamless integration into any CI/CD pipeline:

### Pipeline Stages
1. **Trigger**: Run tests automatically on every pull request/merge request targeting the main branch to catch regressions early.
2. **Environment Setup**: Install project dependencies (`npm ci`) and Playwright browsers (`npx playwright install --with-deps`) in a clean CI environment.
3. **Credential Management**: Store user credentials (`USER1_EMAIL`, `USER1_PASSWORD`, `USER2_EMAIL`, `USER2_PASSWORD`) as **encrypted secrets/variables** in the CI/CD platform — never commit `.env` to the repository.
4. **Test Execution**: Run the full test suite (`npm test`). The `global.setup.ts` handles per-user authentication automatically — logging in only when auth state files are missing.
5. **Auth State Caching**: Optionally cache the `playwright/.auth/` directory between pipeline runs (with a short TTL of a few hours) to reduce login frequency and avoid triggering LinkedIn's anti-bot protections.
6. **Artifact Collection**: Upload test reports (`playwright-report/`), screenshots, videos, and trace files on failure for easy debugging via Playwright Trace Viewer.
7. **Scheduled Runs**: In addition to PR-triggered runs, schedule nightly/daily regression runs to detect UI changes or breakages caused by LinkedIn A/B testing or DOM updates.
8. **Notifications**: Configure pipeline notifications (email, Slack, Teams) on test failures to alert the team promptly.

## Maintenance Strategy

- **Page Object Model (POM)**: All page interactions are abstracted into page objects (`JobsPage`, `JobApplicationModal`). When LinkedIn changes its UI, only the affected page object needs updating — test logic remains untouched.
- **Resilient Selectors**: We use ARIA roles and text-based selectors where possible (`getByRole`, `getByText`, `getByPlaceholder`) as they withstand DOM mutations better than raw CSS/XPath.
- **Smart Wait Mechanisms**: No hardcoded `page.waitForTimeout()`. Rely strictly on Playwright's auto-waiting assertions (`toBeVisible`, `waitForLoadState`) to handle dynamic content loading.
- **Auto-Retry on Failure**: Configure `retries` in `playwright.config.ts` (enabled on CI) to handle transient network or timing issues without manual intervention.
- **Multi-User Scalability**: Adding a new user requires only 3 steps: add credentials to CI secrets, add auth path in `global.setup.ts`, and add the user to the `users` array in the test spec.
- **Regular Scheduled Runs**: Daily cron jobs detect visual or functional regressions introduced by LinkedIn A/B tests or platform updates before they impact the team.
- **Logging & Reporting**: Standardized logging via `Logger` utility provides clear, timestamped output for debugging. Playwright HTML reports offer detailed step-by-step traces for failed tests.
