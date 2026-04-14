"use client";

import { memo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowDownTrayIcon,
  ArrowLeftOnRectangleIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  IdentificationIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

// --- Types ---
interface Certificate {
  id: string;
  degreeName: string;
  universityName: string;
  graduationDate: string;
  certificateFileCID: string;
}

// --- Certificate Card (Memoized for performance) ---
const CertificateCard = memo(({ certificate }: { certificate: Certificate }) => {
  const handleShare = () => {
    if (certificate.certificateFileCID) {
      navigator.clipboard.writeText(`https://gateway.pinata.cloud/ipfs/${certificate.certificateFileCID}`);
      toast.success("Link to certificate copied to clipboard!");
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-300">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="card-title text-lg font-bold mb-2">{certificate.degreeName}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
              <BuildingOfficeIcon className="h-4 w-4" />
              <span>{certificate.universityName}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>Graduated: {certificate.graduationDate}</span>
            </div>
          </div>
          <div className="badge badge-success badge-outline whitespace-nowrap">Blockchain Verified</div>
        </div>
        <div className="bg-base-200 p-3 rounded-lg my-4">
          <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">IPFS CID</p>
          <p className="text-xs font-mono text-gray-800 break-all">{certificate.certificateFileCID}</p>
        </div>
        <div className="card-actions justify-center space-x-2">
          <a
            href={`https://gateway.pinata.cloud/ipfs/${certificate.certificateFileCID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm flex-1"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            View
          </a>
          <button onClick={handleShare} className="btn btn-outline btn-sm flex-1">
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
});

CertificateCard.displayName = "CertificateCard";

const StudentPortal = () => {
  // Login & Registration state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Portal state
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_identifier: studentId, email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      setCertificates(data.certificates || []);
      setIsLoggedIn(true);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !email || !password || !fullName) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/student-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_identifier: studentId,
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Registration failed");

      toast.success("Account created! You can now login.");
      setIsRegistering(false);
      setFullName("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCertificates([]);
    setStudentId("");
    setEmail("");
    setPassword("");
    toast.success("Logged out successfully");
  };

  const filteredCertificates = certificates.filter(
    cert =>
      cert.degreeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.universityName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl border-t-4 border-primary">
          <div className="card-body">
            <div className="text-center mb-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircleIcon className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-base-content">
                {isRegistering ? "Create Account" : "Student Portal"}
              </h2>
              <p className="text-sm opacity-60 mt-2">
                {isRegistering
                  ? "Join the blockchain verification network"
                  : "Access your blockchain-verified certifications"}
              </p>
            </div>

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
              {isRegistering && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <UserCircleIcon className="h-4 w-4" /> Full Name
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input input-bordered focus:input-primary transition-all"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <IdentificationIcon className="h-4 w-4" /> Student ID / CID
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., student-001"
                  className="input input-bordered focus:input-primary transition-all"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4" /> Email Address
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  className="input input-bordered focus:input-primary transition-all"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <KeyIcon className="h-4 w-4" /> Password
                  </span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered focus:input-primary transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <div className="card-actions mt-6">
                <button
                  type="submit"
                  className={`btn btn-primary w-full shadow-lg ${isLoading ? "loading" : ""}`}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : isRegistering ? "Create Student Account" : "Login to Dashboard"}
                </button>
              </div>
            </form>

            <div className="divider text-xs opacity-50 uppercase tracking-widest mt-6">or</div>

            <div className="text-center mt-2">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setFullName("");
                }}
                className="btn btn-ghost btn-sm text-primary"
              >
                {isRegistering ? "Back to Login" : "Create New Student Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-base-content tracking-tight">My Certificates</h1>
            <p className="text-lg opacity-70 mt-1">
              Found {certificates.length} verified records for {email}
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline btn-error btn-sm md:btn-md gap-2 shadow-sm">
            <ArrowLeftOnRectangleIcon className="h-5 w-5" /> Logout
          </button>
        </div>

        <div className="mb-10">
          <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-300">
            <div className="card-body p-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-primary opacity-50" />
                <input
                  type="text"
                  placeholder="Filter by degree name or university..."
                  className="input input-ghost w-full pl-14 h-16 text-lg focus:bg-base-200 outline-none transition-all border-none focus:ring-0"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {filteredCertificates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCertificates.map(cert => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl border-dashed border-2 border-base-300 py-20">
            <div className="card-body items-center text-center">
              <DocumentTextIcon className="h-24 w-24 text-base-200 mb-6" />
              <h3 className="text-2xl font-bold opacity-80">No Certificates Found</h3>
              <p className="max-w-md opacity-60">
                {searchQuery
                  ? "No results match your search criteria. Try a different keyword."
                  : "We couldn't find any certificates linked to your account. Please contact your university if you believe this is an error."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPortal;
