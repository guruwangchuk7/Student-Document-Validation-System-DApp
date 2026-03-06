Security Improvement Report

Repository: Student-Document-Validation-System-DApp
Date: 2025-10-09

Overview
--------
This document summarizes security findings from a repository scan and provides prioritized remediation steps, concrete file-level guidance, and recommended next steps. The goal is to reduce the risk of secrets exposure, strengthen authentication and upload handling, and add automated checks.

Key findings
------------
- Secrets & defaults in code/config
  - `packages/nextjs/scaffold.config.ts` includes a published DEFAULT_ALCHEMY_API_KEY and a default WalletConnect project ID. These are not private in themselves but should be replaced for production.

- Exposed secrets / environment usage
  - `packages/nextjs/pages/api/student-signup.ts` and `student-login.ts` use hard-coded DB credentials (password "9099") in source. This is a high-risk issue.
  - `packages/nextjs/pages/api/issue-certificate.ts` and other API routes use environment variables for Pinata and DB credentials (good), but ensure `.env` files aren't committed.

- Hardcoded test credentials
  - The hard-coded password in `student-signup.ts` and `student-login.ts` must be removed.

- Logging of sensitive info
  - `packages/nextjs/pages/api/admin-login/index.ts` logs DB rows. Remove or redact these logs.
  - `packages/nextjs/pages/api/issue-certificate.ts` logs file metadata and full parsed objects; sensitive metadata should not be logged in production.

- Front-end public keys
  - `packages/nextjs/scaffold.config.ts` sets `alchemyApiKey` from `NEXT_PUBLIC_ALCHEMY_API_KEY` or a default. Only non-sensitive keys should be prefixed with `NEXT_PUBLIC_` as those are exposed to the browser.

- Authentication & password handling
  - Passwords are hashed with bcrypt (good). Application lacks explicit session/token handling and rate limiting.

- File uploads & IPFS
  - `issue-certificate.ts` uses formidable and Pinata; ensure files are sanitized, size-limited, and temporary files cleaned. Pinata keys are sensitive and must remain server-side and in a secure vault.

- Hardhat / deployment
  - Hardhat configuration expects `DEPLOYER_PRIVATE_KEY_ENCRYPTED`. Never commit private keys; use secure vaults and encrypted keystore files.

Prioritized remediation (High -> Low)
------------------------------------
1) Remove hard-coded credentials from source (HIGH)
   - Files: `packages/nextjs/pages/api/student-signup.ts`, `packages/nextjs/pages/api/student-login.ts`
   - Replace hard-coded `dbConfig` with environment variables. Add runtime guards for missing env vars. Rotate credentials if they were used in a real DB.

2) Prevent secret leaks and scrub history if necessary (HIGH)
   - If secrets were committed, remove them from history (BFG/git filter-repo) and rotate secrets. Add secret scanning in CI.

3) Remove or redact sensitive logging (HIGH -> MEDIUM)
   - Remove `console.log` that output DB rows, request bodies, or PII.

4) Front-end public env var hygiene (MEDIUM)
   - Verify only non-sensitive keys are in `NEXT_PUBLIC_` vars. Remove any secret naming that exposes secrets to client bundles.

5) Harden auth & session management (MEDIUM)
   - Implement secure sessions or JWT with short expiration, use HttpOnly and Secure cookies, add rate limiting and account lockouts.

6) File upload & validation (MEDIUM)
   - Enforce file size, types, remove temp files, consider virus scanning, and avoid logging file contents/metadata.

7) Pinata key security (MEDIUM)
   - Use scoped/limited Pinata keys; store secrets in cloud secret managers and rotate keys if exposed.

8) Dependency & supply-chain security (MEDIUM)
   - Run `yarn audit` or `npm audit`, set up Dependabot/ Renovate, and add CI checks for high severity vulnerabilities.

9) Hardhat private key handling (HIGH)
   - Use encrypted keystore files or hardware signing for production deploys. Never put private keys in repo.

10) Add automated secret scanning & CI checks (LOW -> MEDIUM)
    - Add GitHub Actions for gitleaks/detect-secrets, `yarn audit`, ESLint.

Concrete remediation examples
----------------------------
1) Replace hard-coded DB config (example)
   - Before:
     const dbConfig = {
       host: "localhost",
       user: "root",
       password: "9099",
       database: "student_certificates_db",
     };

   - After:
     const dbConfig = {
       host: process.env.MYSQL_HOST || "localhost",
       user: process.env.MYSQL_USER || "root",
       password: process.env.MYSQL_PASSWORD,
       database: process.env.MYSQL_DATABASE || "student_certificates_db",
     };

   - Add guard: if (!process.env.MYSQL_PASSWORD) throw new Error("Missing MYSQL_PASSWORD env var");

2) Remove sensitive logs
   - Remove `console.log("Rows fetched:", rows);` and large object logs. Replace with safe debug logs or remove entirely.

3) Add secret scanning and dependency checks to CI
   - Add GitHub workflow to run `yarn install --frozen-lockfile`, `yarn audit --level=high`, and `gitleaks` on PRs. (Example workflow can be provided.)

4) File uploads
   - Enforce max sizes and validate mime types. Remove temp file after processing. Consider virus scanning on uploaded files.

Quick checklist (immediate)
---------------------------
- [ ] Remove hard-coded DB credentials and add env guards.
- [ ] Check for committed `.env` files and remove from repo; rotate credentials.
- [ ] Remove sensitive `console.log` statements.
- [ ] Add secret scanning (gitleaks/detect-secrets) to CI or pre-commit hook.
- [ ] Run dependency audit and add to CI.
- [ ] Store Pinata and deployer keys in secret manager; restrict permissions.

Recommended next steps I can implement for you
----------------------------------------------
- Replace hard-coded DB credentials in the two API files and add runtime env guards.
- Add a GitHub Action workflow `security.yml` that runs `yarn audit`, ESLint, and a secret scanner (gitleaks) on pull requests.
- Add a `scripts/setup-env.ps1` helper to copy `.env.example` to `.env` and prompt for values (mentioned in SETUP.md).

Notes & caveats
---------------
- If secrets were ever committed, scrubbing them will require git history rewrite and rotating the secrets. This is destructive for branches and PR history; coordinate with your team.
- Some front-end public keys (like read-only Alchemy RPC keys) are okay to be public, but don't use secret keys in `NEXT_PUBLIC_` variables.

Completion status
-----------------
- Repo scan: Completed
- Security improvement document: Created (this file)
- CI/automation: Not implemented (available as follow-up)

If you want, I can now:
- Apply the code edits to remove hard-coded credentials and add guards (I will update the files directly), and/or
- Add the GitHub Actions `security.yml` workflow and optional pre-commit hooks.

Which of the follow-ups should I do next?  

