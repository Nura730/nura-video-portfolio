import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Trust() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      const label = section.querySelector(".proof-label");
      const headingLines =
        section.querySelectorAll(".proof-heading-line");
      const card = section.querySelector(".proof-card");
      const cardContent =
        section.querySelectorAll(".proof-card-content");
      const stats =
        section.querySelectorAll(".proof-stat");
      const button = section.querySelector(".proof-button");

      gsap.set(label, {
        y: 25,
        opacity: 0,
      });

      gsap.set(headingLines, {
        y: 80,
        opacity: 0,
      });

      gsap.set(card, {
        y: 70,
        opacity: 0,
        scale: 0.98,
      });

      gsap.set(cardContent, {
        y: 25,
        opacity: 0,
      });

      gsap.set(stats, {
        y: 15,
        opacity: 0,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          toggleActions: "play none none reverse",
        },
        defaults: {
          ease: "power4.out",
        },
      });

      timeline
        .to(label, {
          y: 0,
          opacity: 1,
          duration: 0.6,
        })
        .to(
          headingLines,
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.12,
          },
          "-=0.25"
        )
        .to(
          card,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.35"
        )
        .to(
          cardContent,
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.08,
          },
          "-=0.45"
        )
        .to(
          stats,
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
          },
          "-=0.3"
        );

      const handleEnter = () => {
        gsap.to(card, {
          y: -6,
          duration: 0.45,
          ease: "power3.out",
        });

        gsap.to(button, {
          x: 6,
          borderColor: "#ff6314",
          color: "#ff6314",
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const handleLeave = () => {
        gsap.to(card, {
          y: 0,
          duration: 0.5,
          ease: "power3.out",
        });

        gsap.to(button, {
          x: 0,
          borderColor: "",
          color: "",
          duration: 0.35,
          ease: "power2.out",
        });
      };

      card?.addEventListener("mouseenter", handleEnter);
      card?.addEventListener("mouseleave", handleLeave);

      return () => {
        card?.removeEventListener("mouseenter", handleEnter);
        card?.removeEventListener("mouseleave", handleLeave);
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="proof-section"
      id="proof"
      ref={sectionRef}
    >
      <div className="proof-container">

        <div className="proof-label">
          06 / PROOF
        </div>

        <h2 className="proof-heading">
          <span className="proof-heading-line">
            Work that speaks.
          </span>

          <span className="proof-heading-line">
            Proof over promises.
          </span>
        </h2>

        <article className="proof-card">

          <div className="proof-card-content">

            <div className="proof-client">
              TRIPXPLO
            </div>

            <h3>
              Travel & social content
            </h3>

            <p>
              Edited short-form videos for Instagram and
              social media, focusing on pacing, storytelling,
              captions, sound and retention.
            </p>

          </div>

          <div className="proof-card-side">

            <a
              href="#work"
              className="proof-button"
            >
              VIEW WORK
              <span>↗</span>
            </a>

            <div className="proof-status">
              <span className="proof-status-dot" />
              REAL CLIENT WORK
            </div>

          </div>

          <div className="proof-stats">

            <span className="proof-stat">
              SOCIAL CONTENT
            </span>

            <span className="proof-stat">
              SHORT-FORM EDITING
            </span>

            <span className="proof-stat">
              10+ EDITS
            </span>

          </div>

        </article>

      </div>
    </section>
  );
}