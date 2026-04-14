"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingPage } from "./_components/LandingPage";
import { ArrowLeftIcon, BuildingLibraryIcon, MagnifyingGlassIcon, UserIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [showApp, setShowApp] = useState(false);

  if (!showApp) {
    return <LandingPage onAccess={() => setShowApp(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col items-center pt-28 px-4">
      {/* Back button to return to storytelling */}
      <button
        onClick={() => setShowApp(false)}
        className="fixed top-8 left-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors bg-white px-4 py-2 rounded-full shadow-sm z-50"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to Product Intro
      </button>

      <div className="px-5 text-center max-w-2xl mb-16">
        <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-4">Platform Dashboard</h1>
        <p className="text-lg text-slate-500 font-medium opacity-80">
          Select your access portal to begin managing academic credentials on the blockchain.
        </p>
      </div>

      <div className="w-full pb-20">
        <div className="flex justify-center items-stretch gap-8 flex-col lg:flex-row max-w-7xl mx-auto">
          {/* University Card */}
          <div className="flex-1 card max-w-sm bg-white shadow-2xl shadow-blue-900/10 rounded-[2.5rem] border border-slate-50 overflow-hidden hover:scale-[1.02] transition-all">
            <div className="card-body p-10 items-center text-center">
              <div className="bg-[#F0F7FF] w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
                <BuildingLibraryIcon className="h-8 w-8 text-primary opacity-30" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">University Admin</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                Registered academic institutions can secure and anchor new student certificates directly to the
                immutable ledger.
              </p>
              <Link href="/university" className="w-full">
                <button className="btn btn-primary w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20 bg-[#93C5FD] border-none text-white hover:bg-primary transition-colors">
                  Open Admin Portal
                </button>
              </Link>
            </div>
          </div>

          {/* Verifier Card */}
          <div className="flex-1 card max-w-sm bg-white shadow-2xl shadow-blue-900/10 rounded-[2.5rem] border border-slate-50 overflow-hidden hover:scale-[1.02] transition-all">
            <div className="card-body p-10 items-center text-center">
              <div className="bg-[#F0F7FF] w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
                <MagnifyingGlassIcon className="h-8 w-8 text-primary opacity-30" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Company Verifier</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                Instantly authenticate records by matching file hashes against our decentralized certificate registry.
              </p>
              <Link href="/verifier" className="w-full">
                <button className="btn btn-primary w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20 bg-[#93C5FD] border-none text-white hover:bg-primary transition-colors">
                  Open Verifier Page
                </button>
              </Link>
            </div>
          </div>

          {/* Student Card */}
          <div className="flex-1 card max-w-sm bg-white shadow-2xl shadow-blue-900/10 rounded-[2.5rem] border border-slate-50 overflow-hidden hover:scale-[1.02] transition-all">
            <div className="card-body p-10 items-center text-center">
              <div className="bg-[#F0F7FF] w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
                <UserIcon className="h-8 w-8 text-primary opacity-30" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Student Portal</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                Securely access, view, and share your blockchain-verified certifications with potential employers.
              </p>
              <Link href="/student" className="w-full">
                <button className="btn btn-primary w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20 bg-[#93C5FD] border-none text-white hover:bg-primary transition-colors">
                  Open Student Portal
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
