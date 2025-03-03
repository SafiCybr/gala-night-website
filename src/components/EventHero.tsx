
import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EventHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-grid-slate-400/[0.1] bg-[size:20px_20px]"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl"></div>
      
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 animate-fade-in">
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-secondary text-sm font-medium">
              Exclusive Gala Event
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Annual Evening <br />Gala Dinner 2023
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Join us for an unforgettable evening of elegance, fine dining, networking, and entertainment at our prestigious venue.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>December 15, 2023</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>7:00 PM - 11:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Grand Hotel</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="transition-all duration-300 hover:shadow-lg">
                  Register Now
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="order-1 md:order-2 animate-fade-in">
            <div className="relative p-2 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3069&q=80" 
                alt="Gala Event" 
                className="rounded-xl object-cover w-full h-[400px] md:h-[480px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventHero;
