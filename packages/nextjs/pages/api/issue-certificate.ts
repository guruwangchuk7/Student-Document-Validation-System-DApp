// pages/api/issue-certificate.ts
import PinataSDK from "@pinata/sdk";
import crypto from "crypto";
import formidable from "formidable";
import fs from "fs";
import mysql from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";

// Disable default body parser
export const config = { api: { bodyParser: false } };

// Initialize Pinata
const pinata = new PinataSDK(process.env.PINATA_API_KEY!, process.env.PINATA_SECRET_KEY!);

// MySQL config
const dbConfig = {
  host: process.env.MYSQL_HOST!,
  user: process.env.MYSQL_USER!,
  password: process.env.MYSQL_PASSWORD!,
  database: process.env.MYSQL_DATABASE!,
};

// Helper to safely parse Formidable form
const parseForm = (req: NextApiRequest) =>
  new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: true, // Add this
      maxFileSize: 5 * 1024 * 1024, // Add this: 5MB limit
    });

    // Add debug logging
    form.on("file", (name, file) => {
      console.log("Received file:", name, file.originalFilename);
    });

    form.parse(req, (err, fields, files) => {
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
        certificateHash, // <-- NEW
      ],
    );
    await conn.end();

    return res.status(200).json({ success: true, ipfsCID });
  } catch (error: any) {
    console.error("Certificate issue error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
