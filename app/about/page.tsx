"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Wifi,
  Zap,
  Send,
  Scan,
  Download,
  Flame,
  Globe,
  Lock,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Scan,
    title: "Open & Connect",
    description:
      "Open EasyTransfer on any two devices connected to the same Wi-Fi or local network. No account or installation required.",
  },
  {
    step: "02",
    icon: Send,
    title: "Select & Send",
    description:
      "Choose your file and pick the target device from the live discovery list. An instant transfer request is sent over WebRTC.",
  },
  {
    step: "03",
    icon: Download,
    title: "Direct Download",
    description:
      "Once accepted on the receiving device, the file streams directly peer-to-peer at full local network bandwidth.",
  },
];

const features = [
  {
    icon: Zap,
    tag: "Privacy",
    title: "Zero Cloud Storage",
    description:
      "Your files are transferred directly between devices and are never uploaded, stored, or processed on remote cloud servers.",
  },
  {
    icon: Lock,
    tag: "Security",
    title: "End-to-End Encrypted",
    description:
      "WebRTC DataChannels provide native DTLS/SRTP encryption, keeping all data private and secure during transit.",
  },
  {
    icon: Flame,
    tag: "Performance",
    title: "Uncapped Speed",
    description:
      "Transfers run directly through your local network, bypassing internet bandwidth caps and throttled cloud speeds.",
  },
  {
    icon: Globe,
    tag: "Compatibility",
    title: "Cross-Platform",
    description:
      "Works seamlessly across iOS, Android, macOS, Windows, Linux, and any modern web browser without installing apps.",
  },
];

const goals = [
  {
    title: "Privacy First",
    description:
      "Eliminating cloud intermediaries ensures user files stay private and completely untracked.",
  },
  {
    title: "Zero Friction",
    description:
      "Removing login screens, mobile apps, and link generation speeds up everyday file sharing.",
  },
  {
    title: "Local Speed",
    description:
      "Leveraging WebRTC to utilize maximum local area network throughput without data caps.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC]">

        <Navbar/>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
        <div className="mx-auto max-w-[900px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/30 bg-[#22D3EE]/10 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#22D3EE]">
            <Wifi size={14} /> Seamless Peer-To-Peer Transfer
          </span>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-5xl lg:text-6xl">
            Direct File Transfers, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-[#34D399] bg-clip-text text-transparent">
              Without the Cloud
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-[680px] text-[15px] leading-relaxed text-[#94A3B8] sm:text-[17px]">
            EasyTransfer is a fast, web-based local file sharing platform.
            It connects nearby devices directly through WebRTC, enabling instant 
            peer-to-peer file transfers without third-party cloud uploads or file size limits.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="border-t border-white/[0.06] bg-[#0D1729]/60 px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#22D3EE]">
              Workflow
            </span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">How EasyTransfer Works</h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="group flex flex-col items-start">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#22D3EE]">
                      <Icon size={20} />
                    </div>
                    <span className="text-[13px] font-bold text-[#64748B]">{s.step}</span>
                  </div>

                  <h3 className="mt-4 text-[17px] font-semibold text-[#F8FAFC] transition-colors group-hover:text-[#22D3EE]">
                    {s.title}
                  </h3>

                  <p className="mt-2 text-[14px] leading-relaxed text-[#94A3B8]">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION (CARDS) */}
      <section className="px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#22D3EE]">
              Capabilities
            </span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Built for Security & Speed</h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="
                    group
                    relative
                    flex
                    flex-col
                    justify-between
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-[#111A2E]/60
                    p-6
                    backdrop-blur-md
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#22D3EE]/30
                    hover:bg-[#111A2E]/90
                    hover:shadow-[0_8px_30px_rgba(34,211,238,0.06)]
                  "
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#CBD5E1] transition-colors group-hover:border-[#22D3EE]/30 group-hover:bg-[#22D3EE]/10 group-hover:text-[#22D3EE]">
                        <Icon size={20} />
                      </div>

                      <span className="rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#22D3EE]">
                        {f.tag}
                      </span>
                    </div>

                    <h3 className="mt-5 text-[16px] font-semibold text-[#F8FAFC] transition-colors group-hover:text-[#22D3EE]">
                      {f.title}
                    </h3>

                    <p className="mt-2 text-[13px] leading-relaxed text-[#94A3B8]">
                      {f.description}
                    </p>
                  </div>

                  <div className="mt-6 h-[2px] w-full rounded-full bg-white/[0.06] transition-colors duration-300 group-hover:bg-[#22D3EE]/40" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. GOALS SECTION */}
      <section className="border-t border-white/[0.06] bg-[#0D1729]/40 px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="max-w-[600px]">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#22D3EE]">
              Our Mission
            </span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Our Goals for EasyTransfer</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#94A3B8]">
              We believe sharing files between your own devices shouldn't require third-party uploads or complicated setups.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {goals.map((goal, idx) => (
              <div key={goal.title} className="flex flex-col border-l-2 border-[#22D3EE]/40 pl-5">
                <span className="text-[12px] font-bold text-[#64748B]">0{idx + 1}</span>
                <h3 className="mt-1 text-[16px] font-semibold text-[#F8FAFC]">{goal.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#94A3B8]">
                  {goal.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. REUSABLE FOOTER */}
      <Footer />
    </div>
  );
}