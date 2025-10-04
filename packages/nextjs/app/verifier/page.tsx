"use client";

import { useState } from "react";
import axios from "axios";
import { CheckCircleIcon, DocumentMagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline";

const VerifierDashboard = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<"approved" | "invalid" | null>(null);
  const [verifiedCertificate, setVerifiedCertificate] = useState<any>(null);
  const [verifyErrorMsg, setVerifyErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setVerificationResult(null);
      setVerifiedCertificate(null);
      setVerifyErrorMsg(null);
    }
  };

  const handleVerification = async () => {
    if (!selectedFile) return;

    setIsVerifying(true);
    setVerificationResult(null);
    setVerifiedCertificate(null);
    setVerifyErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await axios.post("/api/verify-certificate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      if (res.data?.verified) {
        setVerificationResult("approved");
        setVerifiedCertificate(res.data.data);
      } else {
        setVerificationResult("invalid");
        setVerifyErrorMsg(res.data?.message ?? "Verification failed");
      }
    } catch (err: any) {
      console.error("Verify error:", err);
      setVerificationResult("invalid");
      setVerifyErrorMsg(err?.response?.data?.message ?? "Server error during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-start p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl">Verify Student Certificate</h1>
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text font-semibold">Upload Certificate*</span>
            </label>
            <input type="file" className="file-input file-input-bordered w-full" onChange={handleFileChange} />
          </div>

          <div className="card-actions justify-end mt-4">
            <button className="btn btn-primary" onClick={handleVerification} disabled={!selectedFile || isVerifying}>
              {isVerifying ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <DocumentMagnifyingGlassIcon className="h-5 w-5 mr-2" />
              )}
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </div>

          {verificationResult && (
            <div className="mt-4">
              {verificationResult === "approved" && verifiedCertificate && (
                <div className="alert alert-success flex flex-col">
                  <CheckCircleIcon className="h-6 w-6 mb-2" />
                  <h3 className="font-bold">Verification Approved!</h3>
                  <p>
                    <b>Student:</b> {verifiedCertificate.full_name || verifiedCertificate.student_identifier}
                  </p>
                  <p>
                    <b>Degree:</b> {verifiedCertificate.degree_name}
                  </p>
                  <p>
                    <b>University:</b> {verifiedCertificate.university_name}
                  </p>
                  <p>
                    <b>Graduation:</b> {verifiedCertificate.graduation_date}
                  </p>
                  <p className="text-xs text-gray-500">
                    <b>IPFS CID:</b> {verifiedCertificate.ipfs_cid}
                  </p>
                </div>
              )}
              {verificationResult === "invalid" && (
                <div className="alert alert-error flex flex-col">
                  <XCircleIcon className="h-6 w-6 mb-2" />
                  <h3 className="font-bold">Verification Failed</h3>
                  <p>{verifyErrorMsg}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifierDashboard;
