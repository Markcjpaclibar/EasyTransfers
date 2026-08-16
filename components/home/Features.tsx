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
  },
  {
    icon: Network,
    title: "Direct P2P Transfer",
    label: "Connect",
  },
  {
    icon: LockKeyhole,
    title: "Secure Verification",
    label: "Secure",
  },
];

export default function Features() {
  return (
    <section className="w-full px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1050px] grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-12 lg:gap-20">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="flex items-center justify-center gap-4 sm:justify-start"
            >
              {/* Icon */}
              <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center text-[#94A3B8]">
                <Icon
                  size={38}
                  strokeWidth={1.35}
                />
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <h3 className="text-[13px] font-medium leading-[1.25] text-[#E2E8F0] sm:text-[14px]">
                  {feature.title}
                </h3>

                <span className="mt-1 text-[14px] font-normal text-[#64748B] sm:text-[14px]">
                  {feature.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}