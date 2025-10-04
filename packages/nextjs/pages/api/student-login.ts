import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import type { NextApiRequest, NextApiResponse } from "next";

// ❌ Hardcoded DB credentials for testing only
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "9099",
  database: "student_certificates_db",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { student_identifier, email, password } = req.body;

  if (!student_identifier || !email || !password) return res.status(400).json({ message: "All fields are required" });

  try {
    const conn = await mysql.createConnection(dbConfig);

    // Check if student exists
    const [rows]: any = await conn.execute("SELECT * FROM students WHERE student_identifier=? AND email=?", [
      student_identifier,
      email,
    ]);

    if (rows.length === 0) {
      await conn.end();
      return res.status(400).json({ message: "Student not found" });
    }

    const student = rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword) {
      await conn.end();
      return res.status(400).json({ message: "Invalid password" });
    }

    // Fetch certificates
    const [certs]: any = await conn.execute(
      `SELECT certificate_id AS id,
              degree_name AS degreeName,
              university_name AS universityName,
              graduation_date AS graduationDate,
              ipfs_cid AS certificateFileCID
       FROM certificates
       WHERE student_identifier=?`,
      [student_identifier],
    );

    await conn.end();
    return res.status(200).json({ success: true, certificates: certs || [] });
  } catch (err: any) {
    console.error("LOGIN ERROR:", err.message, err.stack);
    return res.status(500).json({ message: "Server error. Check console." });
  }
}
