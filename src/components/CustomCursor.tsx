import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return;

    const moveCursor = (event: MouseEvent) => {
      gsap.to(dot, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.08,
        ease: "power2.out",
      });

      gsap.to(ring, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.45,
        ease: "power3.out",
      });
    };

    const magneticElements =
  document.querySelectorAll<HTMLElement>("[data-magnetic]");

const magneticHandlers: Array<{
  element: HTMLElement;
  enter: () => void;
  move: (event: MouseEvent) => void;
  leave: () => void;
}> = [];

magneticElements.forEach((element) => {
  const enter = () => {
    gsap.to(ring, {
      scale: 1.6,
      duration: 0.3,
      ease: "power3.out",
    });
  };

  const move = (event: MouseEvent) => {
    const rect = element.getBoundingClientRect();

    const x =
      event.clientX - (rect.left + rect.width / 2);

    const y =
      event.clientY - (rect.top + rect.height / 2);

    gsap.to(element, {
      x: x * 0.05,
      y: y * 0.05,
      duration: 0.35,
      ease: "power3.out",
    });

    if (element.classList.contains("hero-reel")) {
  const rotateX = -(y / rect.height) * 4;
  const rotateY = (x / rect.width) * 4;

  gsap.to(element, {
    rotateX,
    rotateY,
    transformPerspective: 800,
    duration: 0.4,
    ease: "power3.out",
  });
}
  };

  const leave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
    });

    gsap.to(ring, {
      scale: 1,
      duration: 0.3,
      ease: "power3.out",
    });

    if (element.classList.contains("hero-reel")) {
  gsap.to(element, {
    rotateX: 0,
    rotateY: 0,
    duration: 0.6,
    ease: "power3.out",
  });
}
  };

  element.addEventListener("mouseenter", enter);
  element.addEventListener("mousemove", move);
  element.addEventListener("mouseleave", leave);

  magneticHandlers.push({
    element,
    enter,
    move,
    leave,
  });
});

    window.addEventListener("mousemove", moveCursor);

    return () => {
  window.removeEventListener("mousemove", moveCursor);

  magneticHandlers.forEach(
    ({ element, enter, move, leave }) => {
      element.removeEventListener("mouseenter", enter);
      element.removeEventListener("mousemove", move);
      element.removeEventListener("mouseleave", leave);
    }
  );
};
  }, []);

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={ringRef} className="custom-cursor-ring" />
    </>
  );
}