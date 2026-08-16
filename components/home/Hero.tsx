import TransferCard from "./TransferCard";

export default function Hero() {
  return (
    <section className="w-full px-5 sm:px-8">
      <div className="mx-auto w-full max-w-[1000px] pt-[85px] pb-[100px] sm:pt-[95px] sm:pb-[115px] lg:pt-[105px] lg:pb-[125px]">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-0.035em] sm:text-[48px] lg:text-[54px]">
            Share Directly
          </h1>

            <h2 className="mt-3 bg-gradient-to-r from-[#22D3EE] to-[#34D399] bg-clip-text text-[37px] font-bold leading-[1.1] tracking-[-0.035em] text-transparent sm:text-[45px] lg:text-[51px]">
            Transfer Securely.
            </h2>

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