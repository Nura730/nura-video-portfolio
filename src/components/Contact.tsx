export default function Contact() {
  return (
    <>
      <section className="contact-section" id="contact">
        <div className="contact-card">

          <div className="contact-label">
            HAVE FOOTAGE?
          </div>

          <div className="contact-heading">
            <span>Let’s turn it</span>
            <span>into something people</span>
            <span className="contact-watch">watch.</span>
          </div>

          <p className="contact-description">
            Have a reel, travel video or social edit in mind?
            <br />
            Send the footage and let’s build it.
          </p>

          <a
            href="mailto:your@email.com"
            className="contact-button"
          >
            START A PROJECT ↗
          </a>

          <div className="contact-details">
            <span className="contact-details-label">
              EMAIL / INSTAGRAM
            </span>

            <div className="contact-links">
              <a href="mailto:arunshanmugavel12@gmail.com">
                EMAIL
              </a>

              <span>•</span>

              <a
                href="https://instagram.com/itz._.nura._.7"
                target="_blank"
                rel="noreferrer"
              >
                @INSTAGRAM
              </a>
            </div>
          </div>

        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">

          <div className="footer-brand">
            <h3>NURA</h3>
            <span>
              VIDEO EDITOR / CREATIVE STORYTELLER
            </span>
          </div>

          <nav className="footer-nav">
            <a href="#work">WORK</a>
            <a href="#about">ABOUT</a>
            <a
              href="https://instagram.com/yourusername"
              target="_blank"
              rel="noreferrer"
            >
              INSTAGRAM
            </a>
            <a href="mailto:your@email.com">
              EMAIL
            </a>
          </nav>

        </div>

        <div className="footer-bottom">
          <span>
            © 2026 NURA — VIDEO EDITOR
          </span>

          <span>
            DESIGNED FOR MOTION
          </span>
        </div>
      </footer>
    </>
  );
}