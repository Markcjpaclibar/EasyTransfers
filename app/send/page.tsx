import Navbar from "@/components/layout/Navbar";
import SendPanel from "@/components/send/SendPanel";

export default function SendPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0B1120] px-5 pb-20 pt-16 text-white sm:px-8 sm:pt-20">
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
    </>
  );
}