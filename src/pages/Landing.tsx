
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DevconLogo from '@/components/DevconLogo';
import { ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-devcon-background to-[#7E22CE]/80">
      <header className="flex items-center justify-between p-4 md:p-6 lg:px-12">
        <DevconLogo className="scale-125" />
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#about" className="text-white/80 hover:text-white transition-colors">About Us</a>
          <a href="#initiatives" className="text-white/80 hover:text-white transition-colors">Our Initiatives</a>
          <a href="#chapters" className="text-white/80 hover:text-white transition-colors">Chapters</a>
          <a href="#contact" className="text-white/80 hover:text-white transition-colors">Contact Us</a>
        </nav>
      </header>

      <section className="px-6 py-16 md:py-24 lg:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              THE PHILIPPINES' LARGEST NONPROFIT VOLUNTEER TECH COMMUNITY
            </h1>
            <p className="text-white/80 text-lg md:text-xl">
              For 15 years, DEVCON has been uniting and empowering IT students and professionals nationwide. Our broad chapter reach enables unique collaboration through impactful initiatives.
            </p>
            <div className="pt-4">
              <Button 
                onClick={handleStartChat}
                className="bg-devcon-yellow hover:bg-devcon-yellow/90 text-black font-bold text-lg px-8 py-6 h-auto group"
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
          
          <div className="bg-devcon-purple rounded-lg p-6 shadow-xl">
            <div className="aspect-[4/3] relative overflow-hidden rounded-lg">
              <div className="absolute inset-0 flex items-center justify-center bg-devcon-purple/80">
                <DevconLogo className="scale-[3]" />
                <div className="absolute top-4 right-4 bg-devcon-yellow text-black px-3 py-1 rounded-full font-bold text-sm">
                  we are fifteen
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-1 mt-4">
              {Array(10).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-video bg-devcon-background/30 rounded overflow-hidden"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
