import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

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

      gsap.to(".hero-reel", {
  y: -8,
  duration: 3,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
  delay: 1.5,
});

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
    }, hero);

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

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} id="home" className="hero">
      <div className="hero-content">

        <div className="hero-left">

          <div className="hero-label">
            VIDEO EDITOR
          </div>

          <div className="hero-title">
            <div className="hero-title-line">
              & CREATIVE
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
  href="#work"
  className="hero-secondary-button"
  data-magnetic
>
              LET'S TALK
            </a>
          </div>

          <div className="hero-availability">
            AVAILABLE FOR FREELANCE PROJECTS
          </div>

        </div>

        <div
  className="hero-reel"
  data-magnetic
>
          <div className="reel-frame">
            <div className="reel-inner">
              <div className="reel-placeholder">
                <span>PLAY REEL</span>
              </div>

              <button
                className="reel-arrow"
                aria-label="Play reel"
              >
                ↗
              </button>
            </div>
          </div>

          <div className="reel-info">
            <span>SELECTED WORK</span>

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