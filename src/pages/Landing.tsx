
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DevconLogo from '@/components/DevconLogo';
import { ArrowRight, Star, Layout, Hexagon, CalendarClock } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add animation classes after component mounts
    const timer = setTimeout(() => {
      if (heroRef.current) {
        heroRef.current.classList.add('animate-fade-in');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleStartChat = () => {
    navigate('/chat');
  };

  // Achievements data
  const achievements = [
    { icon: Star, title: "15+ Years", description: "Serving the tech community" },
    { icon: Layout, title: "30+ Chapters", description: "Nationwide presence" },
    { icon: Hexagon, title: "10,000+", description: "Members and growing" },
    { icon: CalendarClock, title: "100+ Events", description: "Annually conducted" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-devcon-background via-[#2A2F3D] to-[#7E22CE]/80">
      <header className="flex items-center justify-between p-4 md:p-6 lg:px-12">
        <DevconLogo className="scale-125" />
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#about" className="text-white/80 hover:text-white transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-devcon-yellow after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">About Us</a>
          <a href="#initiatives" className="text-white/80 hover:text-white transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-devcon-yellow after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Our Initiatives</a>
          <a href="#chapters" className="text-white/80 hover:text-white transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-devcon-yellow after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Chapters</a>
          <a href="#contact" className="text-white/80 hover:text-white transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-devcon-yellow after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">Contact Us</a>
        </nav>
      </header>

      <section ref={heroRef} className="px-6 py-16 md:py-24 lg:py-32 max-w-7xl mx-auto transition-all duration-500 opacity-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1 bg-devcon-purple/40 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-2">
              Est. 2009 • 15 Years of Excellence
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              THE PHILIPPINES' LARGEST
              <span className="bg-gradient-to-r from-devcon-yellow to-devcon-orange bg-clip-text text-transparent"> NONPROFIT TECH COMMUNITY</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl">
              For 15 years, DEVCON has been uniting and empowering IT students and professionals nationwide. Our broad chapter reach enables unique collaboration through impactful initiatives.
            </p>
            <div className="pt-4">
              <Button 
                onClick={handleStartChat}
                className="bg-devcon-yellow hover:bg-devcon-yellow/90 text-black font-bold text-lg px-8 py-6 h-auto group transition-all duration-300 hover:shadow-[0_0_15px_rgba(248,210,53,0.5)]"
              >
                <span>TRY OUR AI ASSISTANT</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="pt-4">
              <a href="#learn-more" className="text-white/60 hover:text-white underline text-sm transition-colors">
                Discover how DEVCON started
              </a>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-devcon-purple/80 to-devcon-purple/50 rounded-2xl p-6 backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="aspect-[4/3] relative overflow-hidden rounded-lg mb-4">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-devcon-purple/60 to-devcon-background/80">
                <DevconLogo className="scale-[2.5] transform-gpu" />
                <div className="absolute top-4 right-4 bg-devcon-yellow text-black px-3 py-1 rounded-full font-bold text-sm animate-pulse">
                  we are fifteen
                </div>
              </div>
            </div>
            
            <Carousel className="w-full">
              <CarouselContent>
                {Array(3).fill(0).map((_, i) => (
                  <CarouselItem key={i} className="basis-1/3">
                    <Card className="bg-devcon-background/30 border-white/5">
                      <CardContent className="p-2 aspect-video flex items-center justify-center">
                        <span className="text-white/50 text-xs">Event {i+1}</span>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-devcon-yellow/10 text-devcon-yellow">
                  <achievement.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-devcon-yellow transition-colors">{achievement.title}</h3>
                  <p className="text-white/60">{achievement.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
