
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DevconLogo from '@/components/DevconLogo';
import {
  ArrowRight,
  Star,
  Layout,
  Hexagon,
  CalendarClock,
  Info,
  Lightbulb, // ✅ Replace Bulb with Lightbulb
  MapPin,
  Mail
} from 'lucide-react';import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const initiativesRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add animation classes after component mounts
    const timer = setTimeout(() => {
      if (heroRef.current) {
        heroRef.current.classList.add('animate-fade-in');
      }
    }, 100);
    
    // Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    // Observe all section refs
    [aboutRef, initiativesRef, chaptersRef, contactRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const handleStartChat = () => {
    navigate('/chat');
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Achievements data
  const achievements = [
    { icon: Star, title: "15+ Years", description: "Serving the tech community" },
    { icon: Layout, title: "11+ Chapters", description: "Nationwide presence" },
    { icon: Hexagon, title: "100,000+", description: "Members and growing" },
    { icon: CalendarClock, title: "50+ Events", description: "Annually conducted" },
  ];

  // Initiatives data
  const initiatives = [
    {
      title: "DEVCON Intership",
      description: "An Intership program that connects students with industry professionals for a 3-month learning journey.",
      image: "/DEVCON_intership.png"
    },
    {
      title: "She is DEVCON",
      description: "Supporting and empowering women in the tech industry through workshops, networking events, and mentorship.",
      image: "/She_is_DEVCON.jpg"
    },
    {
      title: "Code Camp",
      description: "Intensive coding bootcamps that prepare participants for the demands of the tech industry.",
      image: "/DEVCON_codecamp.png"
    }
  ];

  // Chapters data
  const chapterLocations = [
    { region: "Luzon", cities: ["Manila", "Quezon City", "Baguio", "Batangas", "Cavite", "Laguna"] },
    { region: "Visayas", cities: ["Cebu", "Iloilo", "Bacolod", "Tacloban", "Dumaguete"] },
    { region: "Mindanao", cities: ["Davao", "Cagayan de Oro", "General Santos", "Zamboanga", "Butuan"] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-devcon-background via-[#2A2F3D] to-[#7E22CE]/80">
      <header className="fixed w-full z-50 backdrop-blur-sm bg-devcon-background/70 border-b border-white/10">
        <div className="flex items-center justify-between p-4 md:p-6 lg:px-12 max-w-7xl mx-auto">
          <DevconLogo className="scale-125" />
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <a 
              onClick={() => scrollToSection('about')} 
              className="text-white/80 hover:text-white transition-colors cursor-pointer relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-devcon-yellow after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              About Us
            </a>
            <a 
              onClick={() => scrollToSection('initiatives')} 
              className="text-white/80 hover:text-white transition-colors cursor-pointer relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-devcon-yellow after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              Our Initiatives
            </a>
            <a 
              onClick={() => scrollToSection('chapters')} 
              className="text-white/80 hover:text-white transition-colors cursor-pointer relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-devcon-yellow after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              Chapters
            </a>
            <a 
              onClick={() => scrollToSection('contact')} 
              className="text-white/80 hover:text-white transition-colors cursor-pointer relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-devcon-yellow after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              Contact Us
            </a>
          </nav>
          <Button 
            onClick={handleStartChat} 
            className="bg-devcon-yellow/90 hover:bg-devcon-yellow text-black font-medium text-sm py-2 h-auto group transition-all duration-300"
          >
            Ask Our AI Assistant
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="px-6 py-32 md:py-36 lg:py-40 max-w-7xl mx-auto transition-all duration-500 opacity-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1 bg-devcon-purple/40 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-2">
              Est. 2009 • 15 Years of Excellence
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              WELCOME TO DEVCON'S
              <span className="bg-gradient-to-r from-devcon-yellow to-devcon-orange bg-clip-text text-transparent"> MENTORSHIP AND TRAINING</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl">
              Kickstart your journey in tech with DEVCON. As an intern, you'll explore real projects, connect with mentors, and grow your skills in a collaborative environment.
            </p>
            <div className="pt-4">
              <Button 
                onClick={handleStartChat}
                className="bg-devcon-yellow hover:bg-devcon-yellow/90 text-black font-bold text-lg px-8 py-6 h-auto group transition-all duration-300 hover:shadow-[0_0_15px_rgba(248,210,53,0.5)]"
              >
                <span>ASK OUR AI ASSISTANT</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="pt-4">
              <a onClick={() => scrollToSection('about')} className="text-white/60 hover:text-white underline text-sm transition-colors cursor-pointer">
                Discover how DEVCON started
              </a>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-devcon-purple/80 to-devcon-purple/50 rounded-2xl p-6 backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="aspect-[4/3] relative overflow-hidden rounded-lg mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-devcon-purple/60 to-devcon-background/80"></div>

            {/* DEVCON logo */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <DevconLogo className="scale-[2.5]" />
            </div>

            {/* Tag top right */}
            <div className="absolute top-4 right-4 bg-devcon-yellow text-black px-3 py-1 rounded-full font-bold text-sm animate-pulse z-10">
              we are fifteen
            </div>

            {/* Your new image under the logo */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <img
                src="/devcon-event-banner.png"
                alt="Event Scene"
                className="w-full h-full object-cover opacity-30"
              />
            </div>
          </div>
            
            <Carousel className="w-full">
              <CarouselContent>
              {['event1.png', 'event2.png', 'event3.png'].map((img, i) => (
                <CarouselItem key={i} className="basis-1/3">
                  <Card className="group relative overflow-hidden aspect-video rounded-xl border border-white/5">
                    <CardContent className="p-0 aspect-video">
                      <img
                        src={`/${img}`}
                        alt={`Event ${i + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 backdrop-blur-sm bg-devcon-purple/40 group-hover:backdrop-blur-0 group-hover:bg-transparent transition-all duration-300">
                        
                      </div>
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

      {/* About Us Section */}
      <section id="about" ref={aboutRef} className="px-6 py-24 max-w-7xl mx-auto opacity-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-full bg-devcon-yellow text-black">
            <Info size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">About Us</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="text-white/80 space-y-4">
              <p className="text-lg">
                Developers Connect (DEVCON) is the premier organization of professional developers in the Philippines. It was founded in 2009 to create a sustainable community of developers and innovators across the country.
              </p>
              <p>
                For 15 years, we've been building connections between students, professionals, and tech companies, fostering knowledge exchange and professional growth through various initiatives.
              </p>
              <p>
                Our mission is to empower Filipino developers through education, community building, and industry connections. We believe in creating equal opportunities for everyone in tech, regardless of background.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h4 className="text-xl font-bold text-devcon-yellow">Our Vision</h4>
                <p className="text-white/80 mt-2">A thriving, world-class Filipino developer community.</p>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h4 className="text-xl font-bold text-devcon-yellow">Our Mission</h4>
                <p className="text-white/80 mt-2">To connect and empower developers across the Philippines.</p>
              </div>
            </div>
          </div>
          <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-devcon-purple/80 to-devcon-background/50 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1522071501257-f2f764640b85?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                alt="DevCon Community" 
                className="w-full h-full object-cover object-center opacity-60 mix-blend-overlay"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <DevconLogo className="mb-6 scale-150" />
                <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl">
                  <p className="text-white/90 text-lg font-medium">Building the Future of Philippine Tech</p>
                  <p className="text-devcon-yellow font-bold mt-2">Since 2009</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Initiatives Section */}
      <section id="initiatives" ref={initiativesRef} className="px-6 py-24 max-w-7xl mx-auto opacity-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-full bg-devcon-yellow text-black">
            <Lightbulb size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Our Initiatives</h2>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-white/80 text-lg">
            We run various programs and initiatives aimed at educating, connecting, and empowering the Filipino developer community. Here are some of our flagship initiatives:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {initiatives.map((initiative, index) => (
            <div 
              key={index} 
              className="rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all group hover:shadow-lg hover:shadow-purple-900/20"
            >
              <div className="aspect-[16/9] relative overflow-hidden">
                <img 
                  src={initiative.image} 
                  alt={initiative.title} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">{initiative.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-white/80">{initiative.description}</p>
                <div className="mt-4">
                  <Button variant="ghost" className="px-0 text-devcon-yellow hover:text-devcon-yellow/80 hover:bg-transparent">
                    Learn more
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-devcon-yellow/20 to-devcon-purple/20 rounded-xl border border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Want to collaborate on an initiative?</h3>
              <p className="text-white/80 mt-2">We're always open to partnerships that help the developer community.</p>
            </div>
            <Button 
              onClick={() => scrollToSection('contact')}
              className="bg-white text-black hover:bg-white/90 font-bold"
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </section>

      {/* Chapters Section */}
      <section id="chapters" ref={chaptersRef} className="px-6 py-24 max-w-7xl mx-auto opacity-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-full bg-devcon-yellow text-black">
            <MapPin size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Our Chapters</h2>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-white/80 text-lg">
            DEVCON has established chapters across the Philippines to ensure we reach and support developers nationwide. Find your local chapter and join our community!
          </p>
        </div>

        <Tabs defaultValue="luzon" className="w-full">
          <TabsList className="w-full flex justify-center mb-6">
            {chapterLocations.map((location) => (
              <TabsTrigger key={location.region} value={location.region.toLowerCase()}>
                {location.region}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {chapterLocations.map((location) => (
            <TabsContent key={location.region} value={location.region.toLowerCase()}>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-devcon-yellow mb-4">{location.region} Chapters</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {location.cities.map((city, index) => (
                    <div 
                      key={index} 
                      className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center transition-colors"
                    >
                      <p className="text-white font-medium">{city}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-devcon-background to-devcon-purple/30 border border-white/10">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">Don't see a chapter in your area?</h3>
            <p className="text-white/80 mt-2 mb-6">Help us expand DEVCON's reach by starting a new chapter.</p>
            <Button className="bg-devcon-yellow hover:bg-devcon-yellow/90 text-black font-bold">
              Start a Chapter
              <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" ref={contactRef} className="px-6 py-24 max-w-7xl mx-auto opacity-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-full bg-devcon-yellow text-black">
            <Mail size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Contact Us</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Get in Touch</h3>
            <p className="text-white/80">
              Have questions or want to collaborate with us? Reach out to DEVCON through any of these channels:
            </p>
            
            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-white/10 text-devcon-yellow">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Email</p>
                  <p className="text-white font-medium">hello@devcon.ph</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-white/10 text-devcon-yellow">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Address</p>
                  <p className="text-white font-medium">The Orient Square, Pasig City, Philippines</p>
                </div>
              </div>

              <div className="pt-4">
                <h4 className="text-white font-bold mb-3">Connect With Us</h4>
                <div className="flex gap-4">
                  <a href="#" className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-devcon-yellow transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                    </svg>
                  </a>
                  <a href="#" className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-devcon-yellow transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                    </svg>
                  </a>
                  <a href="#" className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-devcon-yellow transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Send Us a Message</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 text-sm">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-devcon-yellow/50"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-devcon-yellow/50"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-white/80 text-sm">Subject</label>
                <input 
                  type="text" 
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-devcon-yellow/50"
                  placeholder="How can we help?"
                />
              </div>
              
              <div>
                <label className="text-white/80 text-sm">Message</label>
                <textarea 
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 mt-1 text-white h-32 focus:outline-none focus:ring-2 focus:ring-devcon-yellow/50"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <Button className="w-full bg-devcon-yellow hover:bg-devcon-yellow/90 text-black font-bold">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <DevconLogo className="scale-100" />
              <p className="text-white/60 mt-4 max-w-md">
                Developers Connect Philippines (DEVCON) is the premier community of developers and innovators in the Philippines.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <p className="text-white/60">© {new Date().getFullYear()} DEVCON. All rights reserved.</p>
              <div className="flex gap-4 mt-4">
                <a href="#" className="text-white/60 hover:text-devcon-yellow transition-colors">Privacy Policy</a>
                <a href="#" className="text-white/60 hover:text-devcon-yellow transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
