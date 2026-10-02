import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  Search,
  Code2,
  Database,
  Globe,
  Layers,
  Terminal,
  Cpu,
  Sparkles,
  Zap,
  MousePointer2,
} from "lucide-react";

const C = {
  navy900: "#04081A",
  navy800: "#080F26",
  brandNavy: "#000F44",
  purple: "#9502FC",
  purpleLight: "#B94BFF",
  purpleSoft: "#D6AEFF",
  mint: "#34D399",
  slate300: "#AEB6CE",
  white: "#FFFFFF",
};

const BG_ICONS = [
  { Icon: Code2, top: "12%", left: "6%", size: 30, dur: 7, delay: 0 },
  { Icon: Database, top: "68%", left: "10%", size: 26, dur: 8.5, delay: 0.6 },
  { Icon: Globe, top: "22%", left: "92%", size: 28, dur: 6.5, delay: 0.3 },
  { Icon: Layers, top: "78%", left: "88%", size: 24, dur: 9, delay: 0.9 },
  { Icon: Terminal, top: "48%", left: "3%", size: 22, dur: 7.5, delay: 1.1 },
  { Icon: Cpu, top: "8%", left: "78%", size: 24, dur: 8, delay: 0.4 },
  { Icon: Sparkles, top: "35%", left: "84%", size: 20, dur: 6, delay: 1 },
];

