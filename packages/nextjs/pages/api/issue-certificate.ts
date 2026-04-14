import deployedContracts from "../../contracts/deployedContracts";
import PinataSDK from "@pinata/sdk";
import crypto from "crypto";
import formidable from "formidable";
import fs from "fs";
import mysql from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

// Disable default body parser
export const config = { api: { bodyParser: false } };

// Initialize Pinata
const pinata = new PinataSDK(process.env.PINATA_API_KEY!, process.env.PINATA_SECRET_KEY!);

const dbConfig = {
  host: process.env.MYSQL_HOST!,
  user: process.env.MYSQL_USER!,
  password: process.env.MYSQL_PASSWORD!,
  database: process.env.MYSQL_DATABASE!,
};

// ⛓️ Blockchain Config
const PRIVATE_KEY = (process.env.ISSUER_PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80") as `0x${string}`;
const issuerAccount = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  account: issuerAccount,
  chain: hardhat, // Update this to match your target network
  transport: http(),
}).extend(publicActions);

const contractConfig = (deployedContracts as any)[hardhat.id].CertificateRegistry;

const parseForm = (req: NextApiRequest) =>
  new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024,
    });

    form.on("file", (name: string, file: formidable.File) => {
      console.log("Received file:", name, file.originalFilename);
    });

    form.parse(req, (err: any, fields: formidable.Fields, files: formidable.Files) => {
      if (err) {
        console.error("Formidable error:", err);
        reject(err);
      } else resolve({ fields, files });
    });
  });

// Helper to convert string|string[]|undefined to string
const toString = (val: string | string[] | undefined) => (Array.isArray(val) ? val[0] : (val ?? ""));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fields, files } = await parseForm(req);
    console.log("Formidable files object:", files);

    // Extract fields
    const certificateId = toString(fields.certificateId);
    const studentFullName = toString(fields.studentFullName);
    const gender = toString(fields.gender);
    const dateOfBirth = toString(fields.dateOfBirth);
    const degreeName = toString(fields.degreeName);
    const graduationDate = toString(fields.graduationDate);
    const universityName = toString(fields.universityName);
    const studentIdentifier = toString(fields.studentIdentifier);

    // Extract uploaded file
    const fileArray = files.file as formidable.File[] | formidable.File | undefined;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file || !file.filepath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // --- NEW: Generate SHA256 hash of the file ---
    const fileBuffer = fs.readFileSync(file.filepath);
    const certificateHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // Create readable stream for Pinata
    const readableStream = fs.createReadStream(file.filepath);

    // Upload to Pinata
    const pinataResult = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata: {
        name: certificateId,
        keyvalues: {
          student: studentFullName,
          degree: degreeName,
        } as any,
      },
    });

    const ipfsCID = pinataResult.IpfsHash;

    // --- 🔨 NEW: Anchor on-chain (Web 2.5 Trust Layer) ---
    console.log("Anchoring hash on-chain:", certificateHash);
    const hashAsBytes32 = `0x${certificateHash}` as `0x${string}`;

    let txHash = null;
    try {
      txHash = await walletClient.writeContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: "registerCertificate",
        args: [hashAsBytes32],
      });
      console.log("Blockchain transaction hash:", txHash);
    } catch (bcError: any) {
      console.error("Blockchain anchoring failed:", bcError.message);
    }

    // Insert into MySQL (add certificate_hash)
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      `INSERT INTO certificates 
      (certificate_id, student_identifier, degree_name, university_name, graduation_date, ipfs_cid, issue_date, gender, date_of_birth, certificate_hash) 
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [
        certificateId,
        studentIdentifier,
        degreeName,
        universityName,
        graduationDate || null,
        ipfsCID,
        gender,
        dateOfBirth || null,
        certificateHash,
      ],
    );
    await conn.end();

    return res.status(200).json({ success: true, ipfsCID, txHash });
  } catch (error: any) {
    console.error("Certificate issue error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
