import TransferCard from "./TransferCard";

export default function Hero() {
  return (
    <section className="w-full px-5 sm:px-8">
      <div className="mx-auto w-full max-w-[1000px] pt-[85px] pb-[100px] sm:pt-[95px] sm:pb-[115px] lg:pt-[105px] lg:pb-[125px]">
        {/* Heading */}
        <div className="text-center">
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-5xl lg:text-6xl">
            Share Directly,   <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-[#34D399] bg-clip-text text-transparent">
              Transfer Securely.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-[560px] text-[14px] leading-[1.55] text-[#94A3B8] sm:text-[15px] lg:text-[16px]">
            Transfer photos, videos, documents, and more
            <br className="hidden sm:block" />
            directly from one device to another.
          </p>
        </div>

        {/* Transfer Cards */}
        <div className="mx-auto mt-11 grid w-full max-w-[820px] grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2">
          <TransferCard type="receive" />
          <TransferCard type="send" />
        </div>
      </div>
    </section>
  );
}