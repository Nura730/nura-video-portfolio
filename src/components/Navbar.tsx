import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const navItems = ["WORK", "SERVICES", "TOOLS", "ABOUT", "CONTACT"];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const nav = navRef.current;

    if (!nav) return;

    const items = nav.querySelectorAll(".nav-item");
    const logo = nav.querySelector(".nav-logo");

    const intro = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    intro
      .fromTo(
        logo,
        {
          y: -15,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
        }
      )
      .fromTo(
        items,
        {
          y: -12,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.07,
        },
        "-=0.35"
      );

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      ref={navRef}
      className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}
    >
      <a href="#home" className="nav-logo">
        <strong>NURA</strong>
        <span>VIDEO EDITOR</span>
      </a>

      <nav className="nav-links">
        {navItems.map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="nav-item"
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}