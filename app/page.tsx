"use client"
import Image from "next/image";

import { SignIn, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Header } from "./_components/Header";
import { HeroSection } from "./_components/HeroSection";
import { ShowcaseSection } from "./_components/ShowcaseSection";
import { FeaturesSection } from "./_components/FeaturesSection";
import { TestimonialsSection } from "./_components/TestimonialsSection";
import { PricingSection } from "./_components/PricingSection";
import { CTASection } from "./_components/CTASection";
import { Footer } from "./_components/Footer";

export default function Home() {


  const { user } = useUser();

  return (
    <header className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ShowcaseSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </header>
  );
}
