
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import EventHero from "@/components/EventHero";
import PricingTiers from "@/components/PricingTiers";

const Index = () => {
  // Ensure smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchorLink = target.closest('a[href^="#"]');
      
      if (anchorLink) {
        e.preventDefault();
        const targetId = anchorLink.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        <EventHero />
        <PricingTiers />
        
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Ready to Secure Your Spot?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Don't miss this exclusive event. Limited seats available - register today to guarantee your place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <button className="px-8 py-3 rounded-md bg-white text-primary font-medium transition-all duration-300 hover:shadow-lg">
                  Register Now
                </button>
              </Link>
              <Link to="/login">
                <button className="px-8 py-3 rounded-md bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 font-medium transition-all duration-300 hover:bg-primary-foreground/20">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </section>
        
        <footer className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              © 2023 EventRegistry. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
