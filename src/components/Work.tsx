import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const moreReels = ["REEL 01", "REEL 02", "REEL 03", "REEL 04"];

export default function Work() {
  const workRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const work = workRef.current;

    if (!work) return;

    const ctx = gsap.context(() => {
      gsap.from(".work-label", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: work,
          start: "top 75%",
        },
      });

      gsap.from(".work-heading", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: work,
          start: "top 70%",
        },
      });

      gsap.from(".work-description", {
        y: 25,
        opacity: 0,
        duration: 0.7,
        delay: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: work,
          start: "top 70%",
        },
      });

      gsap.from(".featured-work-card", {
  y: 35,
  opacity: 0,
  duration: 0.8,
  stagger: 0.12,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".featured-work-grid",
    start: "top 80%",
    once: true,
  },
});

      gsap.from(".more-reel-card", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".more-reels-grid",
          start: "top 85%",
        },
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

        {/* SECTION INTRO */}
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
            A focused collection of edits for travel, creators and social content.
          </p>

        </div>

        {/* FEATURED WORK */}
        <div className="featured-work-grid">

          {/* TRIPXPLO */}
          <article className="featured-work-card">

            <div className="featured-media travel-media">
              <span className="featured-category">
                TRAVEL
              </span>

              <button
                className="featured-play"
                type="button"
              >
                PLAY ↗
              </button>
            </div>

            <div className="featured-card-footer">

              <div>
                <h3>TripXplo</h3>

                <p>
                  Travel reels • Instagram • short-form
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

          {/* KAVITHAI */}
          <article className="featured-work-card">

            <div className="featured-media motion-media">
              <span className="featured-category">
                MOTION
              </span>

              <button
                className="featured-play"
                type="button"
              >
                PLAY ↗
              </button>
            </div>

            <div className="featured-card-footer">

              <div>
                <h3>Kavithai</h3>

                <p>
                  Typography • text animation • social
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

        </div>

        {/* MORE EDITS */}
        <div className="more-work">

          <div className="more-work-label">
            MORE EDITS
          </div>

          <div className="more-reels-grid">

            {moreReels.map((reel) => (
              <article
                className="more-reel-card"
                key={reel}
              >
                <span className="more-reel-number">
                  {reel}
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