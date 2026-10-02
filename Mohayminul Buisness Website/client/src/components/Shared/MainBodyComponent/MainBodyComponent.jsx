import React, { useEffect, useRef, useState } from "react";
import {
  Code2,
  Search,
  Rocket,
  MessageCircle,
  ArrowRight,
  Quote,
  ShieldCheck,
  Clock,
  Wallet,
  Headphones,
  LineChart,
  ChevronDown,
  Target,
  Layers,
  Heart,
  Sparkles,
  Zap,
  Globe,
  ShoppingBag,
  BarChart3,
  CheckCircle2,
  Star,
  MousePointer2,
} from "lucide-react";

/* =========================================================
   THEME
========================================================= */

const C = {
  navy900: "#04081A",
  brandNavy: "#000F44",
  purple: "#9502FC",
  purpleLight: "#B94BFF",
  purpleSoft: "#D6AEFF",
  lavender: "#F6F4FC",
  panel: "#FFFFFF",
  mint: "#34D399",
  slate600: "#5B6478",
  slate400: "#8890A6",
  border: "#E7E3F3",
};

/* =========================================================
   SCROLL REVEAL
========================================================= */

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );

    obs.observe(el);

    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/* =========================================================
   GLOBAL ANIMATION STYLE
========================================================= */

// Smooth bottom-to-top scroll reveal
const useRevealOnScroll = () => {
  useEffect(() => {
    const elements = document.querySelectorAll(
      ".reveal-up, .mobile-card-reveal-left, .mobile-card-reveal-right",
    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);
};

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');

      * {
        box-sizing: border-box;
      }

      @keyframes marquee {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-50%);
        }
      }

      @keyframes marqueeRev {
        from {
          transform: translateX(-50%);
        }
        to {
          transform: translateX(0);
        }
      }

      @keyframes fadeUp {
        from {
          opacity: 0;
          transform: translateY(24px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes floatSlow {
        0%, 100% {
          transform: translate3d(0, 0, 0);
        }
        50% {
          transform: translate3d(0, -18px, 0);
        }
      }

      @keyframes pulseGlow {
        0%, 100% {
          opacity: .45;
          transform: scale(1);
        }
        50% {
          opacity: .85;
          transform: scale(1.08);
        }
      }

      @keyframes gradientMove {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }

      @keyframes shine {
        0% {
          transform: translateX(-150%) skewX(-20deg);
        }
        100% {
          transform: translateX(250%) skewX(-20deg);
        }
      }

      @keyframes borderRotate {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes scan {
        0% {
          top: 0%;
          opacity: 0;
        }
        10% {
          opacity: .8;
        }
        90% {
          opacity: .8;
        }
        100% {
          top: 100%;
          opacity: 0;
        }
      }

      @keyframes orbit {
        from {
          transform: rotate(0deg) translateX(85px) rotate(0deg);
        }
        to {
          transform: rotate(360deg) translateX(85px) rotate(-360deg);
        }
      }

      @keyframes scalePulse {
        0%, 100% {
          transform: scale(.92);
          opacity: .5;
        }
        50% {
          transform: scale(1.05);
          opacity: 1;
        }
      }

      @keyframes chartDraw {
        from {
          stroke-dashoffset: 500;
        }
        to {
          stroke-dashoffset: 0;
        }
      }

      @keyframes dotPulse {
        0%, 100% {
          transform: scale(1);
          opacity: .5;
        }
        50% {
          transform: scale(1.7);
          opacity: 1;
        }
      }

      .marquee-track {
        animation: marquee 28s linear infinite;
      }

      .marquee-track-rev {
        animation: marqueeRev 34s linear infinite;
      }

      .float-icon {
        animation: float 4s ease-in-out infinite;
      }

      .float-slow {
        animation: floatSlow 6s ease-in-out infinite;
      }

      .pulse-glow {
        animation: pulseGlow 4s ease-in-out infinite;
      }

      .gradient-flow {
        background-size: 250% 250%;
        animation: gradientMove 7s ease infinite;
      }

      .shine-btn {
        position: relative;
        overflow: hidden;
      }

      .shine-btn::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 35%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255,255,255,.45),
          transparent
        );
        transform: translateX(-150%) skewX(-20deg);
      }

      .shine-btn:hover::after {
        animation: shine .75s ease;
      }

      .glass-card {
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
      }

      .hover-card {
        transition:
          transform .35s ease,
          box-shadow .35s ease,
          border-color .35s ease;
      }

      .hover-card:hover {
        transform: translateY(-8px);
        box-shadow:
          0 24px 60px rgba(0, 15, 68, .10),
          0 0 0 1px rgba(149,2,252,.08);
      }

      .icon-box {
        transition:
          transform .35s ease,
          box-shadow .35s ease;
      }

      .hover-card:hover .icon-box {
        transform: rotate(-5deg) scale(1.08);
        box-shadow: 0 12px 30px rgba(149,2,252,.22);
      }

      .orbit {
        animation: orbit 12s linear infinite;
      }

      .scale-pulse {
        animation: scalePulse 3s ease-in-out infinite;
      }

      .scan-line {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(185,75,255,.7),
          transparent
        );
        animation: scan 5s linear infinite;
      }

      .chart-line {
        stroke-dasharray: 500;
        stroke-dashoffset: 500;
        animation: chartDraw 2.2s ease forwards .4s;
      }

      .dot-pulse {
        animation: dotPulse 2s ease-in-out infinite;
      }

    
  /* =========================================
     Smooth Scroll Reveal - Bottom to Top
     ========================================= */
  .reveal-up {
    opacity: 0;
    transform: translate3d(0, 46px, 0);
    filter: blur(4px);
    transition:
      opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.8s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.8s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform, filter;
  }

  .reveal-up.is-visible {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    filter: blur(0);
  }

  .reveal-delay-1 { transition-delay: 0.05s; }
  .reveal-delay-2 { transition-delay: 0.15s; }
  .reveal-delay-3 { transition-delay: 0.25s; }
  .reveal-delay-4 { transition-delay: 0.35s; }


  /* =========================================
     Main card reveal on mobile
     Alternates left/right + rises from below
     ========================================= */
  @media (max-width: 767px) {
    .mobile-card-reveal-left,
    .mobile-card-reveal-right {
      opacity: 0 !important;
      filter: blur(4px);
      will-change: opacity, transform, filter;
      transition:
        opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.8s cubic-bezier(0.22, 1, 0.36, 1),
        filter 0.8s cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Even cards: enter from left + below */
    .mobile-card-reveal-left {
      transform: translate3d(-55px, 55px, 0) scale(0.96) !important;
    }

    /* Odd cards: enter from right + below */
    .mobile-card-reveal-right {
      transform: translate3d(55px, 55px, 0) scale(0.96) !important;
    }

    .mobile-card-reveal-left.is-visible,
    .mobile-card-reveal-right.is-visible {
      opacity: 1 !important;
      transform: translate3d(0, 0, 0) scale(1) !important;
      filter: blur(0);
    }
  }


  @media (max-width: 767px) {
    .mobile-card-reveal-left:nth-child(1),
    .mobile-card-reveal-right:nth-child(1) { transition-delay: 0s; }

    .mobile-card-reveal-left:nth-child(2),
    .mobile-card-reveal-right:nth-child(2) { transition-delay: 0.06s; }

    .mobile-card-reveal-left:nth-child(3),
    .mobile-card-reveal-right:nth-child(3) { transition-delay: 0.12s; }

    .mobile-card-reveal-left:nth-child(4),
    .mobile-card-reveal-right:nth-child(4) { transition-delay: 0.18s; }

    .mobile-card-reveal-left:nth-child(5),
    .mobile-card-reveal-right:nth-child(5) { transition-delay: 0.24s; }

    .mobile-card-reveal-left:nth-child(6),
    .mobile-card-reveal-right:nth-child(6) { transition-delay: 0.30s; }
  }

  @media (prefers-reduced-motion: reduce) {
    .mobile-card-reveal-left,
    .mobile-card-reveal-right {
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
      transition: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal-up {
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
      transition: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
        .marquee-track,
        .marquee-track-rev,
        .float-icon,
        .float-slow,
        .pulse-glow,
        .gradient-flow,
        .orbit,
        .scale-pulse,
        .scan-line,
        .chart-line,
        .dot-pulse {
          animation: none !important;
        }

        .hover-card {
          transition: none !important;
        }
      }
    `}</style>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({ eyebrow, title, description, light = false }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{
            fontFamily: "Inter, sans-serif",
            color: light ? "#D6AEFF" : C.purple,
            background: light ? "rgba(149,2,252,.14)" : "rgba(149,2,252,.07)",
            border: light
              ? "1px solid rgba(185,75,255,.25)"
              : "1px solid rgba(149,2,252,.12)",
          }}
        >
          <Sparkles size={13} />
          {eyebrow}
        </div>
      )}

      <h2
        className="text-3xl sm:text-4xl lg:text-[42px] leading-tight font-bold reveal-up reveal-delay-2"
        style={{
          fontFamily: "Poppins, sans-serif",
          color: light ? "#fff" : C.brandNavy,
        }}
      >
        {title}
      </h2>

      {description && (
        <p
          className="mt-4 text-lg leading-relaxed reveal-up reveal-delay-3"
          style={{
            fontFamily: "Inter, sans-serif",
            color: light ? "#B9C0D4" : C.slate600,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   TECH MARQUEE
========================================================= */

function TechMarquee() {
  const stack = [
    "React",
    "Node.js",
    "WordPress",
    "Shopify",
    "Next.js",
    "Laravel",
    "WooCommerce",
    "MongoDB",
    "Google Ads",
    "Google Analytics",
  ];

  const row = [...stack, ...stack];

  return (
    <section
      className="py-12 border-b relative overflow-hidden"
      style={{ borderColor: C.border }}
    >
      {/* background glow */}
      <div
        className="absolute w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "rgba(149,2,252,.06)",
          left: "-120px",
          top: "-120px",
        }}
      />

      <p
        className="text-center text-sm mb-7 relative z-10 reveal-up reveal-delay-1"
        style={{
          fontFamily: "Inter, sans-serif",
          color: C.slate400,
        }}
      >
        Built with the tools serious businesses run on
      </p>

      <div className="overflow-hidden relative max-w-6xl mx-auto">
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-28 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${C.lavender}, transparent)`,
          }}
        />

        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-28 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(270deg, ${C.lavender}, transparent)`,
          }}
        />

        <div className="marquee-track flex w-max gap-5">
          {row.map((tech, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 px-5 py-3 rounded-xl whitespace-nowrap transition-all duration-300"
              style={{
                background: "rgba(255,255,255,.7)",
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(149,2,252,.08)",
                  color: C.purple,
                }}
              >
                <Code2 size={15} />
              </div>

              <span
                className="text-sm font-semibold"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  color: C.brandNavy,
                }}
              >
                {tech}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   STATS
========================================================= */

function useCountUp(target, active, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let start = null;
    let raf;

    const step = (timestamp) => {
      if (start === null) start = timestamp;

      const progress = Math.min((timestamp - start) / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return value;
}

function StatsSection() {
  const [ref, inView] = useInView(0.25);

  const stats = [
    { value: 1150, suffix: "+", label: "Projects delivered", icon: Rocket },
    { value: 100, suffix: "%", label: "Client satisfaction", icon: Heart },
    { value: 100, suffix: "+", label: "Sites ranked on Google", icon: Search },
    { value: 12, suffix: "+", label: "Years building online", icon: Globe },
  ];

  return (
    <section className="px-6 sm:px-10 lg:px-14 py-8 relative overflow-hidden">
      <style>{`
        @keyframes statBlobBreathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.25); opacity: 0.9; }
        }
        @keyframes statRingPulse {
          0% { box-shadow: 0 0 0 0 rgba(149,2,252,0.35); }
          70% { box-shadow: 0 0 0 12px rgba(149,2,252,0); }
          100% { box-shadow: 0 0 0 0 rgba(149,2,252,0); }
        }
        .stat-blob { animation: statBlobBreathe 7s ease-in-out infinite; }
        .stat-card {
          transition: transform .4s cubic-bezier(.2,.8,.2,1), box-shadow .4s ease, border-color .4s ease;
        }
        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 45px -18px rgba(149,2,252,0.35);
          border-color: rgba(149,2,252,0.45) !important;
        }
        .stat-icon-box {
          transition: transform .45s cubic-bezier(.34,1.56,.64,1);
          animation: statRingPulse 2.6s ease-out infinite;
        }
        .stat-card:hover .stat-icon-box {
          transform: rotate(-8deg) scale(1.12);
        }
        .stat-progress {
          height: 3px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #000F44, #9502FC);
          width: 22%;
          transition: width .6s cubic-bezier(.2,.8,.2,1);
        }
        .stat-card:hover .stat-progress { width: 100%; }
        .stat-sparkle {
          transition: transform .5s ease, opacity .5s ease;
        }
        .stat-card:hover .stat-sparkle {
          transform: rotate(90deg) scale(1.2);
          opacity: 0.8 !important;
        }
      `}</style>

      <div
        className="stat-blob absolute top-1/2 left-1/2 w-[500px] h-[300px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(149,2,252,.10)" }}
      />

      <div
        ref={ref}
        className="relative max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {stats.map((stat, i) => {
          const count = useCountUp(stat.value, inView);
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="mobile-card-reveal-left stat-card relative overflow-hidden rounded-3xl p-6 sm:p-7"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,.95), rgba(250,248,255,.8))",
                border: `1px solid ${C.border}`,
                opacity: inView ? 1 : 0,
                transform: inView
                  ? "translateY(0) scale(1)"
                  : "translateY(25px) scale(0.96)",
                transition: `
                  opacity .65s ease ${i * 0.1}s,
                  transform .65s cubic-bezier(.2,.8,.2,1) ${i * 0.1}s
                `,
              }}
            >
              <div
                className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl"
                style={{ background: "rgba(149,2,252,.08)" }}
              />

              <div className="relative flex items-center justify-between">
                <div
                  className="mobile-card-reveal-right stat-icon-box w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #000F44, #9502FC)",
                  }}
                >
                  <Icon size={20} color="#fff" />
                </div>

                <Sparkles
                  size={17}
                  color={C.purple}
                  className="stat-sparkle opacity-40"
                />
              </div>

              <div
                className="relative mt-6 text-4xl sm:text-5xl font-bold"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  color: C.brandNavy,
                }}
              >
                {count}
                <span style={{ color: C.purple }}>{stat.suffix}</span>
              </div>

              <div
                className="relative mt-2 text-sm"
                style={{ fontFamily: "Inter, sans-serif", color: C.slate600 }}
              >
                {stat.label}
              </div>

              <div className="stat-progress mt-4" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================
   WHY CHOOSE US
========================================================= */

function WhyChooseUs() {
  const [ref, inView] = useInView(0.12);

  const items = [
    {
      icon: Code2,
      title: "Hand-built, not templated",
      desc: "Every site is coded for your business — no generic drag-and-drop template pretending to be custom.",
    },
    {
      icon: LineChart,
      title: "SEO from day one",
      desc: "Search optimization isn't an add-on later; it's part of how the site is structured from the start.",
    },
    {
      icon: Wallet,
      title: "Transparent pricing",
      desc: "You know the full cost before we start — no hidden fees once the project is underway.",
    },
    {
      icon: Clock,
      title: "Fast, realistic timelines",
      desc: "We agree on a launch date up front and build to it, with regular updates along the way.",
    },
    {
      icon: ShieldCheck,
      title: "Secure by default",
      desc: "SSL, backups, and safe payment handling are standard on every site and store we build.",
    },
    {
      icon: Headphones,
      title: "Support after launch",
      desc: "Going live isn't the finish line — we stay on for fixes, updates, and questions.",
    },
  ];

  return (
    <section className="px-6 sm:px-10 lg:px-20 py-24 relative">
      <div
        className="absolute right-0 top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "rgba(149,2,252,.045)",
        }}
      />

      <div
        ref={ref}
        className="relative max-w-6xl mx-auto reveal-up reveal-delay-1"
      >
        <SectionTitle
          eyebrow="WHY CHOOSE US"
          title="Why businesses stick with us"
          description="Not just a developer — a partner who's still around after launch."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="mobile-card-reveal-left hover-card group rounded-3xl p-7 relative overflow-hidden"
                style={{
                  background: C.panel,
                  border: `1px solid ${C.border}`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(20px)",
                  transition: `
                    opacity .55s ease ${i * 0.08}s,
                    transform .55s ease ${i * 0.08}s,
                    box-shadow .35s ease
                  `,
                }}
              >
                <div
                  className="absolute right-0 top-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "rgba(149,2,252,.12)",
                  }}
                />

                <div
                  className="icon-box relative w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(149,2,252,.1), rgba(0,15,68,.08))",
                    color: C.purple,
                  }}
                >
                  <Icon size={23} strokeWidth={2} />
                </div>

                <h3
                  className="relative mt-5 text-lg font-semibold"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: C.brandNavy,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  className="relative mt-3 text-[15px] leading-relaxed"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: C.slate600,
                  }}
                >
                  {item.desc}
                </p>

                <div
                  className="mt-6 h-px w-10 group-hover:w-20 transition-all duration-500"
                  style={{
                    background: "linear-gradient(90deg, #9502FC, transparent)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PROCESS
========================================================= */

function ProcessSection() {
  const [ref, inView] = useInView(0.15);

  const steps = [
    {
      number: "01",
      icon: MessageCircle,
      title: "We talk about your goals",
      desc: "You tell us what you're building and who it's for. No jargon, just a plan.",
    },
    {
      number: "02",
      icon: Code2,
      title: "We design & build it",
      desc: "Clean, fast, mobile-ready — built by hand for what your business needs.",
    },
    {
      number: "03",
      icon: Search,
      title: "We optimize for Google",
      desc: "SEO built in so the site is structured to rank and convert.",
    },
    {
      number: "04",
      icon: Rocket,
      title: "We launch & support you",
      desc: "You go live, and we stay reachable for updates and what comes next.",
    },
  ];

  return (
    <section
      className="px-6 sm:px-10 lg:px-12 py-8 md:py-20 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 15% 20%, rgba(149,2,252,.18), transparent 28%), #000F44",
      }}
    >
      {/* animated glow */}
      <div
        className="pulse-glow absolute -right-20 top-20 w-72 h-72 rounded-full blur-3xl"
        style={{
          background: "rgba(149,2,252,.18)",
        }}
      />

      <div
        className="pulse-glow absolute -left-20 bottom-0 w-64 h-64 rounded-full blur-3xl"
        style={{
          background: "rgba(52,211,153,.07)",
          animationDelay: "1.2s",
        }}
      />

      <div ref={ref} className="relative max-w-6xl mx-auto">
        <SectionTitle
          eyebrow="OUR PROCESS"
          title="How we get you there"
          description="Four steps, one point of contact, no surprises along the way."
          light
        />

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* connecting line */}
          <div
            className="hidden lg:block absolute top-8 left-[7%] right-[7%] h-px overflow-hidden"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(185,75,255,.5), transparent)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: inView ? "100%" : "0%",
                background: "linear-gradient(90deg, #9502FC, #B94BFF)",
                transition: "width 1.6s ease .3s",
              }}
            />
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="relative"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(25px)",
                  transition: `
                    opacity .65s ease ${i * 0.13}s,
                    transform .65s ease ${i * 0.13}s
                  `,
                }}
              >
                <div
                  className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #9502FC, #B94BFF)",
                    boxShadow: "0 15px 40px rgba(149,2,252,.35)",
                  }}
                >
                  <Icon size={25} color="#fff" />
                </div>

                <div
                  className="mt-5 text-xs font-bold tracking-[.18em]"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: "#B94BFF",
                  }}
                >
                  STEP {step.number}
                </div>

                <h3
                  className="mt-2 text-lg font-semibold text-white"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  className="mt-3 text-[15px] leading-relaxed"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: "#B9C0D4",
                  }}
                >
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MISSION
========================================================= */

function MissionSection() {
  const [ref, inView] = useInView(0.2);

  const cols = [
    {
      icon: Heart,
      label: "WHY",
      title: "Every business deserves to be found online",
      desc: "We started this to give small and growing businesses the same quality web presence that big companies pay agencies a fortune for.",
    },
    {
      icon: Layers,
      label: "WHAT",
      title: "Full-service web & software delivery",
      desc: "Business websites, online stores, custom software, and the SEO to get them ranked — under one roof, one team.",
    },
    {
      icon: Target,
      label: "HOW",
      title: "Direct access, real accountability",
      desc: "You talk to the people actually building your project — not an account manager relaying messages between departments.",
    },
  ];

  return (
    <section className="px-6 sm:px-10 lg:px-14 py-8 relative overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none"
        style={{
          transform: "translate(-50%, -50%)",
          background: "rgba(149,2,252,.035)",
        }}
      />

      <div ref={ref} className="relative max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <SectionTitle
            eyebrow="OUR MISSION"
            title="What drives how we work"
            description="The principles behind every website, store and software product we build."
          />
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {cols.map((col, i) => {
            const Icon = col.icon;

            return (
              <div
                key={col.label}
                className="mobile-card-reveal-left hover-card group rounded-3xl p-8 text-center relative overflow-hidden"
                style={{
                  background: C.panel,
                  border: `1px solid ${C.border}`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(20px)",
                  transition: `
                    opacity .6s ease ${i * 0.12}s,
                    transform .6s ease ${i * 0.12}s,
                    box-shadow .35s ease
                  `,
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 0%, rgba(149,2,252,.08), transparent 45%)",
                  }}
                />

                <div
                  className="icon-box float-icon relative mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #000F44, #9502FC)",
                    animationDelay: `${i * 0.35}s`,
                    boxShadow: "0 15px 35px rgba(0,15,68,.15)",
                  }}
                >
                  <Icon size={26} color="#fff" />
                </div>

                <div
                  className="relative mt-6 text-xs font-bold tracking-[.2em]"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: C.purple,
                  }}
                >
                  {col.label}
                </div>

                <h3
                  className="relative mt-3 text-lg font-semibold"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    color: C.brandNavy,
                  }}
                >
                  {col.title}
                </h3>

                <p
                  className="relative mt-3 text-[15px] leading-relaxed"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    color: C.slate600,
                  }}
                >
                  {col.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TESTIMONIALS
========================================================= */

/* ---------------- testimonial wall (two-row marquee) ---------------- */
function TestimonialWall() {
  const rowA = [
    {
      name: "Rafiq Hasan",
      role: "Owner, Dhaka Leather Co.",
      text: "Our store started showing up on Google within weeks. Online orders now outpace our physical shop.",
    },
    {
      name: "Sultana Akter",
      role: "Founder, Aroma Bites",
      text: "They handled design, build, and getting us ranked. We just approved designs and answered questions.",
    },
    {
      name: "Imran Chowdhury",
      role: "CEO, BuildRight Tools",
      text: "Fast communication, and the site loads fast too. Our bounce rate dropped noticeably after launch.",
    },
    {
      name: "Nusrat Jahan",
      role: "Owner, Nusrat's Boutique",
      text: "First time going online for my shop. They made it simple and the results came faster than I expected.",
    },
  ];

  const rowB = [
    {
      name: "Kamal Ahmed",
      role: "Director, Ahmed Traders",
      text: "Our custom inventory software finally talks to our online store. No more manual updates.",
    },
    {
      name: "Farhana Islam",
      role: "Founder, Farhana Organics",
      text: "SEO work alone brought us to page one for our main keywords in under three months.",
    },
    {
      name: "Shakil Rahman",
      role: "Owner, Rahman Electronics",
      text: "Support after launch has been genuinely responsive — not the usual silence once you've paid.",
    },
    {
      name: "Tania Sultana",
      role: "CEO, Tania's Kitchen",
      text: "The e-commerce site they built handles our order volume without a single hiccup during sales.",
    },
  ];

  const Row = ({ items, reverse }) => {
    const doubled = [...items, ...items];

    return (
      <div className="overflow-hidden relative">
        <div
          className={
            reverse
              ? "marquee-track-rev flex w-max gap-6"
              : "marquee-track flex w-max gap-6"
          }
        >
          {doubled.map((testimonial, i) => (
            <div
              key={i}
              className="mobile-card-reveal-left w-[320px] shrink-0 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: C.panel,
                border: `1px solid ${C.border}`,
              }}
            >
              {/* Quote Icon */}
              <div className="flex items-center justify-between">
                <Quote size={20} color={C.purple} strokeWidth={2.2} />

                {/* Small Rating */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="text-sm"
                      style={{ color: C.purple }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Review */}
              <p
                className="mt-3 text-[15px] leading-relaxed"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: C.slate600,
                }}
              >
                "{testimonial.text}"
              </p>

              {/* Reviewer Profile */}
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                  style={{
                    background: C.brandNavy,
                  }}
                >
                  {testimonial.name.charAt(0)}
                </div>

                {/* Name + Role */}
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      color: C.brandNavy,
                    }}
                  >
                    {testimonial.name}
                  </p>

                  <p
                    className="text-xs mt-0.5"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      color: C.slate400,
                    }}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="py-8" style={{ background: C.lavender }}>
      {/* Section Heading */}
      <div className="px-6 sm:px-10 lg:px-20 max-w-2xl mx-auto text-center mb-14">
        <h2
          className="text-3xl sm:text-4xl font-bold reveal-up reveal-delay-1"
          style={{
            fontFamily: "Poppins, sans-serif",
            color: C.brandNavy,
          }}
        >
          Real businesses, real results
        </h2>

        <p
          className="mt-4 text-lg"
          style={{
            fontFamily: "Inter, sans-serif",
            color: C.slate600,
          }}
        >
          A few of the people we've built websites, stores, and software for.
        </p>
      </div>

      {/* Testimonial Rows */}
      <div className="space-y-4 relative">
        {/* Side Fade */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background: `linear-gradient(
              90deg,
              ${C.lavender} 0%,
              transparent 6%,
              transparent 94%,
              ${C.lavender} 100%
            )`,
          }}
        />

        <Row items={rowA} />
        <Row items={rowB} reverse />
      </div>
    </section>
  );
}

/* =========================================================
   FAQ
========================================================= */

function FAQ() {
  const faqs = [
    {
      q: "How long does a typical website take?",
      a: "A business website usually takes 2–3 weeks. E-commerce stores and custom software take 4–8 weeks depending on features.",
    },
    {
      q: "Can people find my website by searching its name on Google?",
      a: "Yes. This is included in our SEO service. We optimize your website for Google indexing and brand-name searches, so when someone searches for your website or brand name on Google, your website can appear in the search results and be easily found.",
    },
    {
      q: "Do you build custom websites and web applications?",
      a: "Yes. We build all types of professional websites and web applications from scratch using custom code, tailored to your specific business needs. We use modern, industry-standard technologies and programming languages similar to those used to build large-scale platforms such as Facebook, YouTube, Amazon, and Daraz. Our custom-coded websites are scalable, secure, and easy to maintain, allowing you to add new features, make changes, and update your website or web application whenever needed in the future.",
    },
    {
      q: "Do you provide support and guidance before and after completing the project?",
      a: "Absolutely. We believe in clear communication and complete transparency throughout every project. Before starting the work, we clearly discuss the requirements, features, timeline, and other important details with the client. After completing the project, we properly explain and hand over the website or web application, so you can understand how everything works. If you face any issues or need help in the future, our team is always ready to provide support and respond as quickly as possible.",
    },
    {
      q: "Do you handle SEO too, or just google search optimization?",
      a: "Both are separate services. We build SEO-ready structure into every site and can also manage ongoing SEO or google search optimization. ",
    },
    {
      q: "Can you redesign my existing website?",
      a: "Yes — we can rebuild an existing site with better performance, design, and SEO while keeping what already works.",
    },
    {
      q: "What happens after the site launches?",
      a: "You get a support window for fixes and small updates, plus the option of an ongoing maintenance plan.",
    },
  ];

  const [open, setOpen] = useState(0);
  const [ref, inView] = useInView(0.15);

  return (
    <section className="px-6 sm:px-10 lg:px-12 py-8 relative">
      <div
        className="absolute left-1/2 top-1/2 w-96 h-64 rounded-full blur-3xl pointer-events-none"
        style={{
          transform: "translate(-50%, -50%)",
          background: "rgba(149,2,252,.035)",
        }}
      />

      <div ref={ref} className="relative max-w-3xl mx-auto">
        <div className="text-center">
          <SectionTitle
            eyebrow="FAQ"
            title="Common questions"
            description="Everything you need to know before starting your project."
          />
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = open === i;

            return (
              <div
                key={faq.q}
                className="mobile-card-reveal-left rounded-2xl overflow-hidden hover-card"
                style={{
                  background: C.panel,
                  border: `1px solid ${
                    isOpen ? "rgba(149,2,252,.28)" : C.border
                  }`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(12px)",
                  transition: `
                    opacity .5s ease ${i * 0.07}s,
                    transform .5s ease ${i * 0.07}s,
                    border-color .3s ease,
                    box-shadow .35s ease
                  `,
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{
                        background: isOpen
                          ? "linear-gradient(135deg, #9502FC, #B94BFF)"
                          : "rgba(149,2,252,.08)",
                        color: isOpen ? "#fff" : C.purple,
                      }}
                    >
                      0{i + 1}
                    </span>

                    <span
                      className="font-semibold"
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        color: C.brandNavy,
                      }}
                    >
                      {faq.q}
                    </span>
                  </div>

                  <ChevronDown
                    size={19}
                    color={C.purple}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform .3s ease",
                      flexShrink: 0,
                    }}
                  />
                </button>

                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transition:
                      "grid-template-rows .4s cubic-bezier(.4,0,.2,1)",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <p
                      className="px-6 pb-6 pl-[4.5rem] text-[15px] leading-relaxed"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        color: C.slate600,
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CLOSING CTA
========================================================= */

function ClosingCTA() {
  const [ref, inView] = useInView(0.25);

  return (
    <section className="px-6 sm:px-10 lg:px-14 py-8">
      <div
        ref={ref}
        id="contact"
        className="max-w-6xl mx-auto rounded-[2rem] px-7 py-16 sm:px-14 lg:px-20 sm:py-20 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #000F44 0%, #170645 50%, #9502FC 130%)",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "opacity .8s ease, transform .8s ease",
          boxShadow: "0 30px 80px rgba(0,15,68,.18)",
        }}
      >
        {/* background grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)
            `,
            backgroundSize: "45px 45px",
          }}
        />

        {/* glow */}
        <div
          className="pulse-glow absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "rgba(185,75,255,.35)",
          }}
        />

        <div
          className="pulse-glow absolute -left-20 -bottom-32 w-72 h-72 rounded-full blur-3xl"
          style={{
            background: "rgba(52,211,153,.12)",
            animationDelay: "1s",
          }}
        />

        {/* orbit */}
        <div
          className="absolute hidden md:block right-24 top-1/2 w-40 h-40 rounded-full"
          style={{
            transform: "translateY(-50%)",
            border: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <div
            className="orbit absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
            style={{
              margin: "-6px",
              background: "#B94BFF",
              boxShadow: "0 0 20px #B94BFF",
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold reveal-up reveal-delay-1"
            style={{
              color: "#D6AEFF",
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.12)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <Zap size={13} />
            READY TO BUILD?
          </div>

          <h2
            className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
            style={{
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Have a project
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #fff, #D6AEFF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              in mind?
            </span>
          </h2>

          <p
            className="mt-5 text-lg max-w-2xl leading-relaxed"
            style={{
              fontFamily: "Inter, sans-serif",
              color: "#B9C0D4",
            }}
          >
            Tell us about it. We'll help you turn it into a site or product
            that's ready to bring in customers.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="#"
              className="shine-btn inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold hover:-translate-y-1 transition-transform duration-300"
              style={{
                background: "#fff",
                color: C.brandNavy,
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 12px 35px rgba(0,0,0,.18)",
              }}
            >
              Let's talk about your project
              <ArrowRight size={18} />
            </a>

            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold hover:bg-white/10 transition-all duration-300"
              style={{
                color: "#fff",
                border: "1px solid rgba(255,255,255,.18)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <MousePointer2 size={17} />
              See our work
            </a>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            {[
              "No hidden fees",
              "Fast communication",
              "Post-launch support",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm"
                style={{
                  color: "#C8CDE0",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <CheckCircle2 size={15} color={C.mint} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MainBodyComponent() {
  useRevealOnScroll();

  return (
    <main
      style={{
        background: C.lavender,
        overflow: "hidden",
      }}
    >
      <GlobalStyle />

      <TechMarquee />

      <StatsSection />

      <WhyChooseUs />

      <ProcessSection />

      <MissionSection />

      <TestimonialWall />

      <FAQ />

      <ClosingCTA />
    </main>
  );
}
