import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { workItems } from "../data/work";

gsap.registerPlugin(ScrollTrigger);

const featuredWork = workItems.filter((item) => item.featured);
const moreWork = workItems.filter((item) => !item.featured);

export default function Work() {
  const workRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const work = workRef.current;

    if (!work) return;

    const ctx = gsap.context(() => {
      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: work,
          start: "top 72%",
          toggleActions: "play none none reverse",
        },
        defaults: {
          ease: "power4.out",
        },
      });

      intro
        .from(".work-label", {
          y: 25,
          opacity: 0,
          duration: 0.7,
        })
        .from(
          ".work-heading",
          {
            y: 70,
            opacity: 0,
            duration: 1,
          },
          "-=0.35"
        )
        .from(
          ".work-description",
          {
            y: 25,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.55"
        );

      gsap.from(".featured-work-card", {
        y: 80,
        opacity: 0,
        scale: 0.94,
        duration: 1,
        stagger: 0.16,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".featured-work-grid",
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".more-reel-card", {
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.75,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".more-reels-grid",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      const cards =
        work.querySelectorAll<HTMLElement>(".featured-work-card");

      cards.forEach((card) => {
        const media =
          card.querySelector<HTMLElement>(".featured-media");

        const play =
          card.querySelector<HTMLElement>(".featured-play");

        if (!media) return;

        const handleMove = (event: MouseEvent) => {
          const rect = card.getBoundingClientRect();

          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateY =
            ((x - centerX) / centerX) * 4;

          const rotateX =
            ((centerY - y) / centerY) * 4;

          gsap.to(card, {
            rotateX,
            rotateY,
            y: -6,
            duration: 0.45,
            ease: "power3.out",
            overwrite: true,
          });

          gsap.to(media, {
            x: ((x - centerX) / centerX) * -6,
            y: ((y - centerY) / centerY) * -6,
            scale: 1.015,
            duration: 0.45,
            ease: "power3.out",
            overwrite: true,
          });

          if (play) {
            gsap.to(play, {
              scale: 1.08,
              x: ((x - centerX) / centerX) * 3,
              y: ((y - centerY) / centerY) * 3,
              duration: 0.35,
              ease: "power3.out",
              overwrite: true,
            });
          }
        };

        const handleLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            y: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.55)",
            overwrite: true,
          });

          gsap.to(media, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            overwrite: true,
          });

          if (play) {
            gsap.to(play, {
              scale: 1,
              x: 0,
              y: 0,
              duration: 0.5,
              ease: "power3.out",
              overwrite: true,
            });
          }
        };

        card.addEventListener("mousemove", handleMove);
        card.addEventListener("mouseleave", handleLeave);

        return () => {
          card.removeEventListener("mousemove", handleMove);
          card.removeEventListener("mouseleave", handleLeave);
        };
      });
    }, work);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="work-section"
      id="work"
      ref={workRef}
    >
      <div className="work-container">
        <div className="work-intro">
          <div className="work-label">
            01 / SELECTED WORK
          </div>

          <h2 className="work-heading">
            Work that speaks
            <br />
            without explanation.
          </h2>

          <p className="work-description">
            A focused collection of edits for travel, creators
            and social content.
          </p>
        </div>

        <div className="featured-work-grid">
          {featuredWork.map((item) => (
            <article
              className="featured-work-card"
              key={item.id}
            >
              <div className="featured-media">
                <span className="featured-category">
                  {item.category}
                </span>

                <button
                  className="featured-play"
                  type="button"
                  aria-label={`Play ${item.title}`}
                >
                  <span className="play-icon">
                    ▶
                  </span>

                  <span>
                    PLAY REEL
                  </span>
                </button>
              </div>

              <div className="featured-card-footer">
                <div>
                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.client} • {item.category}
                  </p>
                </div>

                <button
                  className="view-project"
                  type="button"
                >
                  VIEW PROJECT ↗
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="more-work">
          <div className="more-work-label">
            MORE EDITS
          </div>

          <div className="more-reels-grid">
            {moreWork.map((item) => (
              <article
                className="more-reel-card"
                key={item.id}
              >
                <span className="more-reel-number">
                  {item.title}
                </span>

                <button
                  className="more-reel-play"
                  type="button"
                >
                  PLAY ▶
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}