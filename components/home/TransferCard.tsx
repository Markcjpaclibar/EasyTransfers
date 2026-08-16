import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";

type TransferCardProps = {
  type: "send" | "receive";
};

export default function TransferCard({
  type,
}: TransferCardProps) {
  const isReceive = type === "receive";

  const colors = isReceive
    ? {
        accent: "#22D3EE",
        background: "rgba(34, 211, 238, 0.10)",
        border: "rgba(34, 211, 238, 0.45)",
        iconBackground: "rgba(34, 211, 238, 0.15)",
      }
    : {
        accent: "#34D399",
        background: "rgba(52, 211, 153, 0.10)",
        border: "rgba(52, 211, 153, 0.45)",
        iconBackground: "rgba(52, 211, 153, 0.15)",
      };

  return (
    <Link
      href={isReceive ? "/receive" : "/send"}
      className="group relative min-h-[175px] overflow-hidden rounded-[11px] border border-[#29344B] bg-[#111A2E] p-7 transition-all duration-300 hover:-translate-y-1 sm:min-h-[190px] sm:p-8"
      style={
        {
          "--accent": colors.accent,
        } as React.CSSProperties
      }
    >
      {/* Hover glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 15% 20%, ${colors.background}, transparent 60%)`,
        }}
      />

      <div className="relative flex h-full flex-col">
        {/* Icon */}
        <div
          className="flex h-[36px] w-[36px] items-center justify-center rounded-[7px] transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundColor: colors.iconBackground,
            color: colors.accent,
          }}
        >
          {isReceive ? (
            <LogIn size={20} strokeWidth={2} />
          ) : (
            <LogOut size={20} strokeWidth={2} />
          )}
        </div>

        {/* Title */}
        <h3 className="mt-6 text-[17px] font-semibold tracking-[-0.015em] text-[#F8FAFC] transition-colors duration-300 group-hover:text-[var(--accent)] sm:text-[18px]">
          {isReceive ? "Receive files" : "Send files"}
        </h3>

        {/* Description */}
        <p className="mt-3 max-w-[330px] text-[11px] leading-[1.55] text-[#94A3B8] sm:text-[12px]">
          {isReceive
            ? "Make your device ready to receive files directly from another device"
            : "Find a nearby device and send your files directly no uploads, no cloud."}
        </p>
      </div>
    </Link>
  );
}