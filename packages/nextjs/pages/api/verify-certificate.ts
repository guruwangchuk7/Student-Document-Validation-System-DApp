import deployedContracts from "../../contracts/deployedContracts";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import formidable, { Fields, File as FormidableFile } from "formidable";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";

export const config = { api: { bodyParser: false } };

// 🔒 Initialize Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

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

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

const contractConfig = (deployedContracts as any)[hardhat.id].CertificateRegistry;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const form = formidable({ multiples: false, keepExtensions: true, maxFileSize: 50 * 1024 * 1024 });
    const { files } = await new Promise<{ fields: Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    const certificateFile = firstFile(files, "file");
    if (!certificateFile) return res.status(400).json({ verified: false, message: "Certificate file is required." });

    const certificateHash = await hashFile(certificateFile.filepath);
    const hashAsBytes32 = `0x${certificateHash}` as `0x${string}`;

    // Parallel IO tasks
    const [dbResult, blockchainResult] = await Promise.all([
      supabase.from("certificates").select("*").eq("certificate_hash", certificateHash),
      (async () => {
        try {
          return await publicClient.readContract({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: "verifyCertificate",
            args: [hashAsBytes32],
          });
        } catch (bcError: any) {
          console.error("Blockchain verification check failed:", bcError.message);
          return [false, "0x0000000000000000000000000000000000000000", 0n];
        }
      })(),
    ]);

    const { data: certificates, error: dbError } = dbResult;
    const [isBlockchainVerified, issuer, timestamp] = blockchainResult as any;

    if (dbError || !certificates || certificates.length === 0) {
      return res.status(200).json({ verified: false, message: "Certificate not found in Supabase database." });
    }

    const certificate = certificates[0];

    return res.status(200).json({
      verified: true,
      blockchainVerified: isBlockchainVerified,
      issuerAddress: issuer,
      anchoredAt: timestamp ? Number(timestamp) : null,
      data: {
        certificateId: certificate.certificate_id,
        studentIdentifier: certificate.student_identifier,
        degreeName: certificate.degree_name,
        universityName: certificate.university_name,
        graduationDate: certificate.graduation_date,
        ipfsCID: certificate.ipfs_cid,
      },
    });
  } catch (err: any) {
    console.error("Verification API error:", err);
    return res.status(500).json({ verified: false, message: "Server error: " + err.message });
  }
}
