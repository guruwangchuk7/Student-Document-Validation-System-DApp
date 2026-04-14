import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import type { NextApiRequest, NextApiResponse } from "next";

// 🔒 Initialize Supabase with SERVICE ROLE
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { student_identifier, email, password } = req.body;

  if (!student_identifier || !email || !password) return res.status(400).json({ message: "All fields are required" });

  try {
    // 1. Fetch student from Supabase
    const { data: students, error: fetchError } = await supabase
      .from("students")
      .select("*")
      .eq("student_identifier", student_identifier)
      .eq("email", email);

    if (fetchError) throw fetchError;

    if (!students || students.length === 0) {
      return res.status(400).json({ message: "Student record not found" });
    }

    const student = students[0];

    // 2. Verify hashed password
    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Fetch linked certificates
    const { data: certs, error: certError } = await supabase
      .from("certificates")
      .select("certificate_id, degree_name, university_name, graduation_date, ipfs_cid")
      .eq("student_identifier", student_identifier);

    if (certError) throw certError;

    // Transform keys for frontend compatibility if needed
    const formattedCerts = certs?.map(c => ({
      id: c.certificate_id,
      degreeName: c.degree_name,
      universityName: c.university_name,
      graduationDate: c.graduation_date,
      certificateFileCID: c.ipfs_cid,
    }));

    return res.status(200).json({ success: true, certificates: formattedCerts || [] });
  } catch (err: any) {
    console.error("SUPABASE LOGIN ERROR:", err.message);
    return res.status(500).json({ message: "Server error during login: " + err.message });
  }
}
