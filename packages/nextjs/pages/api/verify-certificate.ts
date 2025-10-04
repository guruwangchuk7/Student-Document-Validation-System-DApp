import crypto from "crypto";
import formidable, { Fields, File as FormidableFile } from "formidable";
import fs from "fs";
import mysql from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = { api: { bodyParser: false } };

const hashFile = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", chunk => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });

function firstFile(files: formidable.Files, key: string): FormidableFile | undefined {
  const arr = (files as Record<string, FormidableFile[] | undefined>)[key];
  if (Array.isArray(arr) && arr.length > 0) return arr[0];
  return undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const form = formidable({ multiples: false, keepExtensions: true, maxFileSize: 50 * 1024 * 1024 });
    const { files } = await new Promise<{ fields: Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    const certificateFile = firstFile(files, "file");
    if (!certificateFile) return res.status(400).json({ verified: false, message: "Certificate file is required." });

    const certificateHash = await hashFile(certificateFile.filepath);

    // Check in DB
    const [rows] = await db.query("SELECT * FROM certificates WHERE certificate_hash = ? LIMIT 1", [certificateHash]);

    if ((rows as any[]).length === 0) {
      return res.status(200).json({ verified: false, message: "Certificate not found in registry." });
    }

    const certificate = (rows as any[])[0];

    return res.status(200).json({ verified: true, data: certificate });
  } catch (err: any) {
    console.error("Verification API error:", err);
    return res.status(500).json({ verified: false, message: "Server error during verification." });
  } finally {
    await db.end();
  }
}
