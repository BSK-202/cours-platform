import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
      </main>
    </>
  );
}