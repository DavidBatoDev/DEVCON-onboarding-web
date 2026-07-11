import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DevconLogo from "@/components/DevconLogo";
import {
  ArrowRight,
  ArrowUp,
  ClipboardCheck,
  BookOpen,
  Wrench,
  MessagesSquare,
  ShieldCheck,
  Clock,
  MessageSquare,
  Search,
  Sparkles,
  Mail,
  MapPin,
} from "lucide-react";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Reveal-on-scroll for any element tagged with data-reveal
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleStartChat = () => {
    navigate("/chat");
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { id: "features", label: "Features" },
    { id: "how-it-works", label: "How it works" },
    { id: "community", label: "Community" },
    { id: "contact", label: "Contact" },
  ];

  const stats = [
    { value: "15+", label: "Years serving devs" },
    { value: "11+", label: "Chapters nationwide" },
    { value: "100K+", label: "Community members" },
    { value: "50+", label: "Events every year" },
  ];

  const features = [
    {
      icon: ClipboardCheck,
      title: "Onboarding checklists",
      description:
        "Step-by-step checklists so new officers always know what to do next.",
    },
    {
      icon: BookOpen,
      title: "Guides & best practices",
      description:
        "Proven playbooks for running events, growing membership, and leading well.",
    },
    {
      icon: Wrench,
      title: "Tools & templates",
      description:
        "Ready-made templates and the right tools to keep your chapter organized.",
    },
    {
      icon: MessagesSquare,
      title: "Instant Q&A",
      description:
        "Ask anything about your role and get a clear answer in seconds.",
    },
    {
      icon: ShieldCheck,
      title: "From official sources",
      description:
        "Every answer is grounded in official DEVCON HQ and chapter documents.",
    },
    {
      icon: Clock,
      title: "Available 24/7",
      description:
        "Your onboarding companion is ready whenever you need it — day or night.",
    },
  ];

  const steps = [
    {
      icon: MessageSquare,
      title: "Ask a question",
      description:
        "Type anything about your role as a DEVCON chapter officer.",
    },
    {
      icon: Search,
      title: "DEBBIE searches the sources",
      description:
        "She looks through official DEVCON HQ and chapter resources for you.",
    },
    {
      icon: Sparkles,
      title: "Get a clear, sourced answer",
      description:
        "Receive a concise reply with links to the documents behind it.",
    },
  ];

  // Community showcase — bento gallery of real DEVCON photos
  const showcase = [
    {
      title: "DEVCON Climate Summit",
      caption: "The flagship gathering of the Philippines' largest tech community.",
      image: "/summit.jpg",
      className: "sm:col-span-2",
    },
    {
      title: "Code Camp",
      caption: "Intensive bootcamps that prepare devs for the industry.",
      image: "/ICP_Codecamp.jpg",
      className: "",
    },
    {
      title: "DEVCON Internship",
      caption: "Connecting students with industry mentors.",
      image: "/DEVCON_intership.png",
      className: "",
    },
    {
      title: "She is DEVCON",
      caption: "Championing women in technology.",
      image: "/She_is_DEVCON.jpg",
      className: "",
    },
    {
      title: "Our interns",
      caption: "The next generation of Filipino developers.",
      image: "/devcon-interns.png",
      className: "",
    },
  ];

  const chapterLocations = [
    { region: "Luzon", cities: ["Manila", "Laguna", "Pampanga", "Legazpi"] },
    { region: "Visayas", cities: ["Cebu", "Iloilo", "Bacolod"] },
    {
      region: "Mindanao",
      cities: ["Davao", "Cagayan de Oro", "Bukidnon", "Iligan"],
    },
  ];

  const socialPaths = [
    "M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z",
    "M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z",
    "M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 md:px-8">
          <DevconLogo />
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <Button onClick={handleStartChat} size="sm" className="group">
            Ask DEBBIE
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </header>

      {/* Hero — centered */}
      <section className="relative overflow-hidden px-6 pb-16 pt-32 md:pt-40">
        {/* subtle accent glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] max-w-[140%] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
        />
        <div
          data-reveal
          className="section-fade-in mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <button
            onClick={handleStartChat}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
            Meet DEBBIE — the DEVCON Officer Assistant
            <ArrowRight className="h-3 w-3" />
          </button>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            Lead a stronger DEVCON
            <br />
            chapter with{" "}
            <span className="text-primary">DEBBIE</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Your AI onboarding assistant for chapter officers — instant answers,
            checklists, and best practices pulled straight from official DEVCON
            resources.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={handleStartChat} size="lg" className="group">
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollToSection("how-it-works")}
            >
              See how it works
            </Button>
          </div>
        </div>

        {/* Chat-preview mockup */}
        <div
          data-reveal
          className="section-fade-in mx-auto mt-14 w-full max-w-2xl"
        >
          <div className="rounded-2xl border border-border bg-card p-2 shadow-sm">
            {/* window bar */}
            <div className="flex items-center justify-between rounded-t-xl border-b border-border bg-card/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-secondary text-xs font-semibold">
                  D
                </span>
                <span className="text-sm font-medium">DEBBIE</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
              </div>
            </div>

            {/* messages */}
            <div className="space-y-5 px-4 py-6 sm:px-6">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-secondary px-4 py-2.5 text-left text-[15px] leading-7">
                  What's on the new officer onboarding checklist?
                </div>
              </div>
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-xs font-semibold">
                  D
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[15px] leading-7 text-foreground/90">
                    Great question! Here's the essential onboarding checklist for
                    new chapter officers:
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[15px] leading-7 text-foreground/90">
                    <li className="flex gap-2">
                      <span className="text-primary">1.</span> Join the official
                      officers' workspace
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">2.</span> Review your chapter
                      handbook
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">3.</span> Set your first
                      quarter goals
                    </li>
                  </ul>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-sm font-medium">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    View Document
                  </div>
                </div>
              </div>
            </div>

            {/* faux composer */}
            <div className="px-4 pb-4 sm:px-6">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2.5">
                <span className="flex-1 text-[15px] text-muted-foreground">
                  Message DEBBIE…
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ArrowUp className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / trust band */}
      <section className="px-6 py-12">
        <div
          data-reveal
          className="section-fade-in mx-auto max-w-5xl rounded-2xl border border-border bg-card"
        >
          <p className="border-b border-border px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Backed by DEVCON · the Philippines' premier developer community
          </p>
          <div className="grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="px-6 py-6 text-center"
              >
                <p className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div data-reveal className="section-fade-in mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Everything you need to lead your chapter
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
            DEBBIE turns scattered onboarding docs into clear, instant guidance —
            so you can focus on building your community.
          </p>
        </div>

        <div
          data-reveal
          className="section-fade-in mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-ring/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                <feature.icon size={20} />
              </div>
              <h3 className="mt-4 font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <div data-reveal className="section-fade-in mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Answers in three simple steps
          </h2>
        </div>

        <div
          data-reveal
          className="section-fade-in relative mt-12 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                  <step.icon size={20} />
                </div>
                <span className="text-4xl font-semibold tracking-tight text-border">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Community showcase */}
      <section id="community" className="mx-auto max-w-6xl px-6 py-20">
        <div data-reveal className="section-fade-in max-w-2xl">
          <p className="text-sm font-medium text-primary">Community</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Part of the DEVCON community
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
            DEBBIE is built on 15 years of programs, events, and initiatives that
            have shaped the Filipino developer community.
          </p>
        </div>

        <div
          data-reveal
          className="section-fade-in mt-10 grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {showcase.map((item, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-xl border border-border ${item.className}`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-0.5 text-xs leading-5 text-white/70">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About DEVCON (condensed) */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div
          data-reveal
          className="section-fade-in grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center"
        >
          <div>
            <p className="text-sm font-medium text-primary">About DEVCON</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              The premier developer community in the Philippines
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
              Founded in 2009, DevConnect (DEVCON) builds a sustainable community
              of developers and innovators nationwide — connecting students,
              professionals, and tech companies through knowledge exchange and
              hands-on initiatives.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="font-semibold text-foreground">Our Vision</h4>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A technology-empowered Philippines for all.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="font-semibold text-foreground">Our Mission</h4>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                To create vibrant communities of software developers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters (compact) */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div data-reveal className="section-fade-in max-w-2xl">
          <p className="text-sm font-medium text-primary">Nationwide</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Chapters across the Philippines
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
            Find your local chapter and join a community of developers near you.
          </p>
        </div>

        <div data-reveal className="section-fade-in mt-8">
          <Tabs defaultValue="luzon" className="w-full">
            <TabsList className="mb-6">
              {chapterLocations.map((location) => (
                <TabsTrigger
                  key={location.region}
                  value={location.region.toLowerCase()}
                >
                  {location.region}
                </TabsTrigger>
              ))}
            </TabsList>

            {chapterLocations.map((location) => (
              <TabsContent
                key={location.region}
                value={location.region.toLowerCase()}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {location.cities.map((city, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border bg-card px-3 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {city}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-12">
        <div
          data-reveal
          className="section-fade-in relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 text-center"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[300px] w-[600px] max-w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]"
          />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Ready to lead your chapter?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-muted-foreground">
              Get instant, reliable answers to every onboarding question — start
              chatting with DEBBIE now.
            </p>
            <Button
              onClick={handleStartChat}
              size="lg"
              className="group mt-7"
            >
              Ask DEBBIE
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl px-6 py-20">
        <div
          data-reveal
          className="section-fade-in grid grid-cols-1 gap-12 md:grid-cols-2"
        >
          <div>
            <p className="text-sm font-medium text-primary">Contact</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Get in touch
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
              Have questions or want to collaborate? Reach out to DEVCON through
              any of these channels.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">hello@devcon.ph</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium text-foreground">
                    The Orient Square, Pasig City, Philippines
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-3 font-medium text-foreground">Connect with us</h4>
              <div className="flex gap-3">
                {socialPaths.map((d, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d={d} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold tracking-tight text-foreground">
              Send us a message
            </h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Juan Dela Cruz"
                    onChange={(e) => {
                      if (e.target.value.toLowerCase() === "reembed") {
                        navigate("/admin/reembed");
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="juan@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Subject</label>
                <input
                  type="text"
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Message</label>
                <textarea
                  className="mt-1.5 h-32 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Your message here…"
                />
              </div>

              <Button type="submit" className="w-full">
                Send message
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <DevconLogo />
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
                DEBBIE is the official onboarding assistant for DEVCON chapter
                officers.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Product</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    How it works
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleStartChat}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Ask DEBBIE
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">DEVCON</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => scrollToSection("community")}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Community
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Connect</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} DEVCON. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="transition-colors hover:text-foreground">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
