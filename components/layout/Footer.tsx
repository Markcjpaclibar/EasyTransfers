import Link from "next/link";
import { FaFacebookF, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#0B1120] px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-[1050px] flex-col items-center">
        {/* Encryption Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/[0.08] px-3.5 py-1.5 text-[12px] font-semibold text-[#22D3EE]">
          <ShieldCheck size={16} />
          <span>Peer-to-Peer Encrypted</span>
        </div>

        {/* Social & Contact Links */}
        <div className="flex items-center gap-7">
          <Link
            href="#"
            aria-label="Facebook"
            className="text-[#94A3B8] transition-all duration-200 hover:-translate-y-1 hover:text-[#22D3EE]"
          >
            <FaFacebookF size={20} />
          </Link>

          <Link
            href="tel:09569378612"
            aria-label="Phone"
            className="text-[#94A3B8] transition-all duration-200 hover:-translate-y-1 hover:text-[#22D3EE]"
          >
            <FaPhoneAlt size={19} />
          </Link>

          <Link
            href="mailto:markcjpaclibarcareer@gmail.com"
            aria-label="Email"
            className="text-[#94A3B8] transition-all duration-200 hover:-translate-y-1 hover:text-[#22D3EE]"
          >
            <FaEnvelope size={20} />
          </Link>
        </div>

        {/* Copyright */}
        <p className="mt-6 text-center text-[12px] font-normal text-[#94A3B8] sm:text-[14px]">
          © {new Date().getFullYear()} EasyTransfer - No Cloud. No Middleman. Just Transfer.
        </p>
      </div>
    </footer>
  );
}