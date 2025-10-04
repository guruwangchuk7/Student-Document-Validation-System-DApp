"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { BuildingLibraryIcon, MagnifyingGlassIcon, UserIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 text-center">
          <h1 className="text-4xl font-bold mb-4">Student Certificate Validation DApp</h1>
          <p className="text-lg">
            A decentralized platform for secure issuance and verification of academic certificates.
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            {/* University Card */}
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <BuildingLibraryIcon className="h-12 w-12 text-primary" />
                <h2 className="card-title">University Admin</h2>
                <p>Issue new student certificates securely to the blockchain.</p>
                <div className="card-actions justify-end">
                  <Link href="/university" passHref className="link">
                    <button className="btn btn-primary">Go to Admin Dashboard</button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Verifier Card */}
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <MagnifyingGlassIcon className="h-12 w-12 text-accent" />
                <h2 className="card-title">Company Verifier</h2>
                <p>Verify the authenticity of a student&apos;s certificate by uploading the file.</p>
                <div className="card-actions justify-end">
                  <Link href="/verifier" passHref className="link">
                    <button className="btn btn-accent">Go to Verification Page</button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Student Card */}
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <UserIcon className="h-12 w-12 text-primary" />
                <h2 className="card-title">Student</h2>
                <p>Access and view your digitally issued academic certificates.</p>
                <div className="card-actions justify-end">
                  <Link href="/student" passHref className="link">
                    <button className="btn btn-primary">Go to Student Portal</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
