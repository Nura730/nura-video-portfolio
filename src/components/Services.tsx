import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    number: "01",
    title: "SHORT-FORM REELS",
    description:
      "Instagram-ready edits built around pacing, hooks, captions and music.",
  },
  {
    number: "02",
    title: "TRAVEL CONTENT",
    description:
      "Cinematic cuts that turn locations and moments into a story.",
  },
  {
    number: "03",
    title: "SOCIAL CONTENT",
    description:
      "Clean, engaging edits designed for creators and brands.",
  },
  {
    number: "04",
    title: "TEXT & MOTION",
    description:
      "Typography-led edits, animated text and simple motion graphics.",
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
  const section = sectionRef.current;

  if (!section) return;

  const cleanupHandlers: Array<() => void> = [];

  const ctx = gsap.context(() => {
    // ─────────────────────────────
    // SECTION INTRO
    // ─────────────────────────────

    const intro = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        toggleActions: "play none none reverse",
      },
      defaults: {
        ease: "power4.out",
      },
    });

    intro
      .from(".services-label", {
        y: 25,
        opacity: 0,
        duration: 0.7,
      })
      .from(
        ".services-title",
        {
          y: 70,
          opacity: 0,
          duration: 1,
        },
        "-=0.35"
      );

    // ─────────────────────────────
    // SERVICE ROWS
    // ─────────────────────────────

    const rows = section.querySelectorAll<HTMLElement>(
      ".service-row"
    );

    rows.forEach((row) => {
      const number = row.querySelector<HTMLElement>(
        ".service-number"
      );

      const name = row.querySelector<HTMLElement>(
        ".service-name"
      );

      const description = row.querySelector<HTMLElement>(
        ".service-description"
      );

      const arrow = row.querySelector<HTMLElement>(
        ".service-arrow"
      );

      // Scroll reveal
      const rowTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });

      rowTimeline
        .from(row, {
          y: 45,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        })
        .from(
          number,
          {
            x: -25,
            opacity: 0,
            duration: 0.55,
            ease: "power3.out",
          },
          "-=0.55"
        )
        .from(
          name,
          {
            x: -35,
            opacity: 0,
            duration: 0.65,
            ease: "power3.out",
          },
          "-=0.45"
        )
        .from(
          description,
          {
            x: 20,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.45"
        )
        .from(
          arrow,
          {
            scale: 0,
            rotate: -45,
            opacity: 0,
            duration: 0.55,
            ease: "back.out(1.7)",
          },
          "-=0.45"
        );

      // ─────────────────────────────
      // HOVER
      // ─────────────────────────────

      const handleEnter = () => {
        gsap.to(row, {
          x: 8,
          duration: 0.45,
          ease: "power3.out",
        });

        gsap.to(number, {
          x: 5,
          color: "#ff6314",
          duration: 0.35,
          ease: "power2.out",
        });

        gsap.to(name, {
          x: 5,
          duration: 0.35,
          ease: "power2.out",
        });

        gsap.to(description, {
          x: 5,
          duration: 0.35,
          ease: "power2.out",
        });

        gsap.to(arrow, {
          x: 8,
          y: -4,
          rotate: 45,
          scale: 1.12,
          color: "#ff6314",
          duration: 0.45,
          ease: "power3.out",
        });
      };

      const handleLeave = () => {
        gsap.to(row, {
          x: 0,
          duration: 0.55,
          ease: "power3.out",
        });

        gsap.to(number, {
          x: 0,
          clearProps: "color",
          duration: 0.4,
          ease: "power2.out",
        });

        gsap.to(name, {
          x: 0,
          duration: 0.4,
          ease: "power2.out",
        });

        gsap.to(description, {
          x: 0,
          duration: 0.4,
          ease: "power2.out",
        });

        gsap.to(arrow, {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          clearProps: "color",
          duration: 0.55,
          ease: "power3.out",
        });
      };

      row.addEventListener("mouseenter", handleEnter);
      row.addEventListener("mouseleave", handleLeave);

      cleanupHandlers.push(() => {
        row.removeEventListener("mouseenter", handleEnter);
        row.removeEventListener("mouseleave", handleLeave);
      });
    });
  }, section);

  return () => {
    cleanupHandlers.forEach((cleanup) => cleanup());
    ctx.revert();
  };
}, []);

  return (
    <section
      className="services-section"
      id="services"
      ref={sectionRef}
    >
      <div className="services-container">

        <div className="services-intro">

          <div className="services-label">
            02 / SERVICES
          </div>

          <h2 className="services-title">
            What I can edit
            <br />
            for you.
          </h2>

        </div>

        <div className="services-list">

          {services.map((service) => (
            <div
              className="service-row"
              key={service.number}
            >
              <div className="service-number">
                {service.number}
              </div>

              <div className="service-name">
                {service.title}
              </div>

              <div className="service-description">
                {service.description}
              </div>

              <div className="service-arrow">
                ↗
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}