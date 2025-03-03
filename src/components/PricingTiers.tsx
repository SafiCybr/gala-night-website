
import React, { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  MotionCard, 
  MotionCardHeader, 
  MotionCardContent, 
  MotionCardFooter, 
  MotionCardTitle, 
  MotionCardDescription 
} from "@/components/ui/motion-card";

type PricingTier = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlight?: boolean;
};

const pricingTiers: PricingTier[] = [
  {
    id: "standard",
    name: "Standard",
    price: 149,
    description: "Perfect for individuals looking to enjoy the event.",
    features: [
      "General seating",
      "Access to the main event",
      "Standard welcome drinks",
      "Three-course meal",
      "Event program and materials"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: 299,
    description: "Enhanced experience with premium benefits.",
    features: [
      "Premium seating",
      "Access to the main event",
      "Extended open bar service",
      "Five-course gourmet meal",
      "Event program and exclusive gifts",
      "Access to networking lounge"
    ],
    highlight: true
  },
  {
    id: "vip",
    name: "VIP",
    price: 499,
    description: "The ultimate exclusive experience.",
    features: [
      "VIP front-row seating",
      "Access to the main event and VIP areas",
      "Unlimited premium open bar",
      "Seven-course gourmet meal with wine pairing",
      "Luxury gift package",
      "Private networking sessions with speakers",
      "Exclusive after-party access"
    ]
  }
];

const PricingTiers = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Choose Your Experience
          </h2>
          <p className="text-lg text-muted-foreground">
            Select the ticket package that best suits your preferences and budget for an unforgettable evening.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <MotionCard
              key={tier.id}
              className={`relative overflow-hidden ${
                tier.highlight 
                  ? "ring-2 ring-primary/20 shadow-lg" 
                  : ""
              }`}
              onMouseEnter={() => setHoveredCard(tier.id)}
              onMouseLeave={() => setHoveredCard(null)}
              hoverEffect={true}
              style={{
                transitionDelay: `${index * 100}ms`,
                zIndex: tier.highlight ? 10 : 1
              }}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-0 right-0 py-1.5 text-xs font-medium text-center text-primary-foreground bg-primary">
                  Most Popular
                </div>
              )}
              
              <MotionCardHeader className={tier.highlight ? "pt-10" : ""}>
                <MotionCardTitle>{tier.name}</MotionCardTitle>
                <MotionCardDescription>{tier.description}</MotionCardDescription>
              </MotionCardHeader>
              
              <MotionCardContent>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground"> / person</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </MotionCardContent>
              
              <MotionCardFooter>
                <Link to="/register" className="w-full">
                  <Button 
                    variant={tier.highlight ? "default" : "outline"} 
                    className="w-full transition-all duration-300"
                  >
                    Choose {tier.name}
                  </Button>
                </Link>
              </MotionCardFooter>
              
              {/* Animated background effect on hover */}
              {hoveredCard === tier.id && (
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/5 to-transparent opacity-100 transition-opacity duration-500"></div>
              )}
            </MotionCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingTiers;
