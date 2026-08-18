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
    <section className="w-full px-6 py-12 sm:px-8 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 lg:gap-12">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="group flex flex-col items-start transition-all duration-300"
            >
              {/* Icon Container with Subtle Glow */}
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-white/[0.02]
                  text-[#94A3B8]
                  transition-all
                  duration-300
                  group-hover:border-[#22D3EE]/40
                  group-hover:bg-[#22D3EE]/10
                  group-hover:text-[#22D3EE]
                  group-hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]
                "
              >
                <Icon size={22} strokeWidth={1.8} />
              </div>

              {/* Text Content */}
              <div className="mt-4 flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-[#F8FAFC] transition-colors duration-200 group-hover:text-[#22D3EE] sm:text-[16px]">
                    {feature.title}
                  </h3>
                </div>

                <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#22D3EE]">
                  {feature.label}
                </span>

                <p className="mt-2 text-[13px] leading-relaxed text-[#94A3B8]">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}