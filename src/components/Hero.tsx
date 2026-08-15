import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./HeroPolish.css";

gsap.registerPlugin(ScrollTrigger);

const HERO_REEL = "/videos/tripxplo-07.mp4";
const VIDEO_PLAY_EVENT = "portfolio-video-play";

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const reelRef = useRef<HTMLDivElement | null>(null);
  const reelInnerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  /*
   * ============================================================
   * STOP HERO WHEN ANOTHER PORTFOLIO VIDEO STARTS
   * ============================================================
   */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleOtherVideoPlay = (event: Event) => {
      const customEvent =
        event as CustomEvent<HTMLVideoElement>;

      const activeVideo = customEvent.detail;

      if (!activeVideo || activeVideo === video) return;

      video.pause();
      video.muted = true;

      setIsPlaying(false);
      setIsMuted(true);
    };

    window.addEventListener(
      VIDEO_PLAY_EVENT,
      handleOtherVideoPlay
    );

    return () => {
      window.removeEventListener(
        VIDEO_PLAY_EVENT,
        handleOtherVideoPlay
      );
    };
  }, []);

  /*
   * ============================================================
   * HERO GSAP
   * ============================================================
   */

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
        .from(".hero-label", {
          y: 24,
          opacity: 0,
          duration: 0.65,
        })
        .from(
          ".hero-title-line",
          {
            yPercent: 115,
            opacity: 0,
            duration: 1.05,
            stagger: 0.1,
          },
          "-=0.2"
        )
        .from(
          ".hero-description",
          {
            y: 22,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.45"
        )
        .from(
          ".hero-actions",
          {
            y: 18,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          ".hero-availability",
          {
            y: 12,
            opacity: 0,
            duration: 0.5,
          },
          "-=0.3"
        )
        .from(
          ".hero-reel",
          {
            x: 90,
            opacity: 0,
            scale: 0.94,
            rotate: 2,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.8"
        );

      gsap.to(".hero-content", {
        yPercent: -8,
        opacity: 0.72,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-orbit", {
        rotate: 360,
        duration: 24,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".hero-reel", {
        y: -7,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.2,
      });

      const primaryButton =
        hero.querySelector<HTMLElement>(
          ".hero-primary-button"
        );

      const secondaryButton =
        hero.querySelector<HTMLElement>(
          ".hero-secondary-button"
        );

      [primaryButton, secondaryButton].forEach(
        (button) => {
          if (!button) return;

          const enter = () => {
            gsap.to(button, {
              y: -4,
              duration: 0.25,
              ease: "power2.out",
            });
          };

          const leave = () => {
            gsap.to(button, {
              y: 0,
              duration: 0.25,
              ease: "power2.out",
            });
          };

          button.addEventListener(
            "mouseenter",
            enter
          );

          button.addEventListener(
            "mouseleave",
            leave
          );
        }
      );
    }, hero);

    return () => {
      ctx.revert();
    };
  }, []);

  /*
   * ============================================================
   * HERO REEL 3D HOVER
   * ============================================================
   */

  useEffect(() => {
    const reel = reelRef.current;
    const inner = reelInnerRef.current;

    if (!reel || !inner) return;

    const handleMouseMove = (
      event: MouseEvent
    ) => {
      const rect =
        reel.getBoundingClientRect();

      const x =
        event.clientX - rect.left;

      const y =
        event.clientY - rect.top;

      const centerX =
        rect.width / 2;

      const centerY =
        rect.height / 2;

      gsap.to(reel, {
        rotateX:
          ((centerY - y) / centerY) *
          4.5,
        rotateY:
          ((x - centerX) / centerX) *
          4.5,
        duration: 0.45,
        ease: "power3.out",
        overwrite: true,
      });

      gsap.to(inner, {
        x:
          ((x - centerX) / centerX) *
          7,
        y:
          ((y - centerY) / centerY) *
          7,
        duration: 0.45,
        ease: "power3.out",
        overwrite: true,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(reel, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.75,
        ease: "power3.out",
      });

      gsap.to(inner, {
        x: 0,
        y: 0,
        duration: 0.75,
        ease: "power3.out",
      });
    };

    reel.addEventListener(
      "mousemove",
      handleMouseMove
    );

    reel.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    return () => {
      reel.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      reel.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, []);

  /*
   * ============================================================
   * HERO VIDEO AUTOPLAY
   * ============================================================
   */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;

    const playPromise = video.play();

    playPromise?.catch(() => {
      setIsPlaying(false);
    });

    return () => {
      video.pause();
    };
  }, []);

  /*
   * ============================================================
   * HERO PLAY / PAUSE
   * ============================================================
   */

  const togglePlayback = async () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.muted = false;
      setIsMuted(false);

      try {
        await video.play();

        window.dispatchEvent(
          new CustomEvent<HTMLVideoElement>(
            VIDEO_PLAY_EVENT,
            { detail: video }
          )
        );

        setIsPlaying(true);
      } catch {
        video.muted = true;
        setIsMuted(true);

        try {
          await video.play();

          window.dispatchEvent(
            new CustomEvent<HTMLVideoElement>(
              VIDEO_PLAY_EVENT,
              { detail: video }
            )
          );

          setIsPlaying(!video.paused);
        } catch {
          setIsPlaying(false);
        }
      }

      return;
    }

    video.pause();
    setIsPlaying(false);
  };

  /*
   * ============================================================
   * HERO AUDIO
   * ============================================================
   */

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <section
      className="hero hero-polished"
      id="home"
      ref={heroRef}
    >
      <div
        className="hero-glow hero-glow-one"
        aria-hidden="true"
      />

      <div
        className="hero-glow hero-glow-two"
        aria-hidden="true"
      />

      <div className="hero-content">
        <div className="hero-left">
          <div className="hero-label">
            FREELANCE VIDEO EDITOR
          </div>

          <div
            className="hero-title"
            aria-label="Video editor and creative storyteller"
          >
            <div className="hero-title-line">
              VIDEO EDITOR
            </div>

            <div className="hero-title-line">
              &amp; CREATIVE
            </div>

            <div className="hero-title-line">
              STORYTELLER.
            </div>
          </div>

          <p className="hero-description">
            I turn raw footage into sharp,
            story-driven edits for social,
            creators and brands — built around
            pacing, sound and attention.
          </p>

          <div className="hero-actions">
            <a
              href="#work"
              className="hero-primary-button"
            >
              VIEW MY WORK <span>↗</span>
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
            <span className="availability-dot" />
            OPEN FOR NEW EDITING PROJECTS
          </div>
        </div>

        <div
          className="hero-reel"
          ref={reelRef}
        >
          <div className="reel-frame">
            <div className="reel-topline">
              <span>SELECTED WORK</span>
              <span>01 / 01</span>
            </div>

            <div
              className="reel-inner"
              ref={reelInnerRef}
            >
              <video
                ref={videoRef}
                className="hero-reel-video"
                src={HERO_REEL}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Selected video editing work"
                onPlay={() => {
                  setIsPlaying(true);
                }}
                onPause={() => {
                  setIsPlaying(false);
                }}
              />

              <div
                className="reel-shade"
                aria-hidden="true"
              />

              <div className="reel-center-meta">
                <span>EDIT / SHORT-FORM</span>
                <strong>
                  {isPlaying
                    ? "PLAYING"
                    : "PAUSED"}
                </strong>
              </div>

              <div className="reel-controls">
                <button
                  className="reel-play"
                  type="button"
                  onClick={togglePlayback}
                  aria-label={
                    isPlaying
                      ? "Pause selected reel"
                      : "Play selected reel"
                  }
                >
                  {isPlaying
                    ? "PAUSE"
                    : "PLAY REEL"}

                  <span>
                    {isPlaying
                      ? "Ⅱ"
                      : "▶"}
                  </span>
                </button>

                <button
                  className="reel-sound"
                  type="button"
                  onClick={toggleMute}
                  aria-label={
                    isMuted
                      ? "Turn sound on"
                      : "Turn sound off"
                  }
                >
                  {isMuted
                    ? "SOUND OFF"
                    : "SOUND ON"}
                </button>
              </div>
            </div>
          </div>

          <div className="reel-info">
            <span>SELECTED WORK</span>
            <strong>
              SHORT-FORM • SOCIAL • STORY
            </strong>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <span>SCROLL</span>
        <i />
      </div>
    </section>
  );
}