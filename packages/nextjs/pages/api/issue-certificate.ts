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

// 🔒 DB configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "student_certificates_db",
};

// Initialize Pinata
const pinata = new PinataSDK(process.env.PINATA_API_KEY!, process.env.PINATA_SECRET_KEY!);

// ⛓️ Blockchain Config
const PRIVATE_KEY = (process.env.ISSUER_PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80") as `0x${string}`;
const issuerAccount = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  account: issuerAccount,
  chain: hardhat,
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

    form.parse(req, (err: any, fields: formidable.Fields, files: formidable.Files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

const toString = (val: string | string[] | undefined) => (Array.isArray(val) ? val[0] : (val ?? ""));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { fields, files } = await parseForm(req);

    // Extract fields
    const certificateId = toString(fields.certificateId);
    const degreeName = toString(fields.degreeName);
    const graduationDate = toString(fields.graduationDate);
    const universityName = toString(fields.universityName);
    const studentIdentifier = toString(fields.studentIdentifier);

    // Extract uploaded file
    const fileArray = files.file as formidable.File[] | formidable.File | undefined;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file || !file.filepath) return res.status(400).json({ error: "No file uploaded" });

    // Generate SHA256 hash
    const fileBuffer = fs.readFileSync(file.filepath);
    const certificateHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const hashAsBytes32 = `0x${certificateHash}` as `0x${string}`;

    // 1. Upload to Pinata and 2. Anchor on-chain in parallel
    const [pinataResult, txHash] = await Promise.all([
      pinata.pinFileToIPFS(fs.createReadStream(file.filepath), {
        pinataMetadata: { name: certificateId },
      }),
      (async () => {
        try {
          return await walletClient.writeContract({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: "registerCertificate",
            args: [hashAsBytes32],
          });
        } catch (bcError: any) {
          console.error("Blockchain anchoring failed:", bcError.message);
          return "FAILED";
        }
      })(),
    ]);

    const ipfsCID = pinataResult.IpfsHash;

    // 3. Save to MySQL (Primary source for student portal)
    const conn = await mysql.createConnection(dbConfig);
    try {
      await conn.execute(
        `INSERT INTO certificates 
         (certificate_id, student_identifier, degree_name, university_name, graduation_date, ipfs_cid, certificate_hash) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          certificateId,
          studentIdentifier,
          degreeName,
          universityName,
          graduationDate || null,
          ipfsCID,
          certificateHash,
        ],
      );
    } catch (dbErr: any) {
      console.error("MySQL Insert Error:", dbErr.message);
      // Check if columns exist or table exists
      throw new Error("Local Database storage failed: " + dbErr.message);
    } finally {
      await conn.end();
    }

    return res.status(200).json({ success: true, ipfsCID, txHash });
  } catch (error: any) {
    console.error("Certificate issue error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
