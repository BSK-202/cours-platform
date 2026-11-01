
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import CoursesSection from "@/components/landing/CoursesSection";
import AboutSection from "@/components/landing/AboutSection";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        <Hero />
        <CoursesSection />
        <AboutSection />
      </main>
    </>
  );
}
