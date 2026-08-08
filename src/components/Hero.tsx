import { useLayoutEffect, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const reelRef = useRef<HTMLDivElement | null>(null);
  const reelInnerRef = useRef<HTMLDivElement | null>(null);

  // ─────────────────────────────
  // HERO GSAP ANIMATIONS
  // ─────────────────────────────
  useLayoutEffect(() => {
    const hero = heroRef.current;

    if (!hero) return;

    const ctx = gsap.context(() => {
      const intro = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      intro
        // Small orange label
        .from(".hero-label", {
          y: 30,
          opacity: 0,
          duration: 0.7,
        })

        // Main typography
        .from(
          ".hero-title-line",
          {
            yPercent: 120,
            opacity: 0,
            duration: 1.1,
            stagger: 0.12,
          },
          "-=0.3"
        )

        // Description
        .from(
          ".hero-description",
          {
            y: 25,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.45"
        )

        // Buttons
        .from(
          ".hero-actions",
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.45"
        )

        // Availability
        .from(
          ".hero-availability",
          {
            y: 15,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.35"
        )

        // Reel card
        .from(
          ".hero-reel",
          {
            x: 100,
            y: 20,
            opacity: 0,
            scale: 0.92,
            rotate: 2,
            duration: 1.1,
            ease: "power3.out",
          },
          "-=0.9"
        );

      // Hero scroll animation
      gsap.to(".hero-content", {
        yPercent: -10,
        opacity: 0.75,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Reel floating animation
      gsap.to(".hero-reel", {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5,
      });

      // Reel scroll movement
      gsap.to(".hero-reel", {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Primary button hover
      const primaryButton = hero.querySelector(
        ".hero-primary-button"
      );

      if (primaryButton) {
        primaryButton.addEventListener("mouseenter", () => {
          gsap.to(primaryButton, {
            y: -4,
            duration: 0.25,
            ease: "power2.out",
          });
        });

        primaryButton.addEventListener("mouseleave", () => {
          gsap.to(primaryButton, {
            y: 0,
            duration: 0.25,
            ease: "power2.out",
          });
        });
      }
    }, hero);

    return () => ctx.revert();
  }, []);

  // ─────────────────────────────
  // REEL 3D MOUSE INTERACTION
  // ─────────────────────────────
  useEffect(() => {
    const reel = reelRef.current;
    const inner = reelInnerRef.current;

    if (!reel || !inner) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = reel.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 5;
      const rotateX = ((centerY - y) / centerY) * 5;

      gsap.to(reel, {
        rotateX,
        rotateY,
        duration: 0.5,
        ease: "power3.out",
      });

      gsap.to(inner, {
        x: ((x - centerX) / centerX) * 8,
        y: ((y - centerY) / centerY) * 8,
        duration: 0.5,
        ease: "power3.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(reel, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.to(inner, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    };

    reel.addEventListener("mousemove", handleMouseMove);
    reel.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      reel.removeEventListener("mousemove", handleMouseMove);
      reel.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-content">

        {/* LEFT CONTENT */}
        <div className="hero-left">

          <div className="hero-label">
            VIDEO EDITOR
          </div>

          <div className="hero-title">
            <div className="hero-title-line">
              &amp; CREATIVE
            </div>

            <div className="hero-title-line">
              STORYTELLER
            </div>
          </div>

          <p className="hero-description">
            I turn raw footage into engaging reels, travel stories
            and social content built to hold attention.
          </p>

          <div className="hero-actions">

            <a
              href="#work"
              className="hero-primary-button"
            >
              VIEW MY WORK ↗
            </a>

            <a
              href="#contact"
              className="hero-secondary-button"
              data-magnetic
            >
              LET&apos;S TALK
            </a>

          </div>

          <div className="hero-availability">
            AVAILABLE FOR FREELANCE PROJECTS
          </div>

        </div>

        {/* REEL CARD */}
        <div
          className="hero-reel"
          ref={reelRef}
        >

          <div className="reel-frame">

            <div
              className="reel-inner"
              ref={reelInnerRef}
            >

              <div className="reel-placeholder">
                PLAY REEL
              </div>

              <button
                className="reel-arrow"
                type="button"
              >
                ↗
              </button>

            </div>

          </div>

          <div className="reel-info">

            <span>
              SELECTED WORK
            </span>

            <strong>
              10+ reels · travel · social
            </strong>

          </div>

        </div>

      </div>

      <div className="hero-scroll">
        SCROLL ↓
      </div>

    </section>
  );
}