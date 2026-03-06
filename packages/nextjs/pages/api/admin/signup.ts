import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "9099",
  database: "student_certificates_db",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, university_name } = req.body;

  if (!email || !password || !university_name)
    return res.status(400).json({ error: "Email, password, and university name are required" });

  try {
    const conn = await mysql.createConnection(dbConfig);

    const [existing]: any = await conn.execute("SELECT id FROM admins WHERE email = ?", [email]);
    if (existing.length > 0) {
      await conn.end();
      return res.status(400).json({ error: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await conn.execute(
      "INSERT INTO admins (email, password_hash, university_name, created_at) VALUES (?, ?, ?, NOW())",
      [email, hashedPassword, university_name],
    );

    await conn.end();
    return res.status(200).json({ success: true, message: "Admin created successfully" });
  } catch (err: any) {
    console.error("ADMIN SIGNUP ERROR:", err?.message || err);
    return res.status(500).json({ error: "Server error" });
  }
}
