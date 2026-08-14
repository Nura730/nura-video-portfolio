import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const tools = [
  {
    name: "CAPCUT",
    tag: "PRIMARY",
    description:
      "My main workflow for fast social edits, captions, transitions and short-form pacing.",
    icon: "/tools/capcut.png",
  },
  {
    name: "ALIGHT MOTION",
    tag: "MOTION",
    description:
      "Used for motion, typography, effects and animated visual treatments.",
    icon: "/tools/alight-motion.png",
  },
  {
    name: "PREMIERE PRO",
    tag: "LEARNING",
    description:
      "Expanding into professional timeline-based editing and more advanced production workflows.",
    icon: "/tools/premiere-pro.png",
  },
  {
    name: "AFTER EFFECTS",
    tag: "LEARNING",
    description:
      "Building skills in motion graphics, visual effects and advanced animation.",
    icon: "/tools/after-effects.png",
  },
  {
    name: "DAVINCI RESOLVE",
    tag: "LEARNING",
    description:
      "Exploring professional editing, color and post-production workflows.",
    icon: "/tools/davinci-resolve.png",
  },
  {
    name: "CANVA",
    tag: "DESIGN",
    description:
      "Used for social assets, visual content and supporting design work around the edit.",
    icon: "/tools/canva.png",
  },
  {
    name: "FIGMA",
    tag: "DESIGN",
    description:
      "Used for visual planning, layouts and building ideas before they become final work.",
    icon: "/tools/figma.png",
  },
];

export default function Tools() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const cleanupHandlers: Array<() => void> = [];

    const ctx = gsap.context(() => {
      /* ==========================================
         SECTION INTRO
      ========================================== */

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
        .from(".tools-label", {
          y: 25,
          opacity: 0,
          duration: 0.7,
        })
        .from(
          ".tools-title-line",
          {
            y: 90,
            opacity: 0,
            duration: 0.9,
            stagger: 0.08,
          },
          "-=0.35"
        )
        .from(
          ".tools-intro",
          {
            y: 25,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.45"
        );

      /* ==========================================
         TOOL ROWS
      ========================================== */

      const rows =
        section.querySelectorAll<HTMLElement>(".tool-row");

      rows.forEach((row, index) => {
        const iconBox =
          row.querySelector<HTMLElement>(".tool-icon-box");

        const icon =
          row.querySelector<HTMLElement>(".tool-icon");

        const name =
          row.querySelector<HTMLElement>(".tool-name");

        const tag =
          row.querySelector<HTMLElement>(".tool-tag");

        const description =
          row.querySelector<HTMLElement>(".tool-description");

        const arrow =
          row.querySelector<HTMLElement>(".tool-arrow");

        const line =
          row.querySelector<HTMLElement>(".tool-hover-line");

        const orbit =
          row.querySelector<HTMLElement>(".tool-orbit");

        if (
          !iconBox ||
          !icon ||
          !name ||
          !tag ||
          !description ||
          !arrow ||
          !line ||
          !orbit
        ) {
          return;
        }

        /* ------------------------------------------
           SCROLL REVEAL
        ------------------------------------------ */

        gsap.from(row, {
          y: 45,
          opacity: 0,
          duration: 0.8,
          delay: index * 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });

        /* ------------------------------------------
           HOVER
        ------------------------------------------ */

        const handleEnter = () => {
          gsap.to(row, {
            x: 10,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(iconBox, {
            scale: 1.08,
            rotate: 3,
            borderColor: "rgba(255, 99, 20, 0.55)",
            backgroundColor: "rgba(255, 99, 20, 0.06)",
            boxShadow:
              "0 0 30px rgba(255, 99, 20, 0.16)",
            duration: 0.5,
            ease: "back.out(1.6)",
          });

          gsap.to(icon, {
            scale: 1.08,
            rotate: -3,
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(name, {
            x: 8,
            scale: 1.025,
            transformOrigin: "left center",
            duration: 0.4,
            ease: "power3.out",
          });

          gsap.to(tag, {
            x: 6,
            color: "#ff6314",
            borderColor: "rgba(255, 99, 20, 0.35)",
            duration: 0.35,
            ease: "power2.out",
          });

          gsap.to(description, {
            x: 6,
            duration: 0.4,
            ease: "power3.out",
          });

          gsap.to(arrow, {
            x: 8,
            y: -5,
            rotate: 45,
            scale: 1.15,
            color: "#ff6314",
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(line, {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 0.55,
            ease: "power3.out",
          });

          gsap.to(orbit, {
            rotation: 360,
            duration: 0.9,
            ease: "power2.out",
          });
        };

        const handleLeave = () => {
          gsap.to(row, {
            x: 0,
            duration: 0.55,
            ease: "power3.out",
          });

          gsap.to(iconBox, {
            scale: 1,
            rotate: 0,
            borderColor: "rgba(255, 255, 255, 0.12)",
            backgroundColor: "rgba(255, 255, 255, 0.025)",
            boxShadow: "0 0 0 rgba(255, 99, 20, 0)",
            duration: 0.5,
            ease: "power3.out",
          });

          gsap.to(icon, {
            scale: 1,
            rotate: 0,
            opacity: 0.72,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(name, {
            x: 0,
            scale: 1,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(tag, {
            x: 0,
            clearProps: "color,borderColor",
            duration: 0.4,
            ease: "power2.out",
          });

          gsap.to(description, {
            x: 0,
            duration: 0.4,
            ease: "power3.out",
          });

          gsap.to(arrow, {
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            clearProps: "color",
            duration: 0.5,
            ease: "power3.out",
          });

          gsap.to(line, {
            scaleX: 0,
            duration: 0.45,
            ease: "power3.out",
          });

          gsap.to(orbit, {
            rotation: 0,
            duration: 0.5,
            ease: "power2.out",
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
      className="tools-section"
      id="tools"
      ref={sectionRef}
    >
      <div className="tools-container">

        {/* HEADER */}

        <div className="tools-heading">

          <div className="tools-label">
            03 / TOOLS
          </div>

          <h2 className="tools-title">
            <span className="tools-title-line">
              The tools behind
            </span>

            <span className="tools-title-line">
              the edit.
            </span>
          </h2>

          <p className="tools-intro">
            A practical toolkit built around pacing,
            visuals, motion and storytelling — while
            continuously expanding the workflow.
          </p>

        </div>

        {/* TOOL LIST */}

        <div className="tools-list">

          {tools.map((tool, index) => (
            <article
              className="tool-row"
              key={tool.name}
            >

              <div className="tool-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="tool-icon-wrap">

                <div className="tool-icon-box">

                  <img
                    className="tool-icon"
                    src={tool.icon}
                    alt={`${tool.name} logo`}
                    draggable={false}
                  />

                  <span className="tool-orbit">
                    <span className="tool-orbit-dot" />
                  </span>

                </div>

              </div>

              <div className="tool-main">

                <div className="tool-top">

                  <h3 className="tool-name">
                    {tool.name}
                  </h3>

                  <span className="tool-tag">
                    {tool.tag}
                  </span>

                </div>

                <p className="tool-description">
                  {tool.description}
                </p>

              </div>

              <div
                className="tool-arrow"
                aria-hidden="true"
              >
                ↗
              </div>

              <div className="tool-hover-line" />

            </article>
          ))}

        </div>

        {/* CLOSING STATEMENT */}

        <div className="tools-closing">
          <span className="tools-closing-dot" />
          <span>
            Always learning. Always refining the workflow.
          </span>
        </div>

      </div>
    </section>
  );
}