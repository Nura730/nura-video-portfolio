import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { workItems } from "../data/work";

gsap.registerPlugin(ScrollTrigger);

const featuredWork = workItems.filter((item) => item.featured);
const moreWork = workItems.filter((item) => !item.featured);

export default function Work() {
  const workRef = useRef<HTMLElement | null>(null);

  /*
   * ============================================================
   * VIDEO REFERENCES
   * ============================================================
   */

  const featuredVideoRefs =
    useRef<Record<string, HTMLVideoElement | null>>({});

const moreCardVideoRefs =
  useRef<Record<string, HTMLVideoElement | null>>({});

const expandedVideoRef =
  useRef<HTMLVideoElement | null>(null);

const activeVideoRef =
  useRef<HTMLVideoElement | null>(null);

  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  const [playingFeatured, setPlayingFeatured] =
    useState<string | null>(null);

  const [featuredProgress, setFeaturedProgress] =
    useState<Record<string, number>>({});

  const [expandedReel, setExpandedReel] =
    useState<string | null>(null);

  const [moreReelPlaying, setMoreReelPlaying] =
    useState(false);

  const [moreReelMuted, setMoreReelMuted] =
    useState(true);

  /*
   * ============================================================
   * STOP ALL OTHER VIDEOS
   * ============================================================
   */

  const stopAllVideos = () => {
  Object.values(featuredVideoRefs.current).forEach((video) => {
    if (!video) return;

    video.pause();
    video.muted = true;
  });

  Object.values(moreCardVideoRefs.current).forEach((video) => {
    if (!video) return;

    video.pause();
    video.muted = true;
  });

  if (expandedVideoRef.current) {
    expandedVideoRef.current.pause();
    expandedVideoRef.current.muted = true;
    expandedVideoRef.current.currentTime = 0;
  }

  activeVideoRef.current = null;

  setPlayingFeatured(null);
  setMoreReelPlaying(false);
};

  /*
   * ============================================================
   * FEATURED VIDEO PROGRESS
   * ============================================================
   */

  const handleFeaturedTimeUpdate = (
    id: string,
    video: HTMLVideoElement
  ) => {
    if (
      !video.duration ||
      !Number.isFinite(video.duration)
    ) {
      return;
    }

    const progress =
      video.currentTime / video.duration;

    setFeaturedProgress((previous) => ({
      ...previous,
      [id]: progress,
    }));
  };

  /*
   * ============================================================
   * FEATURED REEL PLAY / PAUSE
   * ============================================================
   */

  const toggleFeaturedVideo = async (
    id: string
  ) => {
    const video =
      featuredVideoRefs.current[id];

    if (!video) return;

    /*
     * Currently playing -> pause
     */
    if (!video.paused) {
      video.pause();
      video.muted = true;

      if (activeVideoRef.current === video) {
        activeVideoRef.current = null;
      }

      setPlayingFeatured(null);
      return;
    }

    /*
     * Stop every other video.
     */
    stopAllVideos(video);

    /*
     * If a More Reel viewer is open,
     * close it before starting this reel.
     */
    if (expandedReel) {
      const moreVideo =
        moreVideoRefs.current[expandedReel];

      if (moreVideo) {
        moreVideo.pause();
        moreVideo.currentTime = 0;
        moreVideo.muted = true;
      }

      setExpandedReel(null);
      setMoreReelPlaying(false);
      setMoreReelMuted(true);
    }

    /*
     * User explicitly clicked Play,
     * so attempt audio playback.
     */
    video.muted = false;

    try {
      await video.play();

      activeVideoRef.current = video;

      setPlayingFeatured(id);
    } catch (error) {
      /*
       * Browser fallback:
       * if audio playback is blocked,
       * play muted instead.
       */
      console.warn(
        `Audio playback failed for "${id}". Retrying muted.`,
        error
      );

      video.muted = true;

      try {
        await video.play();

        activeVideoRef.current = video;

        setPlayingFeatured(id);
      } catch (playError) {
        console.error(
          `Featured reel "${id}" could not play:`,
          playError
        );

        setPlayingFeatured(null);
      }
    }
  };

  /*
   * ============================================================
   * MORE REEL OPEN
   * ============================================================
   */

  const openMoreReel = (id: string) => {
  const cardVideo = moreCardVideoRefs.current[id];

  if (!cardVideo) return;

  // Stop EVERYTHING first.
  stopAllVideos();

  // The card preview must never continue playing.
  cardVideo.pause();
  cardVideo.muted = true;
  cardVideo.currentTime = 0;

  // Open popup.
  setExpandedReel(id);

  // Popup starts with sound enabled.
  setMoreReelMuted(false);
  setMoreReelPlaying(false);
};


useEffect(() => {
  if (!expandedReel) return;

  const timer = window.setTimeout(async () => {
    const video = expandedVideoRef.current;

    if (!video) return;

    // Defensive cleanup.
    Object.values(featuredVideoRefs.current).forEach((item) => {
      if (!item) return;

      item.pause();
      item.muted = true;
    });

    Object.values(moreCardVideoRefs.current).forEach((item) => {
      if (!item) return;

      item.pause();
      item.muted = true;
    });

    // Popup is the ONLY active video.
    video.muted = false;

    try {
      await video.play();

      activeVideoRef.current = video;

      setMoreReelPlaying(true);
      setMoreReelMuted(false);
    } catch (error) {
      console.warn(
        "Popup audio autoplay blocked. Falling back to muted playback.",
        error
      );

      video.muted = true;

      try {
        await video.play();

        activeVideoRef.current = video;

        setMoreReelPlaying(true);
        setMoreReelMuted(true);
      } catch (playError) {
        console.error(
          "Popup reel could not play:",
          playError
        );

        setMoreReelPlaying(false);
      }
    }
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, [expandedReel]);
  /*
   * ============================================================
   * MORE REEL PLAY / PAUSE
   * ============================================================
   */

  const toggleMoreReelPlayback = async () => {
  const video = expandedVideoRef.current;

  if (!video) return;

  if (!video.paused) {
    video.pause();
    setMoreReelPlaying(false);
    return;
  }

  // Make sure nothing else can play.
  Object.values(featuredVideoRefs.current).forEach((item) => {
    if (!item) return;

    item.pause();
    item.muted = true;
  });

  Object.values(moreCardVideoRefs.current).forEach((item) => {
    if (!item) return;

    item.pause();
    item.muted = true;
  });

  try {
    await video.play();

    activeVideoRef.current = video;

    setMoreReelPlaying(true);
  } catch (error) {
    console.error(
      "More Reel playback failed:",
      error
    );
  }
};

  /*
   * ============================================================
   * MORE REEL AUDIO
   * ============================================================
   */

  const toggleMoreReelAudio = async () => {
  const video = expandedVideoRef.current;

  if (!video) return;

  // SOUND OFF
  if (!video.muted) {
    video.muted = true;
    setMoreReelMuted(true);

    // IMPORTANT:
    // Do NOT pause the video.
    // Do NOT close the popup.
    return;
  }

  // SOUND ON
  Object.values(featuredVideoRefs.current).forEach((item) => {
    if (!item) return;

    item.pause();
    item.muted = true;
  });

  Object.values(moreCardVideoRefs.current).forEach((item) => {
    if (!item) return;

    item.pause();
    item.muted = true;
  });

  video.muted = false;

  setMoreReelMuted(false);

  try {
    if (video.paused) {
      await video.play();
      setMoreReelPlaying(true);
    }
  } catch (error) {
    console.error(
      "Could not enable reel audio:",
      error
    );

    video.muted = true;
    setMoreReelMuted(true);
  }
};

  /*
   * ============================================================
   * CLOSE MORE REEL
   * ============================================================
   */

  const closeMoreReel = () => {
  const video = expandedVideoRef.current;

  if (video) {
    video.pause();
    video.currentTime = 0;
    video.muted = true;
  }

  activeVideoRef.current = null;
  expandedVideoRef.current = null;

  setMoreReelPlaying(false);
  setMoreReelMuted(true);
  setExpandedReel(null);
};

  /*
   * ============================================================
   * VIDEO EVENTS
   * ============================================================
   */

  useEffect(() => {
    const handleFeaturedPlay =
      (event: Event) => {
        const video =
          event.currentTarget as HTMLVideoElement;

        const entry = Object.entries(
          featuredVideoRefs.current
        ).find(
          ([, element]) =>
            element === video
        );

        if (entry) {
          setPlayingFeatured(entry[0]);
        }
      };

    const handleFeaturedPause =
      (event: Event) => {
        const video =
          event.currentTarget as HTMLVideoElement;

        const entry = Object.entries(
          featuredVideoRefs.current
        ).find(
          ([, element]) =>
            element === video
        );

        if (
          entry &&
          playingFeatured === entry[0]
        ) {
          setPlayingFeatured(null);
        }
      };

    const featuredVideos =
      Object.values(
        featuredVideoRefs.current
      );

    featuredVideos.forEach((video) => {
      if (!video) return;

      video.addEventListener(
        "play",
        handleFeaturedPlay
      );

      video.addEventListener(
        "pause",
        handleFeaturedPause
      );
    });

    return () => {
      featuredVideos.forEach((video) => {
        if (!video) return;

        video.removeEventListener(
          "play",
          handleFeaturedPlay
        );

        video.removeEventListener(
          "pause",
          handleFeaturedPause
        );
      });
    };
  }, [playingFeatured]);

  /*
   * ============================================================
   * CLOSE MORE REEL ON SCROLL
   * ============================================================
   */

  useEffect(() => {
    if (!expandedReel) return;

    const handleScroll = () => {
      closeMoreReel();
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [expandedReel]);

  /*
   * ============================================================
   * ESC KEY
   * ============================================================
   */

  useEffect(() => {
    if (!expandedReel) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closeMoreReel();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [expandedReel]);

  /*
   * ============================================================
   * COMPONENT CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      Object.values(
        featuredVideoRefs.current
      ).forEach((video) => {
        if (!video) return;

        video.pause();
        video.muted = true;
        video.currentTime = 0;
      });

      Object.values(
  moreCardVideoRefs.current
).forEach((video) => {
        if (!video) return;

        video.pause();
        video.muted = true;
        video.currentTime = 0;
      });
    };
  }, []);

  /*
   * ============================================================
   * GSAP
   * ============================================================
   */

  useLayoutEffect(() => {
    const work = workRef.current;

    if (!work) return;

    const ctx = gsap.context(() => {
      /*
       * --------------------------------------------------------
       * INTRO
       * --------------------------------------------------------
       */

      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: work,
          start: "top 72%",
          toggleActions:
            "play none none reverse",
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

      /*
       * --------------------------------------------------------
       * FEATURED CARDS
       * --------------------------------------------------------
       */

      gsap.from(
        ".featured-work-card",
        {
          y: 80,
          opacity: 0,
          scale: 0.94,
          duration: 1,
          stagger: 0.16,
          ease: "power3.out",
          scrollTrigger: {
            trigger:
              ".featured-work-grid",
            start: "top 82%",
            toggleActions:
              "play none none reverse",
          },
        }
      );

      /*
       * --------------------------------------------------------
       * MORE REELS
       * --------------------------------------------------------
       */

      gsap.from(
        ".more-reel-card",
        {
          y: 50,
          opacity: 0,
          scale: 0.95,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger:
              ".more-reels-grid",
            start: "top 85%",
            toggleActions:
              "play none none reverse",
          },
        }
      );

      /*
       * --------------------------------------------------------
       * FEATURED 3D HOVER
       * --------------------------------------------------------
       */

      const cards =
        work.querySelectorAll<HTMLElement>(
          ".featured-work-card"
        );

      cards.forEach((card) => {
        const media =
          card.querySelector<HTMLElement>(
            ".featured-media"
          );

        const play =
          card.querySelector<HTMLElement>(
            ".featured-play"
          );

        if (!media || !play) return;

        const handleMove = (
          event: MouseEvent
        ) => {
          const rect =
            card.getBoundingClientRect();

          const x =
            event.clientX - rect.left;

          const y =
            event.clientY - rect.top;

          const centerX =
            rect.width / 2;

          const centerY =
            rect.height / 2;

          const rotateY =
            ((x - centerX) / centerX) *
            4;

          const rotateX =
            ((centerY - y) / centerY) *
            4;

          gsap.to(card, {
            rotateX,
            rotateY,
            y: -6,
            duration: 0.45,
            ease: "power3.out",
            overwrite: true,
          });

          gsap.to(media, {
            x:
              ((x - centerX) /
                centerX) *
              -6,
            y:
              ((y - centerY) /
                centerY) *
              -6,
            scale: 1.015,
            duration: 0.45,
            ease: "power3.out",
            overwrite: true,
          });

          gsap.to(play, {
            scale: 1.08,
            x:
              ((x - centerX) /
                centerX) *
              3,
            y:
              ((y - centerY) /
                centerY) *
              3,
            duration: 0.35,
            ease: "power3.out",
            overwrite: true,
          });
        };

        const handleLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            y: 0,
            duration: 0.7,
            ease:
              "elastic.out(1, 0.55)",
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

          gsap.to(play, {
            scale: 1,
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
            overwrite: true,
          });
        };

        card.addEventListener(
          "mousemove",
          handleMove
        );

        card.addEventListener(
          "mouseleave",
          handleLeave
        );

        return () => {
          card.removeEventListener(
            "mousemove",
            handleMove
          );

          card.removeEventListener(
            "mouseleave",
            handleLeave
          );
        };
      });
    }, work);

    return () => {
      ctx.revert();
    };
  }, []);

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <section
      className="work-section"
      id="work"
      ref={workRef}
    >
      <div className="work-container">

        {/* ====================================================
            INTRO
        ==================================================== */}

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
            A focused collection of edits
            for creators, brands and social
            content.
          </p>
        </div>

        {/* ====================================================
            FEATURED WORK
        ==================================================== */}

        <div className="featured-work-grid">

          {featuredWork.map((item) => {
            const isPlaying =
              playingFeatured ===
              item.id;

            const progress =
              featuredProgress[
                item.id
              ] ?? 0;

            const circumference =
              2 * Math.PI * 19;

            return (
              <article
                className={`featured-work-card ${item.id}-card`}
                key={item.id}
              >
                <div className="featured-media">

                  <video
                    ref={(element) => {
                      featuredVideoRefs.current[
                        item.id
                      ] = element;
                    }}
                    className="featured-video"
                    src={item.video}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={
                      item.title
                    }
                    onTimeUpdate={(
                      event
                    ) =>
                      handleFeaturedTimeUpdate(
                        item.id,
                        event.currentTarget
                      )
                    }
                    onLoadedMetadata={(
                      event
                    ) =>
                      handleFeaturedTimeUpdate(
                        item.id,
                        event.currentTarget
                      )
                    }
                    onEnded={() => {
                      setFeaturedProgress(
                        (previous) => ({
                          ...previous,
                          [item.id]: 0,
                        })
                      );

                      setPlayingFeatured(
                        null
                      );
                    }}
                  />

                  <span className="featured-category">
                    {item.category}
                  </span>

                  <button
                    className="featured-play"
                    type="button"
                    aria-label={
                      isPlaying
                        ? `Pause ${item.title} reel`
                        : `Play ${item.title} reel`
                    }
                    onClick={() =>
                      toggleFeaturedVideo(
                        item.id
                      )
                    }
                  >
                    <svg
                      className="play-progress"
                      viewBox="0 0 42 42"
                      aria-hidden="true"
                    >
                      <circle
                        className="play-progress-track"
                        cx="21"
                        cy="21"
                        r="19"
                      />

                      <circle
                        className="play-progress-ring"
                        cx="21"
                        cy="21"
                        r="19"
                        style={{
                          strokeDasharray:
                            circumference,
                          strokeDashoffset:
                            circumference *
                            (1 - progress),
                        }}
                      />
                    </svg>

                    <span className="play-icon">
                      {isPlaying
                        ? "Ⅱ"
                        : "▶"}
                    </span>

                    <span className="play-label">
                      {isPlaying
                        ? "PAUSE REEL"
                        : "PLAY REEL"}
                    </span>
                  </button>
                </div>

                <div className="featured-card-footer">

                  <div>
                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.client} •{" "}
                      {item.category}
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
            );
          })}

        </div>

        {/* ====================================================
            MORE EDITS
        ==================================================== */}

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
                <video
  ref={(element) => {
    moreCardVideoRefs.current[item.id] = element;
  }}
                  className="more-reel-video"
                  src={item.video}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />

                <div className="more-reel-overlay" />

                <div className="more-reel-content">

                  <span className="more-reel-number">
                    {item.title}
                  </span>

                  <button
                    className="more-reel-play"
                    type="button"
                    onClick={() =>
                      openMoreReel(
                        item.id
                      )
                    }
                  >
                    PLAY ▶
                  </button>

                </div>
              </article>
            ))}

          </div>
        </div>

      </div>

      {/* ======================================================
          MORE REEL VIEWER
      ====================================================== */}

      {expandedReel && (
        <div
          className="more-reel-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Video preview"
        >

          {/* Backdrop */}

          <button
            className="more-reel-viewer-backdrop"
            type="button"
            aria-label="Close reel"
            onClick={
              closeMoreReel
            }
          />

          {/* Viewer */}

          <div className="more-reel-viewer-frame">

            {/* Video */}

            <video
  ref={(element) => {
    expandedVideoRef.current = element;
  }}
              className="more-reel-viewer-video"
              src={
                moreWork.find(
                  (item) =>
                    item.id ===
                    expandedReel
                )?.video
              }
              muted={moreReelMuted}
              loop
              playsInline
              preload="auto"
              autoPlay
              onPlay={() => {
                setMoreReelPlaying(
                  true
                );
              }}
              onPause={() => {
                setMoreReelPlaying(
                  false
                );
              }}
            />

            {/* Top Controls */}

            <div className="more-reel-viewer-top">

              <span className="more-reel-viewer-title">
                {
                  moreWork.find(
                    (item) =>
                      item.id ===
                      expandedReel
                  )?.title
                }
              </span>

              <button
                className="more-reel-audio"
                type="button"
                onClick={
                  toggleMoreReelAudio
                }
              >
                {moreReelMuted
                  ? "🔇 SOUND OFF"
                  : "🔊 SOUND ON"}
              </button>

              <button
                className="more-reel-close"
                type="button"
                aria-label="Close reel"
                onClick={
                  closeMoreReel
                }
              >
                ✕
              </button>

            </div>

            {/* Bottom Controls */}

            <div className="more-reel-viewer-bottom">

              <button
                className="more-reel-viewer-play"
                type="button"
                onClick={
                  toggleMoreReelPlayback
                }
              >
                {moreReelPlaying
                  ? "PAUSE ❚❚"
                  : "PLAY ▶"}
              </button>

            </div>

          </div>
        </div>
      )}
    </section>
  );
}