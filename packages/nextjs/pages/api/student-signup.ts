import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";

// 🔒 Secure DB configuration using environment variables
const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "student_certificates_db",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { student_identifier, full_name, email, password } = req.body;

  if (!student_identifier || !full_name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    if (!process.env.MYSQL_PASSWORD) {
      throw new Error("MYSQL_PASSWORD environment variable is missing.");
    }
    const conn = await mysql.createConnection(dbConfig);

    // Check if student exists
    const [existing]: any = await conn.execute("SELECT * FROM students WHERE student_identifier=? OR email=?", [
      student_identifier,
      email,
    ]);
    if (existing.length > 0) {
      await conn.end();
      return res.status(400).json({ message: "Student already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert student
    await conn.execute("INSERT INTO students (student_identifier, full_name, email, password) VALUES (?, ?, ?, ?)", [
      student_identifier,
      full_name,
      email,
      hashedPassword,
    ]);

    await conn.end();
    return res.status(200).json({ success: true, message: "Student registered successfully" });
  } catch (err: any) {
    console.error("SIGNUP ERROR:", err.message, err.stack);
    return res.status(500).json({ message: "Server error. Check console." });
  }
}
