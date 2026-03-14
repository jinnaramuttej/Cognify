import Hero from '@/components/landing/Hero';
import Roadmap from '@/components/landing/Roadmap';
import FeatureGrid from '@/components/landing/FeatureGrid';
import TrustSection from '@/components/landing/TrustSection';
import FinalCTA from '@/components/landing/FinalCTA';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <main>
        <Hero />
        <Roadmap />
        <FeatureGrid />
        <TrustSection />
        <FinalCTA />
      </main>
    </div>
  );
}
