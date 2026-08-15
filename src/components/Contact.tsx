import { useState } from "react";
import type { FormEvent } from "react";
import "./Contact.css";

const videoTypes = [
  "Short-form / Reels",
  "Long-form / YouTube",
  "Social / Creator Content",
  "Travel / Cinematic",
  "Other",
];

type FormState = {
  name: string;
  email: string;
  deadline: string;
  budget: string;
  social: string;
  project: string;
};

type SubmitStatus = "idle" | "sending" | "success" | "error";

const initialForm: FormState = {
  name: "",
  email: "",
  deadline: "",
  budget: "",
  social: "",
  project: "",
};

export default function Contact() {
  const [videoType, setVideoType] = useState("");
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (status !== "idle") {
      setStatus("idle");
      setStatusMessage("");
    }
  };

  const sendProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "sending") return;

    setStatus("sending");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          videoType,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to send your project enquiry."
        );
      }

      setStatus("success");
      setStatusMessage(
        "Project enquiry sent successfully. I'll get back to you soon."
      );

      setForm(initialForm);
      setVideoType("");
    } catch (error) {
      console.error("Contact form error:", error);

      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="contact-page">
      {/* =====================================================
          MAIN CONTACT AREA
      ===================================================== */}

      <section className="contact-main" id="contact">
        {/* ================= LEFT ================= */}

        <div className="contact-left">
          <div className="contact-section-number">
            <span className="contact-section-dot" />
            07 / LET'S WORK
          </div>

          <h1 className="contact-title">
            HAVE SOMETHING
            <br />
            WORTH <span>WATCHING?</span>
          </h1>

          <div className="contact-intro">
            <span className="intro-star">✦</span>

            <p>
              Tell me what you're working on.
              <br />
              I'll help shape the footage into
              <br />
              an edit that fits the idea.
            </p>
          </div>

          <a href="#project-form" className="contact-cta">
            <span>LET'S MAKE IT WORTH WATCHING</span>
            <b>↗</b>
          </a>

          {/* DIRECT CONTACT */}

          <div className="contact-direct">
            <div className="direct-header">
              <span>DIRECT CONTACT</span>

              <span className="accepting">
                <i />
                CURRENTLY ACCEPTING PROJECTS
              </span>
            </div>

            <div className="contact-cards">
              {/* EMAIL */}

              <a
                href="mailto:aruneditor0703@gmail.com"
                className="contact-card"
              >
                <div className="card-top">
                  <span className="card-icon">✉</span>
                  <span className="card-arrow">↗</span>
                </div>

                <span className="card-label">EMAIL</span>

                <strong>
                  aruneditor0703
                  <br />
                  @gmail.com
                </strong>
              </a>

              {/* WHATSAPP */}

              <a
                href="https://wa.me/919361683058"
                target="_blank"
                rel="noreferrer"
                className="contact-card"
              >
                <div className="card-top">
                  <span className="card-icon">◉</span>
                  <span className="card-arrow">↗</span>
                </div>

                <span className="card-label">WHATSAPP</span>

                <strong>
                  +91 93616
                  <br />
                  83058
                </strong>
              </a>

              {/* INSTAGRAM */}

              <a
                href="https://www.instagram.com/itz._.nura._.7"
                target="_blank"
                rel="noreferrer"
                className="contact-card"
              >
                <div className="card-top">
                  <span className="card-icon">◎</span>
                  <span className="card-arrow">↗</span>
                </div>

                <span className="card-label">INSTAGRAM</span>

                <strong>@itz._.nura._.7</strong>
              </a>

              {/* LINKEDIN */}

              <a
                href="https://www.linkedin.com/in/nura-dev"
                target="_blank"
                rel="noreferrer"
                className="contact-card"
              >
                <div className="card-top">
                  <span className="card-icon linkedin-icon">in</span>

                  <span className="card-arrow">↗</span>
                </div>

                <span className="card-label">LINKEDIN</span>

                <strong>/nura-dev</strong>
              </a>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}

        <div className="project-form-card" id="project-form">
          <div className="form-heading-row">
            <div>
              <span className="form-eyebrow">PROJECT ENQUIRY</span>

              <h2>
                LET'S CREATE
                <br />
                SOMETHING <span>GOOD.</span>
              </h2>
            </div>

            <p>
              Give me the basics
              <br />
              and I'll get back to you.
            </p>
          </div>

          <div className="form-divider" />

          {/* FORM */}

          <form onSubmit={sendProject}>
            <div className="form-grid">
              {/* NAME */}

              <label className="contact-field">
                <span>
                  <b>01</b> / NAME
                </span>

                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  required
                  disabled={status === "sending"}
                />
              </label>

              {/* EMAIL */}

              <label className="contact-field">
                <span>
                  <b>02</b> / EMAIL
                </span>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                  required
                  disabled={status === "sending"}
                />
              </label>

              {/* VIDEO TYPE */}

              <label className="contact-field">
                <span>
                  <b>03</b> / VIDEO TYPE
                </span>

                <div className="select-wrap">
                  <select
                    value={videoType}
                    onChange={(e) => {
                      setVideoType(e.target.value);

                      if (status !== "idle") {
                        setStatus("idle");
                        setStatusMessage("");
                      }
                    }}
                    required
                    disabled={status === "sending"}
                  >
                    <option value="" disabled>
                      Select a type
                    </option>

                    {videoTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <span className="select-arrow">↓</span>
                </div>
              </label>

              {/* DEADLINE */}

              <label className="contact-field">
                <span>
                  <b>04</b> / DEADLINE
                </span>

                <input
                  type="text"
                  placeholder="When do you need it?"
                  value={form.deadline}
                  onChange={(e) =>
                    updateField("deadline", e.target.value)
                  }
                  disabled={status === "sending"}
                />
              </label>

              {/* BUDGET */}

              <label className="contact-field">
                <span>
                  <b>05</b> / BUDGET
                </span>

                <input
                  type="text"
                  placeholder="Approximate budget"
                  value={form.budget}
                  onChange={(e) =>
                    updateField("budget", e.target.value)
                  }
                  disabled={status === "sending"}
                />
              </label>

              {/* SOCIAL */}

              <label className="contact-field">
                <span>
                  <b>06</b> / SOCIAL / CHANNEL
                </span>

                <input
                  type="text"
                  placeholder="@instagram / YouTube / website"
                  value={form.social}
                  onChange={(e) =>
                    updateField("social", e.target.value)
                  }
                  disabled={status === "sending"}
                />
              </label>
            </div>

            {/* PROJECT */}

            <label className="contact-field project-field">
              <span>
                <b>07</b> / PROJECT + REFERENCES
              </span>

              <textarea
                placeholder="Tell me about the project, references, style or anything else I should know..."
                value={form.project}
                onChange={(e) =>
                  updateField("project", e.target.value)
                }
                required
                disabled={status === "sending"}
              />
            </label>

            {/* FORM BOTTOM */}

            <div className="form-bottom">
              <div className="privacy-note">
                <span>◇</span>

                <p>
                  Your details are safe and will only be used
                  <br />
                  to discuss your project.
                </p>
              </div>

              <button
                type="submit"
                className="send-project"
                disabled={status === "sending"}
              >
                <span>
                  {status === "sending"
                    ? "SENDING..."
                    : status === "success"
                      ? "SENT ✓"
                      : "SEND PROJECT"}
                </span>

                <b>{status === "sending" ? "…" : "↗"}</b>
              </button>
            </div>

            {statusMessage && (
              <p
                className={`contact-form-status contact-form-status-${status}`}
                role="status"
                aria-live="polite"
              >
                {statusMessage}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="contact-final">
        <div className="final-heading">
          <span>✦</span>

          <h2>
            MAKE SOMETHING
            <br />
            WORTH <strong>WATCHING.</strong>
          </h2>
        </div>

        <div className="final-side">
          <span>LET'S CREATE IMPACT.</span>
          <i />
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="contact-footer">
        <div className="footer-brand">
          <strong>NURA</strong>

          <span>VIDEO EDITOR</span>
        </div>

        <nav className="footer-nav">
          <a href="#work">WORK</a>
          <a href="#services">SERVICES</a>
          <a href="#tools">TOOLS</a>
          <a href="#about">ABOUT</a>
          <a href="#process">PROCESS</a>
        </nav>

        <div className="footer-socials">
          <a
            href="https://www.instagram.com/itz._.nura._.7"
            target="_blank"
            rel="noreferrer"
          >
            ◎
          </a>

          <a
            href="https://www.linkedin.com/in/nura-dev"
            target="_blank"
            rel="noreferrer"
          >
            in
          </a>

          <a href="mailto:aruneditor0703@gmail.com">✉</a>
        </div>

        <div className="footer-bottom">
          <span>© 2026 NURA — VIDEO EDITOR</span>
          <span>THANKS FOR SCROLLING.</span>
          <span>MADE TO MOVE.</span>
        </div>
      </footer>
    </div>
  );
}