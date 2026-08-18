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
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#111A2E]/90 backdrop-blur-md">
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
            border
            border-white/[0.08]
            bg-white/[0.03]
            text-[#CBD5E1]
            transition-all
            duration-200
            hover:border-[#22D3EE]/40
            hover:bg-[#22D3EE]/20
            hover:text-[#22D3EE]
            active:scale-95
            focus:outline-none
            focus:ring-2
            focus:ring-[#22D3EE]/50
            md:hidden
          "
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X size={21} strokeWidth={2} className="transition-transform duration-200" />
          ) : (
            <Menu size={21} strokeWidth={2} className="transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Mobile Navigation (Overlay attached to sticky header) */}
      <div
        className={`
          absolute
          left-0
          top-full
          w-full
          border-b
          border-white/[0.08]
          bg-[#0D1729]/95
          shadow-2xl
          backdrop-blur-xl
          transition-all
          duration-300
          ease-in-out
          md:hidden
          ${isOpen ? "visible max-h-[300px] opacity-100" : "invisible max-h-0 opacity-0 pointer-events-none"}
        `}
      >
        <div className="flex flex-col gap-1 px-5 py-4">
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
                py-3
                text-[14px]
                font-medium
                text-[#CBD5E1]
                transition-all
                duration-200
                hover:bg-[#22D3EE]/[0.12]
                hover:pl-6
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