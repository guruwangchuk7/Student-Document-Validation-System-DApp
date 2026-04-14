
# Codebase Audit and System Architecture Report

I have completed a comprehensive scan of your codebase. Below is the detailed analysis of the **Student Certificate Validation System** (BlockCertify), reflecting its current implementation, logic flow, and architectural strengths/weaknesses.

---

## 1. Project Overview
- **What it does**: A hybrid Web 2.5 application designed to issue, store, and verify student educational certificates. It uses a database for metadata and a blockchain (Ethereum/Hardhat) as a "Trust Layer" to store immutable SHA256 hashes of the certificates.
- **Main modules**:
    - **University/Admin Portal**: Issuing certificates (Uploading file → IPFS → Blockchain anchoring → DB save).
    - **Student Portal**: Viewing personal certificates and downloading them from IPFS.
    - **Verifier Portal**: Public-facing tool to verify a PDF's authenticity by re-hashing it and checking both the DB and Blockchain.
- **Main Tech Stack**:
    - **Frontend**: Next.js 15 (App Router), Tailwind CSS, daisyUI.
    - **Backend**: Next.js API Routes (Pages Router), `mysql2` (direct connection).
    - **Blockchain**: Solidity (Smart Contracts), Hardhat, Viem (Client/Server interaction).
    - **Storage**: IPFS (via Pinata SDK).
    - **Database**: MySQL.

---

## 2. Folder and File Structure
- **`/packages/nextjs`**: The core application.
    - **/app**: Contains the main UI pages (Student, University, Verifier).
    - **/pages/api**: Holds all backend server-side logic (Database interactions, Blockchain writes).
    - **/contracts**: Auto-generated/deployed contract ABIs and addresses.
    - **/services**: Mostly Scaffold-ETH default services (Web3/Zustand).
- **`/packages/hardhat`**: The smart contract development environment.
    - **/contracts**: Contains `CertificateRegistry.sol`.
- **`/database.mysql`**: SQL dump files for setting up the local database.
- **Entry Points**: 
    - `packages/nextjs/app/page.tsx` (Home Page)
    - `packages/hardhat/contracts/CertificateRegistry.sol` (Blockchain Entry)

---

## 3. Frontend Architecture
- **Organization**: Uses the Next.js **App Router**. Components are organized by feature area (`/student`, `/university`, `/verifier`).
- **State Management**: Uses basic React `useState` for local UI state and **Zustand** (via Scaffold-ETH defaults) for global web3 state.
- **Logic Triggering**:
    - UI forms (e.g., `UniversityAdmin`) trigger `fetch()` or `axios` calls to the `/api` routes.
    - Does **not** use Next.js Server Actions; relies on traditional REST API endpoints.
- **Key Components**:
    - `CertificateCard`: Reusable UI for displaying certificate metadata and IPFS links.
    - `AddressInput`: Standard Scaffold-ETH component for wallet addresses.

---

## 4. Backend Architecture
- **Organization**: Logic is consolidated within `packages/nextjs/pages/api`.
- **Design Pattern**: It follows a "BFF" (Backend for Frontend) pattern where the Next.js server handles secrets (like `ISSUER_PRIVATE_KEY` and `PINATA_API_KEY`) so the frontend doesn't expose them.
- **Business Logic Flow**:
    1. Receive request (with file/data).
    2. Process file (calculate hash, upload to IPFS).
    3. Interact with Blockchain (Anchor hash).
    4. Save to MySQL.
    5. Return result.

---

## 5. Database Architecture
- **Type**: MySQL.
- **Tables**:
    - `students`: Stores credentials (hashed passwords), student identifiers (Aadhaar/CID), and names.
    - `certificates`: Stores metadata (degree name, university), the **IPFS CID**, and the **SHA256 hash**.
    - `admins`: Stores university administrator credentials.
- **Data Flow**: Handled via `mysql2/promise`. Connections are opened and closed within each API call (`conn.execute`).
- **Relationships**: `certificates.student_identifier` acts as a foreign key linking certificates to specific students.

---

## 6. Authentication and Authorization
- **Sign In**: Custom implementation using `bcrypt`. No JWT or session cookies are currently used. 
- **Session**: **Stateless**. The frontend tracks "logged in" status in React state.
- **Roles**:
    - **Students**: Can view their own data based on `student_identifier`.
    - **Admins/University**: Privileged access to the `issue-certificate` logic.
- **Security Check Location**: Very sparse. Most checks are currently just "is the input present?" rather than "is this user authorized?".

---

