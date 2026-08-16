import Link from "next/link";
import {
  FaFacebookF,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#2A2A2A] bg-[#171717] px-6 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto flex max-w-[1050px] flex-col items-center">
        {/* Social Links */}
        <div className="flex items-center gap-7">
          <Link
            href="#"
            aria-label="Facebook"
            className="text-[#94A3B8] transition-all duration-200 hover:-translate-y-1 hover:text-[#22D3EE]"
          >
            <FaFacebookF size={20} />
          </Link>

          <Link
            href="#"
            aria-label="Phone"
            className="text-[#94A3B8] transition-all duration-200 hover:-translate-y-1 hover:text-[#22D3EE]"
          >
            <FaPhoneAlt size={19} />
          </Link>

          <Link
            href="#"
            aria-label="Email"
            className="text-[#94A3B8] transition-all duration-200 hover:-translate-y-1 hover:text-[#22D3EE]"
          >
            <FaEnvelope size={20} />
          </Link>
        </div>

        {/* Copyright */}
        <p className="mt-6 text-center text-[9px] font-normal text-[#94A3B8] sm:text-[16px]">
          © 2026 EasyTransfer - No Cloud. No Middleman. Just Transfer.
        </p>
      </div>
    </footer>
  );
}