import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  let db;
  try {
    db = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || "3306"),
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    });

    const [rows]: any = await db.query("SELECT password_hash FROM admins WHERE email = ?", [email]);

    console.log("Rows fetched:", rows); // Debug

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const hashedPassword = rows[0].password_hash;
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (passwordMatch) {
      return res.status(200).json({ success: true, message: "Login successful" });
    } else {
      return res.status(401).json({ error: "Invalid credentials." });
    }
  } catch (error) {
    console.error("Login API error:", error);
    return res.status(500).json({ error: "Internal server error." });
  } finally {
    if (db) await db.end();
  }
}
