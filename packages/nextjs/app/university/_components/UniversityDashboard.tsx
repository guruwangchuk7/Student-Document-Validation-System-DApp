"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import {
  ArrowLeftOnRectangleIcon,
  ArrowUpOnSquareIcon,
  BuildingLibraryIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { logout, signInWithGoogle, supabase } from "~~/utils/supabase/auth";

interface UniversityDashboardProps {
  initialUser: User | null;
}

const UniversityDashboard = ({ initialUser }: UniversityDashboardProps) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoadingSession, setIsLoadingSession] = useState(!initialUser);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [certificateIdInput, setCertificateIdInput] = useState("");
  const [studentFullName, setStudentFullName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [degreeName, setDegreeName] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentIdentifier, setStudentIdentifier] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;

    // Fail-safe timeout: Ensure we stop loading after 3 seconds no matter what
    const timer = setTimeout(() => {
      if (mounted) {
        setIsLoadingSession(false);
      }
    }, 3000);

    // If we don't have an initial user, we MUST check on the client
    if (!initialUser) {
      const initSession = async () => {
        try {
          const {
            data: { user: supabaseUser },
          } = await supabase.auth.getUser();
          if (mounted) {
            setUser(supabaseUser);
            setIsLoadingSession(false);
            clearTimeout(timer);
          }
        } catch (err) {
          console.error("Session check error:", err);
          if (mounted) {
            setIsLoadingSession(false);
            clearTimeout(timer);
          }
        }
      };
      initSession();
    } else {
      // If server provided the user, we are already done
      setIsLoadingSession(false);
      clearTimeout(timer);
    }

    // Subscribe to future changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setIsLoadingSession(false);
        clearTimeout(timer);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [initialUser]);

  const isAdmin = user?.email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "guruwangchuk1234@gmail.com");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFile(e.target.files[0]);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      toast.loading("Opening Google Sign-In...", { id: "auth-toast" });
      await signInWithGoogle();
    } catch (err: any) {
      toast.error(`Login failed: ${err.message}`, { id: "auth-toast" });
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !certificateIdInput ||
      !studentFullName ||
      !degreeName ||
      !universityName ||
      !selectedFile ||
      !studentIdentifier
    ) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("certificateId", certificateIdInput);
    formData.append("studentFullName", studentFullName);
    formData.append("gender", gender);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("degreeName", degreeName);
    formData.append("graduationDate", graduationDate);
    formData.append("universityName", universityName);
    formData.append("studentIdentifier", studentIdentifier);
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/issue-certificate", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unknown error");

      toast.success("Certificate issued successfully");

      // Reset form
      setCertificateIdInput("");
      setStudentFullName("");
      setGender("");
      setDateOfBirth("");
      setDegreeName("");
      setGraduationDate("");
      setUniversityName("");
      setStudentIdentifier("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err.message || "Failed to issue certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSession) {
    return (
      <div className="flex justify-center items-center mt-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // AUTHENTICATION & ACCESS CONTROL UI
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
        <div className="card w-full max-w-md bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-500">
          <div className="card-body p-12">
            <div className="text-center">
              <div className="bg-primary/5 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-6">
                {user && !isAdmin ? (
                  <LockClosedIcon className="h-12 w-12 text-error" />
                ) : (
                  <BuildingLibraryIcon className="h-12 w-12 text-primary" />
                )}
              </div>

              <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                {user && !isAdmin ? "Access Restricted" : "University Admin"}
              </h2>
              <p className="text-sm font-medium text-slate-400 mb-10 leading-relaxed max-w-[240px] mx-auto">
                {user && !isAdmin
                  ? `Authenticated as ${user.email}, but you lack administration rights.`
                  : "Please sign in to your official university account to issue certificates."}
              </p>
            </div>

            {!user ? (
              <button
                className={`btn btn-primary w-full h-16 rounded-2xl gap-3 text-lg font-bold shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary-focus border-none hover:scale-[1.02] active:scale-[0.98] transition-all ${isLoggingIn ? "loading" : ""}`}
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                {!isLoggingIn && (
                  <Image
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    width={24}
                    height={24}
                    className="bg-white p-1 rounded-lg"
                    alt="Google"
                  />
                )}
                {isLoggingIn ? "Connecting..." : "Continue with Google"}
              </button>
            ) : (
              <div className="space-y-4">
                <button
                  className="btn btn-outline btn-error w-full h-14 rounded-2xl font-bold"
                  onClick={() => logout()}
                >
                  Switch Account
                </button>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-300">
                Secure Blockchain Access
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">University Dashboard</h1>
          <p className="text-sm opacity-70">Admin Access: {user.email}</p>
        </div>
        <button className="btn btn-outline btn-sm btn-error" onClick={() => logout()}>
          <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" /> Logout
        </button>
      </div>

      <div className="card bg-base-100 shadow-xl border-t-4 border-primary">
        <div className="card-body">
          <h1 className="card-title text-xl">Issue New Certificate</h1>
          <p className="text-sm opacity-60 mb-4">
            The certificate will be anchored on-chain and stored decentralized on IPFS.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Certificate ID*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., cert-12345"
                className="input input-bordered"
                value={certificateIdInput}
                onChange={e => setCertificateIdInput(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Student Full Name*</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="input input-bordered"
                value={studentFullName}
                onChange={e => setStudentFullName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Degree Name*</span>
              </label>
              <input
                type="text"
                placeholder="Bachelor of Science"
                className="input input-bordered"
                value={degreeName}
                onChange={e => setDegreeName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">University Name*</span>
              </label>
              <input
                type="text"
                placeholder="University of Technology"
                className="input input-bordered"
                value={universityName}
                onChange={e => setUniversityName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Gender</span>
              </label>
              <select className="select select-bordered" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Date of Birth</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Graduation Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={graduationDate}
                onChange={e => setGraduationDate(e.target.value)}
              />
            </div>
            <div className="form-control col-span-1 md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Student&apos;s Unique ID (Aadhaar/CID)*</span>
              </label>
              <input
                type="text"
                placeholder="Roll number or National ID"
                className="input input-bordered"
                value={studentIdentifier}
                onChange={e => setStudentIdentifier(e.target.value)}
              />
            </div>
            <div className="form-control col-span-1 md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Certificate Document (PDF/Image)*</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="file-input file-input-bordered file-input-primary"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="card-actions justify-end mt-6">
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <ArrowUpOnSquareIcon className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? "Anchoring..." : "Issue & Anchor Certificate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDashboard;
