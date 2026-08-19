"use client";

import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import SendPanel from "@/components/send/SendPanel";
import Footer from "@/components/layout/Footer";

export default function SendPage() {
  useEffect(() => {
    // Force cleanup on tab close or navigation away
    const handleUnload = () => {
      // If you expose your socket instance globally or via context,
      // close it here to instantly remove ghost devices.
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1120] text-white">
      <Navbar />

      <main className="flex-1 px-5 pb-20 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto w-full max-w-[1050px]">
          {/* Page Heading */}
          <div>
            <h1 className="text-[25px] font-semibold tracking-[-0.025em] sm:text-[27px]">
              Send Files
            </h1>

            <p className="mt-2 text-[15px] text-[#94A3B8] sm:text-[16px]">
              Choose a nearby device and send files directly without cloud
              uploads.
            </p>
          </div>

          {/* Send Panel */}
          <div className="mt-6 sm:mt-7">
            <SendPanel />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}