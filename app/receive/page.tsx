"use client";

import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import ReceivePanel from "@/components/receive/ReceivePanel";
import Footer from "@/components/layout/Footer";

export default function ReceivePage() {
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
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] sm:text-[21px]">
              Ready to Receive
            </h1>

            <p className="mt-2 text-[13px] text-[#94A3B8] sm:text-[14px]">
              Your device is ready to receive files directly from a nearby
              device.
            </p>
          </div>

          {/* Receive Panel */}
          <div className="mt-5 sm:mt-6">
            <ReceivePanel />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}