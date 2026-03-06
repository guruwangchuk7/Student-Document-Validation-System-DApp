# BlockCertify Project Documentation

## 1. Overview
**BlockCertify** is a professional-grade Decentralized Application (DApp) designed to revolutionize the way educational certificates are issued, stored, and verified. By leveraging **IPFS** for decentralized storage and **SHA256 hashing** for integrity, the platform eliminates the risks of document fraud.

## 2. Purpose
Traditional certificate verification is slow and vulnerable to forgery. BlockCertify:
- **Ensures Immutability:** Uses IPFS for tamper-proof storage.
- **Instant Verification:** Confirms authenticity via file hash comparison.
- **Student Empowerment:** Provides a secure dashboard for credentials.

## 3. Key Features
- **University Portal:** Secure issuance with IPFS pinning and cryptographic hashing.
- **Verifier Dashboard:** Drag-and-drop verification with immediate hash validation.
- **Student Portal:** Personal vault for viewing, downloading, and sharing credentials.

## 4. Technical Architecture
- **Frontend:** Next.js 14 (App Router) with Tailwind CSS & DaisyUI.
- **Storage:** IPFS (via Pinata SDK) for document blobs.
- **Database:** MySQL for student metadata and certificate hashes.
- **Security:** Bcrypt for passwords and SHA256 for document integrity.

## 5. API Reference
- `POST /api/issue-certificate`: Pins file to IPFS and registers hash in DB.
- `POST /api/verify-certificate`: Re-calculates upload hash and compares with registry.
- `POST /api/student-login`: Authenticates students using CID/Aadhaar.
