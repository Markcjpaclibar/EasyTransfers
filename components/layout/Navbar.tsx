"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Send", href: "/send" },
  { label: "Receive", href: "/receive" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative z-50 border-b border-white/[0.04] bg-[#111A2E]">
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-6 sm:px-8 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="text-[16px] font-semibold tracking-[-0.025em] text-[#F8FAFC] transition-colors duration-200 hover:text-[#22D3EE] sm:text-[17px]"
        >
          EasyTransfer
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                group
                relative
                rounded-lg
                px-4
                py-2.5
                text-[13px]
                font-medium
                text-[#CBD5E1]
                transition-all
                duration-200
                hover:bg-[#22D3EE]/[0.08]
                hover:text-[#22D3EE]
              "
            >
              {item.label}

              {/* Animated underline */}
              <span
                className="
                  absolute
                  bottom-[5px]
                  left-1/2
                  h-[1.5px]
                  w-0
                  -translate-x-1/2
                  rounded-full
                  bg-[#22D3EE]
                  transition-all
                  duration-300
                  group-hover:w-[calc(100%-32px)]
                "
              />
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            text-[#CBD5E1]
            transition-all
            duration-200
            hover:bg-[#22D3EE]/10
            hover:text-[#22D3EE]
            md:hidden
          "
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X size={23} strokeWidth={1.8} />
          ) : (
            <Menu size={23} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`overflow-hidden border-t border-white/[0.04] bg-[#0D1729] transition-all duration-300 md:hidden ${
          isOpen ? "max-h-[280px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="
                flex
                items-center
                rounded-lg
                px-4
                py-3.5
                text-[14px]
                font-medium
                text-[#CBD5E1]
                transition-all
                duration-200
                hover:bg-[#22D3EE]/[0.08]
                hover:pl-5
                hover:text-[#22D3EE]
              "
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}