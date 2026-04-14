import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";

// 🔒 Initialize Supabase with SERVICE ROLE for privileged backend operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { student_identifier, full_name, email, password, gender, date_of_birth } = req.body;

  if (!student_identifier || !full_name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    // 1. Check if student already exists in Supabase
    const { data: existing, error: checkError } = await supabase
      .from("students")
      .select("*")
      .or(`student_identifier.eq.${student_identifier},email.eq.${email}`);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: "Student with this Identifier or Email already exists" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert student record
    const { error: insertError } = await supabase.from("students").insert([
      {
        student_identifier,
        full_name,
        email,
        password: hashedPassword,
        gender: gender || null,
        date_of_birth: date_of_birth || null,
      },
    ]);

    if (insertError) throw insertError;

    return res.status(200).json({ success: true, message: "Student registered successfully in Supabase" });
  } catch (err: any) {
    console.error("SUPABASE SIGNUP ERROR:", err.message);
    return res.status(500).json({ message: "Server error during registration: " + err.message });
  }
}