## 7. Full Logic Flow (Example: Issuing a Certificate)
1. **UI**: Admin fills form in `/university`, uploads a PDF, and clicks "Issue".
2. **Frontend**: Sends a `POST` (Multipart Form) to `/api/issue-certificate`.
3. **Backend API**:
    - **Hashing**: Computes `crypto.createHash("sha256")` of the PDF.
    - **IPFS**: Calls `pinata.pinFileToIPFS`.
    - **Blockchain**: Uses `walletClient.writeContract` with a server-side private key to call `registerCertificate(hash)`.
    - **Database**: `INSERT INTO certificates (...)`.
4. **Response**: Returns IPFS CID and Transaction Hash to UI.
5. **UI**: Shows success toast and resets form.

---

## 8. Data Flow Map
`Page UI` → `handleFormSubmit` → `Axios/Fetch (POST /api/...)` → `API Route (Backend)` → `Pinata SDK` / `Viem (Blockchain)` / `MySQL Driver` → `Response (JSON)` → `Update React State` → `UI Render`.

---

## 9. Key Functions and Their Purpose
- **`CertificateRegistry.registerCertificate(bytes32 _hash)`**: (Solidity) The anchor function. Stores the hash on the blockchain forever.
- **`issue-certificate.ts:handler`**: The "orchestrator". Coordinates File hashing, IPFS upload, Blockchain writing, and Database storage.
- **`verify-certificate.ts:handler`**: The "validator". Re-hashes an uploaded file and compares it against both the DB and the Blockchain state.
- **`bcrypt.compare()`**: Used in login files to safely check passwords.

---

## 10. Problems Found (Audit Results)
- **CRITICAL: Unprotected API Routes**: The `/api/issue-certificate` endpoint does not verify if the request is coming from a logged-in admin. Anyone with the URL can trigger a blockchain issuance using the server's private key.
- **CRITICAL: Missing Smart Contract Access Control**: The `registerCertificate` function in `CertificateRegistry.sol` is `public`. Anyone can call it directly on the blockchain, potentially polluting the registry.
- **MAJOR: Stateless Authentication**: Because there are no session cookies or JWTs, the user is "logged out" Every time they refresh the page.
- **PERFORMANCE: DB Connection Leak/Overhead**: `mysql.createConnection` is called inside every API handler. Under load, this will exhaust MySQL connection limits. Use a **Pool** instead.
- **SECURITY: Environment Fallbacks**: Several files have hardcoded database passwords or private keys as fallbacks.
- **DUPLICATION**: Database configuration and hashing logic are repeated across multiple API files instead of being in a central utility.

---

## 11. Improvement Recommendations

### Architecture & Security
1. **Implement JWT or Next-Auth**: Wrap your API routes in middleware to ensure only authorized admins can issue certificates.
2. **Add `onlyOwner` or `onlyAuthorized` to Contract**: Restrict who can call `registerCertificate` to only the server's address.
3. **Centralize DB Logic**: Create a `/utils/db.ts` that exports a **MySQL Pool** (`mysql.createPool`).

### Engineering Best Practices
1. **Move Hashing to Utility**: Ensure the hashing algorithm is identical between the issuance and verification APIs by sharing a single utility function.
2. **Error Handling**: Use consistent error shapes in API responses so the frontend can display meaningful messages.

---

## 12. Developer Notes
- **Risky Area**: The `ISSUER_PRIVATE_KEY` in `issue-certificate.ts`. If this is ever leaked or if the API remains unprotected, the "Trust Layer" of the app is compromised.
- **Assumption**: The app assumes students stay logged in for as long as the tab is open. Improving the auth system should be the #1 priority before any public deployment.

---

## System Summary for Beginner Developer
Imagine this app like a **Digital Notary**:
1.  **The Box (MySQL)**: We keep a standard list of students and certificate names here so we can search for them quickly (like an Excel sheet).
2.  **The Vault (Blockchain)**: We don't put the whole file in the vault (it's too expensive). Instead, we take a "Fingerprint" (Hash) of the file and put that fingerprint in the vault. Fingerprints never change; if you change even one letter in a PDF, the fingerprint changes.
3.  **The Storage (IPFS)**: This is like a giant, public, decentralized hard drive where we keep the actual PDFs.
4.  **How it works**:
    *   **The Teacher (Admin)** uploads a PDF. The computer makes a fingerprint, puts the PDF on the public drive, puts the fingerprint in the vault, and writes the details in the Excel sheet.
    *   **The Student** logs in to see their list from the Excel sheet and gets a link to the public drive.
    *   **The Employer (Verifier)** takes a PDF file they were given. The computer calculates the fingerprint of *that* file and checks the Vault. If the fingerprint matches what's in the Vault, the certificate is 100% real and hasn't been changed!

**The project is currently a "Working Prototype" but needs stronger "Locks" (Security) on the doors (APIs) before it can be used for real certificates.**