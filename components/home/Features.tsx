import {
  Diamond,
  Network,
  LockKeyhole,
} from "lucide-react";

const features = [
  {
    icon: Diamond,
    title: "Nearby Device Discovery",
    label: "Discover",
    description: "Instantly detect devices connected to the same network without manual setup.",
  },
  {
    icon: Network,
    title: "Direct P2P Transfer",
    label: "Connect",
    description: "Blazing fast peer-to-peer file sharing powered directly by WebRTC channels.",
  },
  {
    icon: LockKeyhole,
    title: "Secure Verification",
    label: "Secure",
    description: "End-to-end encrypted signals keep your shared data private and protected.",
  },
];

export default function Features() {
  return (
    <section className="w-full px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
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
                hover:shadow-[0_8px_30px_rgb(34,211,238,0.06)]
              "
            >
              <div>
                {/* Header Row: Icon & Tag Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-white/[0.04]
                      text-[#CBD5E1]
                      transition-colors
                      duration-300
                      group-hover:border-[#22D3EE]/30
                      group-hover:bg-[#22D3EE]/10
                      group-hover:text-[#22D3EE]
                    "
                  >
                    <Icon size={22} strokeWidth={1.8} />
                  </div>

                  <span className="rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#22D3EE]">
                    {feature.label}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="mt-6">
                  <h3 className="text-[15px] font-semibold text-[#F8FAFC] transition-colors duration-200 group-hover:text-[#22D3EE] sm:text-[16px]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#94A3B8]">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Bottom Subtle Gradient Accent Line */}
              <div className="mt-6 h-[2px] w-full rounded-full bg-white/[0.06] transition-colors duration-300 group-hover:bg-[#22D3EE]/40" />
            </div>
          );
        })}
      </div>
    </section>
  );
}