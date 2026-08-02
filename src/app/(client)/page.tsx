import React from 'react';
import { HeroSection } from '@/components/blocks/HeroSection';
import { FeaturesGrid } from '@/components/blocks/FeaturesGrid';
import { FeaturedProducts } from '@/components/blocks/FeaturedProducts';
import { FeaturedSaaS } from '@/components/blocks/FeaturedSaaS';
import { ServicesGrid } from '@/components/blocks/ServicesGrid';
import { Testimonials } from '@/components/blocks/Testimonials';
import { GallerySection } from '@/components/blocks/GallerySection';
import { BlogSection } from '@/components/blocks/BlogSection';
import { ContactSection } from '@/components/blocks/ContactSection';
import { CTASection } from '@/components/blocks/CTASection';
import { AboutSection } from '@/components/blocks/AboutSection';
import { TeamSection } from '@/components/blocks/TeamSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturesGrid />
      <AboutSection />
      <FeaturedProducts />
      <FeaturedSaaS />
      <ServicesGrid />
      <Testimonials />
      <GallerySection />
      <TeamSection />
      <BlogSection />
      <ContactSection />
      <CTASection />
    </main>
  );
}