export default function Banner() {
  const { t, i18n } = useTranslation();

  const [wordIndex, setWordIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const heroRef = useRef(null);

  /*
   * Translation-এর উপর ভিত্তি করে rotating words
   */
  const ROTATING_WORDS = [
    t("E-commerce Website"),
    t("Business Websites"),
    t("Web Applications"),
    t("Online Stores"),
    t("Business Software"),
  ];

  /*
   * Language change হলে rotating word আবার প্রথম থেকে শুরু হবে
   */
  useEffect(() => {
    setWordIndex(0);
  }, [i18n.language]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2800);

    return () => clearInterval(id);
  }, [ROTATING_WORDS.length, i18n.language]);

  const handleMouseMove = (e) => {
    const el = heroRef.current;

    if (!el) return;

    const rect = el.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setMouse({ x, y });
  };

  /*
   * Translation badges
   */
  const badges = [
    t("E-commerce & Business Websites"),
    t("Company Websites Software"),
    t("EO-Friendly Website"),
    t("Fast Delivery"),
    t("24/7 support"),
    t("Any Type of Website or Software"),
  ];

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        overflow: "hidden",
        background: `
          radial-gradient(
            900px 600px at 85% -5%,
            rgba(149,2,252,0.30),
            transparent 65%
          ),
          radial-gradient(
            700px 500px at -10% 90%,
            rgba(0,15,68,0.9),
            transparent 65%
          ),
          radial-gradient(
            500px 400px at 55% 35%,
            rgba(149,2,252,0.08),
            transparent 70%
          ),
          linear-gradient(
            180deg,
            ${C.navy900},
            ${C.navy800}
          )
        `,
      }}
      className="w-full px-6 sm:px-10 lg:px-20 pt-14 pb-14 lg:pt-24 lg:pb-20"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');

        /* ================================
           ENTRY ANIMATION
        ================================= */

        @keyframes riseIn {
          from {
            opacity: 0;
            transform: translateY(24px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .reveal {
          animation: riseIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* ================================
           PREMIUM WORD TYPING
        ================================= */

        @keyframes typingReveal {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0;
            transform: translateY(8px);
          }

          15% {
            opacity: 1;
          }

          70% {
            clip-path: inset(0 0 0 0);
            opacity: 1;
            transform: translateY(0);
          }

          100% {
            clip-path: inset(0 0 0 0);
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientFlow {
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

        @keyframes cursorBlink {
          0%,
          45% {
            opacity: 1;
          }

          50%,
          100% {
            opacity: 0;
          }
        }

        .word-swap {
          display: inline-block;
          position: relative;

          background: linear-gradient(
            90deg,
            #ffffff 0%,
            ${C.purpleSoft} 25%,
            ${C.purple} 50%,
            ${C.purpleLight} 75%,
            #ffffff 100%
          );

          background-size: 250% auto;

          -webkit-background-clip: text;
          background-clip: text;

          -webkit-text-fill-color: transparent;

          animation:
            typingReveal 1.05s cubic-bezier(0.22, 1, 0.36, 1),
            gradientFlow 3s ease-in-out infinite;

          filter: drop-shadow(
            0 0 18px rgba(149, 2, 252, 0.35)
          );
        }

        .word-swap::after {
          content: "";
          display: inline-block;

          width: 3px;
          height: 0.9em;

          margin-left: 7px;

          vertical-align: -0.08em;

          background: ${C.purpleLight};

          border-radius: 3px;

          box-shadow:
            0 0 8px rgba(185, 75, 255, 0.8),
            0 0 18px rgba(149, 2, 252, 0.6);

          animation: cursorBlink 0.9s infinite;
        }

        /* ================================
           AURORA
        ================================= */

        @keyframes auroraMove {
          0% {
            transform:
              translate3d(-5%, -5%, 0)
              scale(1);
          }

          50% {
            transform:
              translate3d(8%, 5%, 0)
              scale(1.12);
          }

          100% {
            transform:
              translate3d(-5%, -5%, 0)
              scale(1);
          }
        }

        .aurora {
          animation:
            auroraMove
            12s
            ease-in-out
            infinite;
        }

        /* ================================
           MOVING LIGHT BEAM
        ================================= */

        @keyframes beamMove {
          0% {
            transform:
              translateX(-40%)
              rotate(-12deg);

            opacity: 0;
          }

          20% {
            opacity: 0.25;
          }

          60% {
            opacity: 0.12;
          }

          100% {
            transform:
              translateX(160%)
              rotate(-12deg);

            opacity: 0;
          }
        }

        .light-beam {
          animation:
            beamMove
            10s
            linear
            infinite;
        }

        /* ================================
           MOVING GRID
        ================================= */

        @keyframes gridMove {
          from {
            background-position:
              0 0,
              0 0;
          }

          to {
            background-position:
              60px 60px,
              60px 60px;
          }
        }

        .animated-grid {
          animation:
            gridMove
            18s
            linear
            infinite;
        }

        /* ================================
           GLOW ORB
        ================================= */

        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(1);
          }

          50% {
            opacity: 0.55;
            transform: scale(1.12);
          }
        }

        .glow {
          animation:
            pulseGlow
            6s
            ease-in-out
            infinite;
        }

        /* ================================
           FLOATING TECH ICONS
        ================================= */

        @keyframes drift {
          0%,
          100% {
            transform:
              translate(0, 0)
              rotate(0deg);
          }

          50% {
            transform:
              translate(12px, -18px)
              rotate(5deg);
          }
        }

        .bg-icon {
          animation:
            drift
            var(--dur)
            ease-in-out
            infinite;

          animation-delay:
            var(--delay);
        }

        /* ================================
           PARTICLES
        ================================= */

        @keyframes particleUp {
          0% {
            transform:
              translateY(0)
              scale(0.7);

            opacity: 0;
          }

          10% {
            opacity: 0.75;
          }

          90% {
            opacity: 0.35;
          }

          100% {
            transform:
              translateY(-420px)
              scale(1.2);

            opacity: 0;
          }
        }

        .particle {
          animation:
            particleUp
            linear
            infinite;
        }

        /* ================================
           FLOATING CARDS
        ================================= */

        @keyframes floatCard {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        .float-card-a {
          animation:
            floatCard
            5s
            ease-in-out
            infinite;
        }

        .float-card-b {
          animation:
            floatCard
            6s
            ease-in-out
            infinite
            0.8s;
        }

        .float-card-c {
          animation:
            floatCard
            5.5s
            ease-in-out
            infinite
            1.2s;
        }

        /* ================================
           BROWSER CONTENT
        ================================= */

        @keyframes typeLine1 {
          from {
            width: 0;
          }

          to {
            width: 78%;
          }
        }

        @keyframes typeLine2 {
          from {
            width: 0;
          }

          to {
            width: 55%;
          }
        }

        @keyframes typeLine3 {
          from {
            width: 0;
          }

          to {
            width: 66%;
          }
        }

        .line1 {
          animation:
            typeLine1
            1.4s
            ease
            0.6s
            both;
        }

        .line2 {
          animation:
            typeLine2
            1.4s
            ease
            1.1s
            both;
        }

        .line3 {
          animation:
            typeLine3
            1.4s
            ease
            1.6s
            both;
        }

        @keyframes blink {
          0%,
          45% {
            opacity: 1;
          }

          50%,
          95% {
            opacity: 0;
          }

          100% {
            opacity: 1;
          }
        }

        .caret {
          animation:
            blink
            1.1s
            step-end
            infinite;
        }

        /* ================================
           SKYLINE
        ================================= */

        @keyframes shimmerCity {
          0%,
          100% {
            opacity: 0.35;
          }

          50% {
            opacity: 0.75;
          }
        }

        .skyline-bar {
          animation:
            shimmerCity
            5s
            ease-in-out
            infinite;
        }

        /* ================================
           BADGE GLOW
        ================================= */

        @keyframes badgePulse {
          0%,
          100% {
            box-shadow:
              0 0 0 rgba(149, 2, 252, 0);
          }

          50% {
            box-shadow:
              0 0 25px rgba(149, 2, 252, 0.12);
          }
        }

        .hero-badge {
          animation:
            badgePulse
            4s
            ease-in-out
            infinite;
        }

        /* ================================
           REDUCED MOTION
        ================================= */

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation: none !important;
          }
        }

        /* ================================
           MOBILE
        ================================= */

        @media (max-width: 640px) {
          .word-swap::after {
            width: 2px;
            margin-left: 5px;
          }
        }
      `}</style>

      {/* ================================
          MOVING GRID
      ================================= */}

      <div
        aria-hidden
        className="animated-grid"
        style={{
          position: "absolute",
          inset: 0,

          backgroundImage: `
            linear-gradient(
              rgba(149,2,252,0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(149,2,252,0.045) 1px,
              transparent 1px
            )
          `,

          backgroundSize: "60px 60px",

          maskImage:
            "radial-gradient(ellipse 85% 75% at 55% 35%, black 25%, transparent 85%)",

          WebkitMaskImage:
            "radial-gradient(ellipse 85% 75% at 55% 35%, black 25%, transparent 85%)",

          pointerEvents: "none",
        }}
      />

      {/* ================================
          AURORA GLOW
      ================================= */}

      <div
        aria-hidden
        className="aurora"
        style={{
          position: "absolute",

          width: 650,
          height: 650,

          top: "-25%",
          left: "32%",

          borderRadius: "50%",

          background: `
            radial-gradient(
              circle,
              rgba(149,2,252,0.22) 0%,
              rgba(149,2,252,0.08) 35%,
              transparent 70%
            )
          `,

          filter: "blur(30px)",

          pointerEvents: "none",
        }}
      />

      {/* ================================
          MOVING LIGHT BEAM
      ================================= */}

      <div
        aria-hidden
        className="light-beam"
        style={{
          position: "absolute",

          top: "-40%",
          left: "-30%",

          width: "45%",
          height: "180%",

          background: `
            linear-gradient(
              90deg,
              transparent,
              rgba(185,75,255,0.12),
              rgba(255,255,255,0.08),
              transparent
            )
          `,

          filter: "blur(18px)",

          pointerEvents: "none",
        }}
      />

      {/* ================================
          AMBIENT GLOW ORB
      ================================= */}

      <div
        aria-hidden
        className="glow"
        style={{
          position: "absolute",

          top: "-10%",
          right: "4%",

          width: 480,
          height: 480,

          borderRadius: "9999px",

          background: `
            radial-gradient(
              circle,
              ${C.purple}66,
              transparent 70%
            )
          `,

          filter: "blur(8px)",

          pointerEvents: "none",
        }}
      />

      {/* ================================
          FLOATING PARTICLES
      ================================= */}

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              position: "absolute",

              left: `${(i * 6.3) % 100}%`,
              bottom: `${-10 - (i % 5) * 5}px`,

              width: i % 4 === 0 ? 4 : 3,
              height: i % 4 === 0 ? 4 : 3,

              borderRadius: "9999px",

              background:
                i % 3 === 0 ? C.purpleSoft : i % 3 === 1 ? C.mint : C.purple,

              boxShadow: "0 0 10px rgba(149,2,252,0.6)",

              animationDuration: `${9 + (i % 6) * 2}s`,

              animationDelay: `${(i % 8) * 1.1}s`,
            }}
          />
        ))}
      </div>

      {/* ================================
          FLOATING TECH ICONS
      ================================= */}

      {BG_ICONS.map(({ Icon, top, left, size, dur, delay }, i) => (
        <div
          key={i}
          className="bg-icon tech-glow hidden md:block"
          aria-hidden
          style={{
            position: "absolute",

            top,
            left,

            color: i % 2 === 0 ? C.purpleSoft : C.mint,

            opacity: 0.14,

            "--dur": `${dur}s`,
            "--delay": `${delay}s`,

            filter: "drop-shadow(0 0 12px rgba(149,2,252,0.45))",

            pointerEvents: "none",
          }}
        >
          <Icon size={size} strokeWidth={1.6} />
        </div>
      ))}

      {/* ================================
          MAIN CONTENT
      ================================= */}

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
        {/* ================================
            LEFT CONTENT
        ================================= */}

        <div>
          {/* BADGE */}

          {mounted && (
            <span
              className="reveal hero-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-7"
              style={{
                background: "rgba(149,2,252,0.14)",

                border: "1px solid rgba(149,2,252,0.45)",

                color: C.purpleSoft,

                fontFamily: "Inter, sans-serif",

                backdropFilter: "blur(10px)",

                boxShadow: "0 0 30px rgba(149,2,252,0.08)",
              }}
            >
              <Sparkles
                size={15}
                style={{
                  color: C.purpleLight,
                }}
              />

              {t("hero.badge")}
            </span>
          )}

          {/* ================================
              MAIN HEADING
          ================================= */}

          <h1
            className="reveal text-3xl leading-[42px] sm:text-5xl sm:leading-[56px] lg:text-[3rem] lg:leading-[90px] font-bold text-white tracking-tight"
            style={{
              fontFamily: "Poppins, sans-serif",
              animationDelay: "0.1s",
              minHeight: "2.2em",
            }}
          >
            <span className="block ">{t("hero.titleStart")}</span>
            <span
              key={`${i18n.language}-${wordIndex}`}
              className="word-swap py-2 lg:py-0  md:-top-3"
            >
              {ROTATING_WORDS[wordIndex]}
            </span>
            <span
              className="
    block 
    text-xl sm:text-2xl lg:text-3xl
    leading-7 sm:leading-9 lg:leading-[50px]
    bg-gradient-to-r from-white to-[#6b03ab]
    bg-clip-text text-transparent
  "
            >
              {t("hero.titleEnd")}
            </span>
          </h1>

          {/* ================================
              DESCRIPTION
          ================================= */}

          {/* ================================
              BUTTONS
          ================================= */}

          <div
            className="reveal mt-9 flex flex-col sm:flex-row gap-4"
            style={{
              animationDelay: "0.34s",
            }}
          >
            {/* START PROJECT */}

            <a
              href="#contact"
              className="group inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-1"
              style={{
                background: `
                  linear-gradient(
                    135deg,
                    ${C.purple},
                    ${C.purpleLight}
                  )
                `,

                fontFamily: "Inter, sans-serif",

                boxShadow: "0 12px 35px -10px rgba(149,2,252,0.7)",
              }}
            >
              {t("hero.startProject")}

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>

            {/* SEE WORK */}

            <a
              href="#services"
              className="group inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-1"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",

                background: "rgba(255,255,255,0.025)",

                backdropFilter: "blur(8px)",

                fontFamily: "Inter, sans-serif",
              }}
            >
              <MousePointer2
                size={17}
                className="transition-transform duration-300 group-hover:scale-110"
              />

              {t("hero.seeWork")}
            </a>
          </div>

          {/* ================================
              BADGES
          ================================= */}

          <div
            className="reveal mt-10 flex flex-wrap gap-x-6 gap-y-3"
            style={{
              animationDelay: "0.46s",
            }}
          >
            {badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-2 text-sm"
                style={{
                  color: C.slate300,

                  fontFamily: "Inter, sans-serif",
                }}
              >
                <CheckCircle2
                  size={16}
                  style={{
                    color: C.mint,

                    filter: "drop-shadow(0 0 6px rgba(52,211,153,0.6))",
                  }}
                />

                {b}
              </span>
            ))}
          </div>
        </div>

        {/* ================================
            RIGHT — BROWSER MOCKUP
        ================================= */}

        <div className="relative hidden lg:block h-[440px]">
          <div
            className="reveal"
            style={{
              animationDelay: "0.3s",

              transform: `
                translate(
                  ${mouse.x * 14}px,
                  ${mouse.y * 14}px
                )
              `,

              transition: "transform 0.2s ease-out",

              width: "100%",

              maxWidth: 480,

              margin: "0 auto",
            }}
          >
            {/* ================================
                BROWSER
            ================================= */}

            <div
              style={{
                background: "rgba(255,255,255,0.055)",

                border: "1px solid rgba(255,255,255,0.14)",

                borderRadius: 18,

                backdropFilter: "blur(14px)",

                boxShadow: `
                  0 30px 80px -25px
                  rgba(0,0,0,0.75),
                  0 0 50px
                  rgba(149,2,252,0.10)
                `,

                overflow: "hidden",
              }}
            >
              {/* Browser Header */}

              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.1)",

                  background: "rgba(0,0,0,0.12)",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "9999px",
                    background: "#FF6B6B",
                  }}
                />

                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "9999px",
                    background: "#FFC24B",
                  }}
                />

                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "9999px",
                    background: C.mint,
                  }}
                />

                <span
                  className="ml-3 text-xs px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.08)",

                    color: C.slate300,

                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t("hero.websiteUrl")}
                </span>
              </div>

              {/* Browser Content */}

              <div className="p-6 space-y-3">
                <div
                  className="line1 h-3 rounded"
                  style={{
                    background: `
                      linear-gradient(
                        90deg,
                        ${C.purpleLight},
                        ${C.purple}
                      )
                    `,

                    boxShadow: "0 0 20px rgba(149,2,252,0.25)",
                  }}
                />

                <div
                  className="line2 h-3 rounded"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                  }}
                />

                <div
                  className="line3 h-3 rounded"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                  }}
                />

                <span
                  className="caret inline-block"
                  style={{
                    width: 2,
                    height: 14,

                    background: C.purpleSoft,

                    verticalAlign: "middle",

                    boxShadow: "0 0 8px rgba(185,75,255,0.8)",
                  }}
                />

                <div className="pt-4 grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: 46,

                        borderRadius: 10,

                        background: "rgba(255,255,255,0.06)",

                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>

                {/* Mini stats */}

                <div className="pt-4 grid grid-cols-2 gap-3">
                  <div
                    style={{
                      height: 38,

                      borderRadius: 10,

                      background: "rgba(149,2,252,0.08)",

                      border: "1px solid rgba(149,2,252,0.14)",
                    }}
                  />

                  <div
                    style={{
                      height: 38,

                      borderRadius: 10,

                      background: "rgba(52,211,153,0.06)",

                      border: "1px solid rgba(52,211,153,0.12)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ================================
                GOOGLE CARD
            ================================= */}

            <div
              className="float-card-a"
              style={{
                position: "absolute",

                top: -26,
                right: -18,

                background: C.white,

                borderRadius: 14,

                padding: "10px 14px",

                display: "flex",

                alignItems: "center",

                gap: 8,

                boxShadow: "0 16px 30px -12px rgba(0,0,0,0.4)",
              }}
            >
              <TrendingUp size={16} color={C.mint} />

              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                  }}
                >
                  {t("hero.googleRanking")}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.brandNavy,
                  }}
                >
                  {t("hero.thisMonth")}
                </div>
              </div>
            </div>

            {/* ================================
                ORDER CARD
            ================================= */}

            <div
              className="float-card-b"
              style={{
                position: "absolute",

                bottom: -22,
                left: -22,

                background: C.white,

                borderRadius: 14,

                padding: "10px 14px",

                display: "flex",

                alignItems: "center",

                gap: 8,

                boxShadow: "0 16px 30px -12px rgba(0,0,0,0.4)",
              }}
            >
              <ShoppingBag size={16} color={C.purple} />

              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                  }}
                >
                  {t("hero.newOrder")}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.brandNavy,
                  }}
                >
                  {t("hero.orderReceived")}
                </div>
              </div>
            </div>

            {/* ================================
                SEO SCORE
            ================================= */}

            <div
              className="float-card-c"
              style={{
                position: "absolute",

                top: "42%",
                right: -40,

                background: `
                  linear-gradient(
                    135deg,
                    ${C.brandNavy},
                    ${C.purple}
                  )
                `,

                borderRadius: 9999,

                width: 66,
                height: 66,

                display: "flex",

                flexDirection: "column",

                alignItems: "center",

                justifyContent: "center",

                boxShadow: "0 16px 30px -10px rgba(149,2,252,0.6)",

                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              <Zap size={14} color="white" />

              <span
                style={{
                  fontFamily: "Poppins, sans-serif",

                  fontSize: 13,

                  fontWeight: 700,

                  color: "white",
                }}
              >
                98
              </span>

              <span
                style={{
                  fontSize: 7,

                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {t("hero.seoScore")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================
          SKYLINE
      ================================= */}

      <svg
        className="skyline-bar"
        aria-hidden
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",

          left: 0,
          right: 0,

          bottom: 0,

          width: "100%",

          height: 90,

          opacity: 0.6,

          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient id="skylineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.purple} stopOpacity="0.35" />

            <stop offset="100%" stopColor={C.navy900} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[
          [0, 40, 60, 60],
          [70, 55, 50, 45],
          [130, 20, 70, 80],
          [210, 60, 40, 40],
          [260, 35, 65, 65],
          [335, 50, 45, 50],
          [390, 15, 80, 85],
          [480, 45, 55, 55],
          [545, 60, 40, 40],
          [595, 25, 70, 75],
          [675, 50, 60, 50],
          [745, 40, 50, 60],
          [805, 20, 75, 80],
          [890, 55, 45, 45],
          [945, 35, 60, 65],
          [1015, 48, 50, 52],
          [1075, 18, 65, 82],
          [1150, 42, 50, 58],
        ].map(([x, y, w, h], i) => (
          <rect
            key={i}
            x={x}
            y={100 - h}
            width={w}
            height={h}
            fill="url(#skylineGrad)"
          />
        ))}
      </svg>
    </section>
  );
}
