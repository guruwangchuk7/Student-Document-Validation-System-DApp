"use client";

import { motion } from "framer-motion";
import { SwitchTheme } from "~~/components/SwitchTheme";
import {
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface LandingPageProps {
  onAccess: () => void;
}

export const LandingPage = ({ onAccess }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B6D6F4] via-[#F0F7FF] to-white overflow-x-hidden selection:bg-primary selection:text-white scroll-smooth">

      {/* --- HEADER --- */}
      <header className="fixed top-8 left-0 w-full z-50 px-4 md:px-12 flex justify-center">
        <nav className="w-full max-w-7xl flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer group px-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <span className="text-white font-black text-xl">B</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900 hidden sm:block">BlockCertify</span>
          </div>

          <div className="flex items-center gap-6 md:gap-10">
            <div className="hidden lg:flex items-center gap-8">
              {["Features", "Benefits", "Security", "Process", "Team", "Contact"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-600 hover:text-black transition-colors">{item}</a>
              ))}
            </div>

            <button
              onClick={onAccess}
              className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-slate-900/10"
            >
              Enter Platform
            </button>
          </div>
        </nav>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-20 px-4 flex flex-col items-center justify-center text-center">
        {/* Soft Decorative Elements (No Images) */}
        <div className="absolute top-20 left-0 w-full h-[600px] pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-24 -left-20 w-96 h-96 bg-blue-400/20 blur-[100px] rounded-full animate-pulse"></div>
          <div className="absolute top-48 -right-20 w-[500px] h-[500px] bg-blue-300/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-4xl px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-[#1F1F1F] tracking-tight leading-[1.1] mb-8">
            Secure documents <br />
            <span className="opacity-90">like a pro</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed opacity-80">
            An all-in-one blockchain platform for issuing and validating academic achievements with absolute transparency and zero fraud.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button
              onClick={onAccess}
              className="px-12 py-5 bg-[#1F1F1F] text-white rounded-full font-bold text-lg hover:scale-105 transition-all"
            >
              Enter Platform
            </button>
            <a href="#features" className="px-12 py-5 bg-white/50 backdrop-blur-md text-slate-700 rounded-full font-bold text-lg hover:bg-white transition-all border border-white/20">
              See features
            </a>
          </div>
        </div>

        {/* --- FLOATING APP PREVIEW --- */}
        <div className="relative z-20 w-full max-w-6xl mx-auto mt-24">
          <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-white p-6 md:p-12 overflow-hidden ring-8 ring-white/30">
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch">
              {/* University Card */}
              <div className="flex-1 p-8 bg-[#F8FAFC] rounded-[2.5rem] border border-slate-100 flex flex-col items-center">
                <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
                  <BuildingLibraryIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">University</h3>
                <p className="text-xs text-slate-400 mb-8 max-w-[180px]">Securely issue and anchor certifications on-chain.</p>
                <div className="mt-auto flex gap-1">
                  {[1, 2, 3].map(i => <div key={i} className="w-8 h-1 bg-slate-200 rounded-full"></div>)}
                </div>
              </div>

              {/* Verifier Card */}
              <div className="flex-1 p-8 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center scale-110 z-10 shadow-xl shadow-blue-900/5">
                <div className="bg-accent/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
                  <MagnifyingGlassIcon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Company</h3>
                <p className="text-xs text-slate-400 mb-8 max-w-[180px]">Validate documents instantly with hash matching.</p>
                <div className="mt-auto flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-8 h-1 bg-primary/20 rounded-full"></div>)}
                </div>
              </div>

              {/* Student Card */}
              <div className="flex-1 p-8 bg-[#F8FAFC] rounded-[2.5rem] border border-slate-100 flex flex-col items-center">
                <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Student</h3>
                <p className="text-xs text-slate-400 mb-8 max-w-[180px]">Access and share your verified career records.</p>
                <div className="mt-auto flex gap-1">
                  {[1, 2, 3].map(i => <div key={i} className="w-8 h-1 bg-slate-200 rounded-full"></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-40 md:h-64"></div>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-32 bg-white px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-24">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-primary/50 mb-4 block">Capabilities</span>
            <h2 className="text-5xl font-bold text-slate-900 tracking-tight">Enterprise-Grade Features</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="p-1 w-full aspect-square md:aspect-video bg-gradient-to-br from-blue-50 to-white rounded-[3rem] border border-blue-100/50 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent"></div>
              <CpuChipIcon className="w-48 h-48 text-blue-100" />
            </div>
            <div className="space-y-10">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0"><DocumentCheckIcon className="w-6 h-6 text-primary" /></div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">Immutable Anchoring</h4>
                  <p className="text-slate-500 leading-relaxed">Every certificate is crytographically hashed and stored on the blockchain, creating a permanent, unalterable record.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0"><MagnifyingGlassIcon className="w-6 h-6 text-primary" /></div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">1-Click Verification</h4>
                  <p className="text-slate-500 leading-relaxed">Employers can verify authenticity instantly by dragging and dropping a file. Our engine does the rest in milliseconds.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0"><ShieldCheckIcon className="w-6 h-6 text-primary" /></div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">Decentralized Storage</h4>
                  <p className="text-slate-500 leading-relaxed">Documents are pinned to IPFS, ensuring your data lives as long as the internet does, with no single point of failure.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENEFITS SECTION --- */}
      <section id="benefits" className="py-32 bg-[#F8FAFC] px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold text-slate-900 tracking-tight mb-6">Built for Absolute Trust</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">Why the world's leading academic institutions choose BlockCertify to protect their reputation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { title: "Zero Fraud", desc: "Forgeries become impossible. Every claim is backed by a cryptographic proof on the public ledger.", icon: ShieldCheckIcon },
              { title: "Cost Efficiency", desc: "Reduce administrative overhead by 90% by eliminating manual verification calls and emails.", icon: UserGroupIcon },
              { title: "Global Portability", desc: "A universal standard that works everywhere. Students can take their verified records across borders effortlessly.", icon: ArrowPathIcon }
            ].map((benefit, i) => (
              <div key={i} className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mx-auto mb-8">
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">{benefit.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECURITY SECTION --- */}
      <section id="security" className="py-32 bg-slate-900 px-4 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="text-xs font-bold text-primary tracking-[0.4em] uppercase">Core Security</span>
              <h2 className="text-5xl font-black leading-tight">Your data. Protected by <span className="text-primary italic">Math</span>.</h2>
              <p className="text-lg text-slate-400 leading-relaxed">We utilize industry-standard SHA-256 hashing and the Ethereum blockchain to ensure that certifications are mathematically verifiable and impossible to hijack.</p>
              <div className="space-y-4">
                {["End-to-End Cryptographic Pushing", "AES-256 Encrypted Private Metadata", "On-Chain Transaction Logging", "Distributed IPFS Content Routing"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary ring-4 ring-primary/20"></div> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-colors"></div>
              <div className="flex flex-col gap-6 relative z-10">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 w-full bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 px-6 opacity-30 group-hover:opacity-100 transition-opacity" style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="w-8 h-8 rounded-lg bg-white/10"></div>
                    <div className="w-2/3 h-2 bg-white/10 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROCESS SECTION --- */}
      <section id="process" className="py-32 bg-white px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold text-slate-900 tracking-tight mb-20">The Verification Cycle</h2>
          <div className="space-y-12 relative">
            <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2 hidden md:block"></div>
            {[
              { title: "Issuance", desc: "The University hashes the document and sends a transaction to the blockchain." },
              { title: "Storage", desc: "The original file is pinned to IPFS for global, permanent accessibility." },
              { title: "Upload", desc: "The verifier receives the PDF and uploads it through our secure gateway." },
              { title: "Validation", desc: "Our engine compares the file hash with the on-chain record in real-time." }
            ].map((item, i) => (
              <div key={item.title} className={`flex flex-col md:flex-row items-center gap-8 relative z-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="md:w-1/2 md:px-12">
                  <h4 className="text-2xl font-bold text-slate-800 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
                <div className="w-[60px] h-[60px] bg-white border-2 border-primary rounded-full flex items-center justify-center font-black text-primary bg-white shadow-xl">
                  {i + 1}
                </div>
                <div className="md:w-1/2 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TEAM SECTION --- */}
      <section id="team" className="py-32 bg-[#F8FAFC] px-4 border-t border-slate-100">
        <div className="container mx-auto max-w-6xl text-center">
          <span className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-4 block">The Creators</span>
          <h2 className="text-5xl font-bold text-slate-900 mb-20 tracking-tight">The Minds Behind BlockCertify</h2>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Guru Wangchuk */}
            <div className="group p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500">
              <div className="w-24 h-24 bg-blue-50 mx-auto mb-8 rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                <UserIcon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Guru Wangchuk</h3>
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-6">CEO & Full Stack Engineer</p>
              <div className="space-y-2 text-sm text-slate-500 font-bold border-t border-slate-50 pt-6">
                <p className="opacity-60">Full stack engineer at Saidpiece</p>
                <p>Startup owner of Kodadev</p>
              </div>
            </div>

            {/* Lhawang Jamtsho */}
            <div className="group p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500">
              <div className="w-24 h-24 bg-blue-50 mx-auto mb-8 rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                <MagnifyingGlassIcon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Lhawang Jamtsho</h3>
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-6">Frontend developer and QA tester</p>
              <div className="space-y-2 text-sm text-slate-500 font-bold border-t border-slate-50 pt-6">
                <p className="opacity-60">Quality Assurance Lead</p>
                <p>UI Implementation</p>
              </div>
            </div>

            {/* Sangagy Rinchen */}
            <div className="group p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500">
              <div className="w-24 h-24 bg-blue-50 mx-auto mb-8 rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                <ShieldCheckIcon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Sangagy Rinchen</h3>
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-6">Frontend developer and security tester</p>
              <div className="space-y-2 text-sm text-slate-500 font-bold border-t border-slate-50 pt-6">
                <p className="opacity-60">Security Audit Researcher</p>
                <p>Vulnerability testing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-32 bg-white px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">Let's talk trust.</h2>
              <p className="text-xl text-slate-400 mb-12">Whether you're a university looking to modernize or a company needing verification, we're here to help.</p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a href="mailto:info@blockcertify.com" className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  <EnvelopeIcon className="w-6 h-6" /> Send an Email
                </a>
                <button className="flex items-center gap-3 px-10 py-5 bg-white/10 text-white rounded-full font-bold border border-white/10 hover:bg-white/20 transition-all">
                  <ChatBubbleLeftRightIcon className="w-6 h-6" /> 24/7 Live Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-slate-50 text-center bg-white">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center rotate-6">
              <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900">BlockCertify</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8 text-sm font-bold text-slate-400">
              {["Privacy", "Terms", "Documentation", "Legal"].map(i => <a key={i} href="#" className="hover:text-slate-900 transition-colors uppercase tracking-widest text-[10px]">{i}</a>)}
            </div>
            <div className="flex items-center gap-4 pl-8 border-l border-slate-100">
              <SwitchTheme className="pointer-events-auto" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
