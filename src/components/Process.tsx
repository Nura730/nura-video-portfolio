import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "SEND FOOTAGE",
    description:
      "You send the raw footage, references and anything important for the project.",
  },
  {
    number: "02",
    title: "DISCUSS THE EDIT",
    description:
      "We discuss the goal, audience, pacing, music or song, fonts, references and overall direction.",
  },
  {
    number: "03",
    title: "UNDERSTAND THE STORY",
    description:
      "Before cutting, I understand what the video needs to communicate and what should keep the viewer watching.",
  },
  {
    number: "04",
    title: "EDIT",
    description:
      "I shape the footage through pacing, sound, visuals, typography, captions, transitions and motion.",
  },
  {
    number: "05",
    title: "REVIEW",
    description:
      "You review the first cut, share feedback and revisions are handled until the edit is ready.",
  },
  {
    number: "06",
    title: "DELIVER",
    description:
      "The final polished video is exported in the required format and ready to publish.",
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      const headerLabel = section.querySelector(".process-label");
      const headingLines =
        section.querySelectorAll<HTMLElement>(".process-heading-line");
      const intro = section.querySelector(".process-intro");

      const steps =
        section.querySelectorAll<HTMLElement>(".process-step");

      const progressLine =
        section.querySelector<HTMLElement>(".process-progress-line");

      const progressFill =
        section.querySelector<HTMLElement>(".process-progress-fill");

      const finalCta =
        section.querySelector<HTMLElement>(".process-final");

      /* --------------------------------
         INITIAL STATES
      -------------------------------- */

      gsap.set(headerLabel, {
        y: 25,
        opacity: 0,
      });

      gsap.set(headingLines, {
        y: 90,
        opacity: 0,
      });

      gsap.set(intro, {
        y: 25,
        opacity: 0,
      });

      gsap.set(steps, {
        y: 70,
        opacity: 0,
      });

      gsap.set(progressFill, {
        scaleY: 0,
        transformOrigin: "top center",
      });

      gsap.set(finalCta, {
        y: 40,
        opacity: 0,
      });

      /* --------------------------------
         HEADER REVEAL
      -------------------------------- */

      const headerTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
        defaults: {
          ease: "power4.out",
        },
      });

      headerTimeline
        .to(headerLabel, {
          y: 0,
          opacity: 1,
          duration: 0.55,
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
          intro,
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
          },
          "-=0.45"
        );

      /* --------------------------------
         PROCESS STEPS
      -------------------------------- */

      steps.forEach((step) => {
        const number =
          step.querySelector<HTMLElement>(".process-number");

        const title =
          step.querySelector<HTMLElement>(".process-step-title");

        const description =
          step.querySelector<HTMLElement>(".process-step-description");

        const ghost =
          step.querySelector<HTMLElement>(".process-ghost-number");

        const marker =
          step.querySelector<HTMLElement>(".process-marker");

        gsap.fromTo(
          step,
          {
            y: 70,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power4.out",
            scrollTrigger: {
              trigger: step,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );

        ScrollTrigger.create({
          trigger: step,
          start: "top 58%",
          end: "bottom 42%",
          onEnter: () => {
            gsap.to(step, {
              x: 8,
              duration: 0.5,
              ease: "power3.out",
            });

            gsap.to(number, {
              color: "#ff6314",
              duration: 0.3,
            });

            gsap.to(title, {
              x: 8,
              duration: 0.45,
              ease: "power3.out",
            });

            gsap.to(description, {
              x: 8,
              color: "#9a9a9a",
              duration: 0.45,
              ease: "power3.out",
            });

            gsap.to(marker, {
              scale: 1.35,
              backgroundColor: "#ff6314",
              duration: 0.35,
              ease: "power3.out",
            });

            gsap.to(ghost, {
              opacity: 0.045,
              x: 15,
              duration: 0.5,
              ease: "power3.out",
            });
          },
          onLeave: () => {
            gsap.to(step, {
              x: 0,
              duration: 0.4,
            });

            gsap.to(number, {
              clearProps: "color",
              duration: 0.3,
            });

            gsap.to(title, {
              x: 0,
              duration: 0.4,
            });

            gsap.to(description, {
              x: 0,
              clearProps: "color",
              duration: 0.4,
            });

            gsap.to(marker, {
              scale: 1,
              clearProps: "backgroundColor",
              duration: 0.3,
            });

            gsap.to(ghost, {
              opacity: 0,
              x: 0,
              duration: 0.4,
            });
          },
          onEnterBack: () => {
            gsap.to(step, {
              x: 8,
              duration: 0.45,
              ease: "power3.out",
            });

            gsap.to(number, {
              color: "#ff6314",
              duration: 0.3,
            });

            gsap.to(title, {
              x: 8,
              duration: 0.4,
            });

            gsap.to(description, {
              x: 8,
              color: "#9a9a9a",
              duration: 0.4,
            });

            gsap.to(marker, {
              scale: 1.35,
              backgroundColor: "#ff6314",
              duration: 0.3,
            });

            gsap.to(ghost, {
              opacity: 0.045,
              x: 15,
              duration: 0.4,
            });
          },
          onLeaveBack: () => {
            gsap.to(step, {
              x: 0,
              duration: 0.4,
            });

            gsap.to(number, {
              clearProps: "color",
              duration: 0.3,
            });

            gsap.to(title, {
              x: 0,
              duration: 0.4,
            });

            gsap.to(description, {
              x: 0,
              clearProps: "color",
              duration: 0.4,
            });

            gsap.to(marker, {
              scale: 1,
              clearProps: "backgroundColor",
              duration: 0.3,
            });

            gsap.to(ghost, {
              opacity: 0,
              x: 0,
              duration: 0.4,
            });
          },
        });
      });

      /* --------------------------------
         PROGRESS LINE
      -------------------------------- */

      if (progressLine && progressFill) {
        gsap.to(progressFill, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: progressLine,
            start: "top 70%",
            end: "bottom 55%",
            scrub: 1,
          },
        });
      }

      /* --------------------------------
         FINAL CTA
      -------------------------------- */

      gsap.to(finalCta, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power4.out",
        scrollTrigger: {
          trigger: finalCta,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="process-section"
      id="process"
      ref={sectionRef}
    >
      <div className="process-container">

        {/* HEADER */}

        <header className="process-header">
          <div className="process-label">
            05 / PROCESS
          </div>

          <h2 className="process-heading">
            <span className="process-heading-line">
              FROM FOOTAGE
            </span>

            <span className="process-heading-line">
              TO FINAL CUT.
            </span>
          </h2>

          <p className="process-intro">
            A clear workflow keeps the creative process simple —
            from understanding the brief to delivering the final edit.
          </p>
        </header>

        {/* TIMELINE */}

        <div className="process-timeline">

          <div className="process-progress-line">
            <div className="process-progress-fill" />
          </div>

          <div className="process-steps">
            {steps.map((step) => (
              <article
                className="process-step"
                key={step.number}
              >
                <span className="process-ghost-number">
                  {step.number}
                </span>

                <div className="process-marker-wrap">
                  <span className="process-marker" />
                </div>

                <div className="process-step-number">
                  <span className="process-number">
                    {step.number}
                  </span>
                </div>

                <div className="process-step-main">
                  <div className="process-step-meta">
                    STEP {step.number}
                  </div>

                  <h3 className="process-step-title">
                    {step.title}
                  </h3>

                  <p className="process-step-description">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

        </div>

        {/* FINAL CTA */}

        <div className="process-final">
          <div className="process-final-line" />

          <div className="process-final-content">
            <span>
              READY WHEN YOU ARE.
            </span>

            <a href="#contact">
              START A PROJECT <span>↗</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}