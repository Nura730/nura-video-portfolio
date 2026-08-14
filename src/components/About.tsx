import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      const intro = section.querySelector<HTMLElement>(".about-label");
      const heading = section.querySelector<HTMLElement>(".about-heading");
      const headingLines =
        section.querySelectorAll<HTMLElement>(".about-heading-line");
      const content = section.querySelector<HTMLElement>(".about-content");
      const paragraphs =
        section.querySelectorAll<HTMLElement>(".about-copy");
      const divider = section.querySelector<HTMLElement>(".about-divider");
      const status = section.querySelector<HTMLElement>(".about-status");
      const statusDot =
        section.querySelector<HTMLElement>(".about-status-dot");
      const keywords =
        section.querySelectorAll<HTMLElement>(".about-keyword");

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

      gsap.set(headingLines, {
        y: 100,
        opacity: 0,
      });

      gsap.set([intro, content, status], {
        y: 30,
        opacity: 0,
      });

      gsap.set(divider, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(statusDot, {
        scale: 0,
      });

      gsap.set(keywords, {
        y: 15,
        opacity: 0,
      });

      timeline
        .to(intro, {
          y: 0,
          opacity: 1,
          duration: 0.6,
        })
        .to(
          headingLines,
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
          },
          "-=0.25"
        )
        .to(
          content,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
          "-=0.45"
        )
        .to(
          paragraphs,
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.12,
          },
          "-=0.5"
        )
        .to(
          divider,
          {
            scaleX: 1,
            duration: 0.9,
            ease: "power3.inOut",
          },
          "-=0.3"
        )
        .to(
          keywords,
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.08,
          },
          "-=0.5"
        )
        .to(
          status,
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
          },
          "-=0.25"
        )
        .to(
          statusDot,
          {
            scale: 1,
            duration: 0.45,
            ease: "back.out(2)",
          },
          "-=0.35"
        );

      // Small status-dot pulse
      gsap.to(statusDot, {
        scale: 1.18,
        opacity: 0.65,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.8,
      });

      // Keyword hover interaction
      keywords.forEach((keyword) => {
        const handleEnter = () => {
          gsap.to(keyword, {
            y: -3,
            color: "#ff6314",
            duration: 0.3,
            ease: "power3.out",
          });
        };

        const handleLeave = () => {
          gsap.to(keyword, {
            y: 0,
            color: "",
            duration: 0.3,
            ease: "power3.out",
          });
        };

        keyword.addEventListener("mouseenter", handleEnter);
        keyword.addEventListener("mouseleave", handleLeave);

        return () => {
          keyword.removeEventListener("mouseenter", handleEnter);
          keyword.removeEventListener("mouseleave", handleLeave);
        };
      });

      // Heading reacts subtly to mouse movement
      const handleMouseMove = (event: MouseEvent) => {
        const rect = section.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const moveX = ((x / rect.width) - 0.5) * 8;
        const moveY = ((y / rect.height) - 0.5) * 5;

        gsap.to(heading, {
          x: moveX,
          y: moveY,
          duration: 0.7,
          ease: "power3.out",
          overwrite: true,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(heading, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        });
      };

      section.addEventListener("mousemove", handleMouseMove);
      section.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        section.removeEventListener("mousemove", handleMouseMove);
        section.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="about-section"
      id="about"
      ref={sectionRef}
    >
      <div className="about-container">

        {/* SECTION LABEL */}
        <div className="about-label">
          04 / ABOUT
        </div>

        {/* MAIN CONTENT */}
        <div className="about-layout">

          {/* LEFT */}
          <div className="about-heading-wrap">
            <h2 className="about-heading">

              <span className="about-heading-line">
                I edit
              </span>

              <span className="about-heading-line">
                with
              </span>

              <span className="about-heading-line">
                purpose.
              </span>

            </h2>
          </div>

          {/* RIGHT */}
          <div className="about-content">

            <p className="about-copy">
              I'm Nura — a video editor focused on creating clean,
engaging content across short-form, social and
longer-form video.
            </p>

            <p className="about-copy">
              I care about pacing, storytelling, sound,
              typography and the small details that make
              an edit feel intentional.
            </p>

            <div className="about-divider" />

            <div className="about-keywords">
              <span className="about-keyword">
                EDITING
              </span>

              <span className="about-keyword">
                MOTION
              </span>

              <span className="about-keyword">
                STORY
              </span>

              <span className="about-keyword">
                DETAIL
              </span>
            </div>

            <div className="about-status">
              <span className="about-status-dot" />
              <span>
                AVAILABLE FOR FREELANCE PROJECTS
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}