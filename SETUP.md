## Student Document Validation DApp — Setup Guide

This guide explains how to get the repository running on a Windows development machine (PowerShell). It covers prerequisites, installing dependencies (Yarn v3 workspaces), environment variables, common scripts (frontend / hardhat), and troubleshooting tips.

### Requirements

- Node.js: the repo requires Node >= 20.18.3 (see `package.json`). Use a Node 20.x install; we recommend exactly 20.18.3 for parity with CI/development.
- Yarn (Berry) v3.2.3: this repository uses Yarn Plug'n'Play / Berry. We'll enable via Corepack.
- Git
- PowerShell (Windows) — commands below use PowerShell syntax.

Optional useful tools:
- VS Code (with TypeScript, ESLint, Prettier extensions)
- Docker (only if you want to run services in containers)

### Quick setup (copy-paste)

Open PowerShell and run the commands below from a location where you keep projects.

```powershell
# Clone the repo (if you haven't)
git clone https://github.com/guruwangchuk7/Student-Document-Validation-System-DApp.git
cd "Student-Document-Validation-System-DApp"

# Enable corepack and activate the exact Yarn version used by this repo
corepack enable
corepack prepare yarn@3.2.3 --activate

# Install dependencies (Yarn workspaces will install for all packages)
yarn install
```

Notes:
- The repository declares `packageManager: "yarn@3.2.3"` and `engines.node: ">=20.18.3"` in the root `package.json` — aim to match these to avoid tool/version mismatches.

### Environment variables

Hardhat package provides an example env file at `packages/hardhat/.env.example`.

Create a copy and fill in the values required for your environment:

```powershell
cd packages/hardhat
copy .env.example .env
# Then edit .env with your values (use an editor or PowerShell):
notepad .env
```

Minimum vars in `.env` (from `.env.example`):

- ALCHEMY_API_KEY=  # optional (defaults exist in config for local dev)
- ETHERSCAN_V2_API_KEY=  # optional for verification
- DEPLOYER_PRIVATE_KEY_ENCRYPTED=  # used by some deploy scripts (the repo includes scripts to generate/import accounts)

Important: the project provides safe defaults in `hardhat.config.ts` to let you prototype locally, but for real networks use your own API keys and private keys.

### Common commands

Run these from the repo root (they delegate to workspace scripts):

- Start the frontend in development (Next.js):

```powershell
yarn start
# (alias for: yarn workspace @se-2/nextjs dev)
```

- Build frontend for production:

```powershell
yarn next:build
```

- Run Hardhat local node (development chain):

```powershell
yarn chain
# (alias for: yarn workspace @se-2/hardhat chain)
```

- Compile contracts:

```powershell
yarn compile
# (alias for: yarn workspace @se-2/hardhat compile)
```

- Deploy contracts (uses workspace script that can read .env deployer key):

```powershell
yarn deploy
# (alias for: yarn workspace @se-2/hardhat deploy)
```

- Run tests (Hardhat):

```powershell
yarn test
# (alias for: yarn hardhat:test -> yarn workspace @se-2/hardhat test)
```

- Lint & format

```powershell
yarn lint
yarn format
```

You can also run workspace scripts directly under `packages/hardhat` and `packages/nextjs` using `yarn workspace <name> <script>`.

### Husky & Git hooks

The repo uses Husky. After `yarn install`, the `postinstall` hook runs `husky install`. If hooks do not appear to be installed, run:

```powershell
yarn husky install
```

### Local development flow (recommended)

1. Start Hardhat node (in a separate terminal):

```powershell
cd "D:\My Files\Projects\student-dapp"
yarn chain
```

2. In a second terminal, compile and deploy to the local chain (if needed):

```powershell
yarn compile
yarn deploy
```

3. In a third terminal, start the Next.js app:

```powershell
yarn start
# open http://localhost:3000
```

### Tips & Troubleshooting

- Node engine mismatch: if `yarn` errors about Node version, install the exact Node 20.x version (nvm-windows is helpful).
- Yarn errors: ensure Corepack is enabled and you activated yarn@3.2.3 with `corepack prepare yarn@3.2.3 --activate`.
- Windows path & long path issues: enable long paths in Windows or use a shorter project path. Some native modules may fail to build if the path is too long.
- If `husky` hooks don't run after `yarn install`, re-run `yarn husky install`.
- If contract compilation or type generation fails, make sure you ran `yarn install` from the repo root so workspace dependencies are linked.

### Where to look next

- Frontend code: `packages/nextjs`
- Smart contracts & Hardhat: `packages/hardhat`
- Scripts: `packages/hardhat/scripts` (account generation, deploy helpers)

### Verification checklist (smoke test)

From repo root after following setup steps, verify the following quick checks succeed:

```powershell
yarn install
yarn compile
yarn start # open http://localhost:3000 and check homepage loads
yarn test
```

If everything runs, your environment is ready for development.

---

If you'd like, I can also add a `scripts/setup-env.ps1` helper that copies `.env.example` files into package folders and prompts for values — tell me if you want that and which fields you'd like prompted.
