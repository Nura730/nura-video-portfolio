import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    number: "01",
    title: "SHORT-FORM VIDEO",
    meta: "REELS • SHORTS • VERTICAL",
    description:
      "Sharp, fast-paced edits built around strong hooks, clean captions, sound and viewer retention.",
  },
  {
    number: "02",
    title: "LONG-FORM VIDEO",
    meta: "YOUTUBE • INTERVIEWS • EXPLAINERS",
    description:
      "Structured edits that keep longer videos clear, engaging and easy to follow from start to finish.",
  },
  {
    number: "03",
    title: "SOCIAL & CREATOR CONTENT",
    meta: "CREATORS • BRANDS • SOCIAL",
    description:
      "Content shaped around your voice, audience and platform — without losing the personality behind it.",
  },
  {
    number: "04",
    title: "MOTION & VISUAL EDITING",
    meta: "TYPOGRAPHY • CAPTIONS • MOTION",
    description:
      "Typography, animated captions, transitions and visual details that give the edit more energy and identity.",
  },
];

const editingFocus = [
  "HOOKS",
  "PACING",
  "SOUND",
  "CAPTIONS",
  "MOTION",
  "STORY",
];

export default function Services() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      // --------------------------------
      // SECTION INTRO
      // --------------------------------

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
          y: 20,
          opacity: 0,
          duration: 0.65,
        })
        .from(
          ".services-title",
          {
            y: 65,
            opacity: 0,
            duration: 0.95,
          },
          "-=0.3"
        )
        .from(
          ".services-description",
          {
            y: 25,
            opacity: 0,
            duration: 0.65,
          },
          "-=0.5"
        );

      // --------------------------------
      // SERVICE ROW REVEAL
      // --------------------------------

      const rows =
        section.querySelectorAll<HTMLElement>(".service-row");

      gsap.from(rows, {
        y: 55,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".services-list",
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });

      // --------------------------------
      // FOCUS STRIP REVEAL
      // --------------------------------

      gsap.from(".services-focus", {
        y: 25,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".services-focus",
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });

      // --------------------------------
      // EXISTING HOVER INTERACTION
      // DO NOT CHANGE
      // --------------------------------

      rows.forEach((row) => {
        const number =
          row.querySelector<HTMLElement>(".service-number");

        const title =
          row.querySelector<HTMLElement>(".service-name");

        const description =
          row.querySelector<HTMLElement>(".service-description");

        const arrow =
          row.querySelector<HTMLElement>(".service-arrow");

        const meta =
          row.querySelector<HTMLElement>(".service-meta");

        const ghost =
          row.querySelector<HTMLElement>(".service-ghost-number");

        const handleEnter = () => {
          gsap.to(row, {
            x: 10,
            duration: 0.45,
            ease: "power3.out",
          });

          if (number) {
            gsap.to(number, {
              x: 5,
              color: "#ff6314",
              duration: 0.35,
              ease: "power2.out",
            });
          }

          if (title) {
            gsap.to(title, {
              x: 5,
              duration: 0.4,
              ease: "power3.out",
            });
          }

          if (description) {
            gsap.to(description, {
              x: 5,
              opacity: 1,
              duration: 0.4,
              ease: "power3.out",
            });
          }

          if (meta) {
            gsap.to(meta, {
              x: 5,
              color: "#ff6314",
              duration: 0.35,
              ease: "power2.out",
            });
          }

          if (arrow) {
            gsap.to(arrow, {
              x: 8,
              y: -4,
              rotate: 45,
              scale: 1.12,
              color: "#ff6314",
              duration: 0.45,
              ease: "power3.out",
            });
          }

          if (ghost) {
            gsap.to(ghost, {
              opacity: 0.055,
              x: 20,
              duration: 0.6,
              ease: "power3.out",
            });
          }
        };

        const handleLeave = () => {
          gsap.to(row, {
            x: 0,
            duration: 0.55,
            ease: "power3.out",
          });

          if (number) {
            gsap.to(number, {
              x: 0,
              clearProps: "color",
              duration: 0.4,
              ease: "power2.out",
            });
          }

          if (title) {
            gsap.to(title, {
              x: 0,
              duration: 0.4,
              ease: "power3.out",
            });
          }

          if (description) {
            gsap.to(description, {
              x: 0,
              duration: 0.4,
              ease: "power3.out",
            });
          }

          if (meta) {
            gsap.to(meta, {
              x: 0,
              clearProps: "color",
              duration: 0.4,
              ease: "power2.out",
            });
          }

          if (arrow) {
            gsap.to(arrow, {
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
              clearProps: "color",
              duration: 0.55,
              ease: "power3.out",
            });
          }

          if (ghost) {
            gsap.to(ghost, {
              opacity: 0,
              x: 0,
              duration: 0.45,
              ease: "power3.out",
            });
          }
        };

        row.addEventListener("mouseenter", handleEnter);
        row.addEventListener("mouseleave", handleLeave);

        return () => {
          row.removeEventListener("mouseenter", handleEnter);
          row.removeEventListener("mouseleave", handleLeave);
        };
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="services-section"
      id="services"
      ref={sectionRef}
    >
      <div className="services-container">

        {/* INTRO */}

        <div className="services-intro">
          <div className="services-label">
            02 / WHAT I DO
          </div>

          <h2 className="services-title">
            Editing that makes
            <br />
            content work harder.
          </h2>

          <p className="services-description">
            I shape raw footage into clear, engaging edits built
            around attention, story and the way people actually
            watch content.
          </p>
        </div>

        {/* SERVICES */}

        <div className="services-list">
          {services.map((service) => (
            <article
              className="service-row"
              key={service.number}
            >
              <span className="service-ghost-number">
                {service.number}
              </span>

              <div className="service-number">
                {service.number}
              </div>

              <div className="service-main">
                <div className="service-meta">
                  {service.meta}
                </div>

                <h3 className="service-name">
                  {service.title}
                </h3>

                <p className="service-description">
                  {service.description}
                </p>
              </div>

              <div
                className="service-arrow"
                aria-hidden="true"
              >
                ↗
              </div>
            </article>
          ))}
        </div>

        {/* EDITING FOCUS */}

        <div className="services-focus">
          <div className="services-focus-label">
            EVERY EDIT STARTS WITH
          </div>

          <div className="services-focus-items">
            {editingFocus.map((item, index) => (
              <span
                className="services-focus-item"
                key={item}
              >
                {item}
                {index !== editingFocus.length - 1 && (
                  <span className="services-focus-dot">
                    •
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}