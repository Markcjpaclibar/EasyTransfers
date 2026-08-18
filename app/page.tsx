import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0B1120] text-white">
        <Hero />
        <Features />
      </main>

      <Footer />
    </>
  );
}