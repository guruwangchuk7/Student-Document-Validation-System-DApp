"use client";

import { useState } from "react";
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

      const res = await fetch("/api/verify-certificate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data?.verified) {
        setVerificationResult("approved");
        setVerifiedCertificate(data.data);
      } else {
        setVerificationResult("invalid");
        setVerifyErrorMsg(data?.message ?? "Verification failed");
      }
    } catch (err: any) {
      console.error("Verify error:", err);
      setVerificationResult("invalid");
      setVerifyErrorMsg(err?.message ?? "Server error during verification");
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
                <div className="alert alert-success flex flex-col items-start gap-2 shadow-inner">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-6 w-6 text-success" />
                    <h3 className="font-bold text-lg">Verification Approved!</h3>
                  </div>

                  <div className="divider my-1 text-success opacity-20"></div>

                  <div className="grid grid-cols-1 gap-1 text-sm w-full">
                    <p>
                      <b>Student ID:</b> {verifiedCertificate.studentIdentifier}
                    </p>
                    <p>
                      <b>Degree:</b> {verifiedCertificate.degreeName}
                    </p>
                    <p>
                      <b>University:</b> {verifiedCertificate.universityName}
                    </p>
                    <p>
                      <b>Graduation:</b> {verifiedCertificate.graduationDate}
                    </p>
                  </div>

                  <div className="mt-4 p-3 bg-base-100 bg-opacity-50 rounded-lg w-full border border-success border-opacity-20">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`badge ${verifiedCertificate.blockchainVerified ? "badge-success" : "badge-warning"} badge-sm`}
                      >
                        {verifiedCertificate.blockchainVerified ? "ON-CHAIN VERIFIED" : "DB ONLY"}
                      </div>
                    </div>
                    {verifiedCertificate.blockchainVerified ? (
                      <div className="text-xs space-y-1">
                        <p className="truncate">
                          <b>Issuer Address:</b> <span className="opacity-70">{verifiedCertificate.issuerAddress}</span>
                        </p>
                        <p>
                          <b>Anchored At:</b>{" "}
                          <span className="opacity-70">
                            {new Date(verifiedCertificate.anchoredAt * 1000).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs italic opacity-70">
                        This certificate is in our database but not yet anchored to the blockchain.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 w-full">
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${verifiedCertificate.ipfsCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline btn-success w-full gap-2 rounded-xl"
                    >
                      <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                      View Original Document
                    </a>
                  </div>

                  <div className="mt-3 text-[9px] opacity-40 break-all w-full text-center">
                    <b>IPFS CID:</b> {verifiedCertificate.ipfsCID}
                  </div>
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
