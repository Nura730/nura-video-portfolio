import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 * =========================================================
 * RESEND
 * =========================================================
 */

const resend = new Resend(process.env.RESEND_API_KEY);

const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/*
 * =========================================================
 * MIDDLEWARE
 * =========================================================
 */

app.use(express.json({ limit: "50kb" }));

app.use(
  cors({
    origin: [
      "https://nura-video-portfolio.vercel.app",
      "http://localhost:5173",
    ],
  })
);

/*
 * =========================================================
 * RATE LIMITING
 * =========================================================
 *
 * Maximum:
 * 5 submissions from the same IP
 * within 60 seconds.
 */

const submissions = new Map();

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const previous = submissions.get(ip) || [];

  const recent = previous.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    submissions.set(ip, recent);
    return false;
  }

  recent.push(now);
  submissions.set(ip, recent);

  return true;
}

/*
 * =========================================================
 * CONTACT FORM VALIDATION
 * =========================================================
 */

function validateContactData(body) {
  const {
    name,
    email,
    videoType,
    project,
  } = body;

  if (
    typeof name !== "string" ||
    name.trim().length < 2
  ) {
    return "Please enter your name.";
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return "Please enter a valid email address.";
  }

  if (
    typeof videoType !== "string" ||
    videoType.trim().length === 0
  ) {
    return "Please select a video type.";
  }

  if (
    typeof project !== "string" ||
    project.trim().length < 10
  ) {
    return "Please tell me a little more about your project.";
  }

  return null;
}

/*
 * =========================================================
 * CONTACT API
 * =========================================================
 */

app.post("/api/contact", async (req, res) => {
  try {
    /*
     * -----------------------------------------------------
     * 1. RATE LIMIT
     * -----------------------------------------------------
     */

    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
      req.socket.remoteAddress ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        success: false,
        message:
          "Too many submissions. Please wait a minute and try again.",
      });
    }

    /*
     * -----------------------------------------------------
     * 2. VALIDATE FORM
     * -----------------------------------------------------
     */

    const validationError = validateContactData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    /*
     * -----------------------------------------------------
     * 3. EXTRACT DATA
     * -----------------------------------------------------
     */

    const {
      name,
      email,
      videoType,
      deadline = "",
      budget = "",
      social = "",
      project,
    } = req.body;

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanVideoType = videoType.trim();

    const cleanDeadline =
      typeof deadline === "string"
        ? deadline.trim()
        : "";

    const cleanBudget =
      typeof budget === "string"
        ? budget.trim()
        : "";

    const cleanSocial =
      typeof social === "string"
        ? social.trim()
        : "";

    const cleanProject = project.trim();

    /*
     * =====================================================
     * 4. SEND ENQUIRY TO PORTFOLIO OWNER
     * =====================================================
     *
     * FREE RESEND SETUP:
     *
     * The email is always sent to CONTACT_RECEIVER.
     *
     * The client's email is used as replyTo.
     *
     * Therefore:
     *
     * YOU receive the enquiry.
     * When you click Reply in Gmail,
     * the reply goes to the client.
     */

    console.log(
      `Sending enquiry email for ${cleanName} <${cleanEmail}>`
    );

    const { data: enquiryData, error: enquiryError } =
      await resend.emails.send({
        from: `Nura Portfolio <${RESEND_FROM_EMAIL}>`,

        to: [process.env.CONTACT_RECEIVER],

        replyTo: cleanEmail,

        subject: `New Video Editing Project — ${cleanName}`,

        text: `
New project enquiry from your portfolio.

Name:
${cleanName}

Email:
${cleanEmail}

Video Type:
${cleanVideoType}

Deadline:
${cleanDeadline || "Not specified"}

Budget:
${cleanBudget || "Not specified"}

Social / Channel:
${cleanSocial || "Not specified"}

Project + References:
${cleanProject}

--------------------------------
Client email: ${cleanEmail}

Reply directly to this email to contact the client.

Sent from Nura Video Portfolio
        `.trim(),

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #222;
            "
          >

            <h2>New Video Editing Project</h2>

            <p>
              A new project enquiry was submitted
              through your portfolio.
            </p>

            <hr />

            <p>
              <strong>Name:</strong><br />
              ${cleanName}
            </p>

            <p>
              <strong>Email:</strong><br />
              <a href="mailto:${cleanEmail}">
                ${cleanEmail}
              </a>
            </p>

            <p>
              <strong>Video Type:</strong><br />
              ${cleanVideoType}
            </p>

            <p>
              <strong>Deadline:</strong><br />
              ${cleanDeadline || "Not specified"}
            </p>

            <p>
              <strong>Budget:</strong><br />
              ${cleanBudget || "Not specified"}
            </p>

            <p>
              <strong>Social / Channel:</strong><br />
              ${cleanSocial || "Not specified"}
            </p>

            <p>
              <strong>Project + References:</strong><br />
              ${cleanProject.replace(/\n/g, "<br />")}
            </p>

            <hr />

            <p>
              <strong>Client email:</strong>
              ${cleanEmail}
            </p>

            <p>
              Reply directly to this email to contact the client.
            </p>

            <p>
              Sent from <strong>Nura Video Portfolio</strong>.
            </p>

          </div>
        `,
      });

    /*
     * -----------------------------------------------------
     * 5. CHECK RESEND RESULT
     * -----------------------------------------------------
     */

    if (enquiryError) {
      console.error(
        "Resend enquiry email error:",
        enquiryError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to send your enquiry right now. Please try again or contact me directly.",
      });
    }

    console.log(
      `Enquiry email sent successfully. ID: ${
        enquiryData?.id || "unknown"
      }`
    );

    /*
     * =====================================================
     * 6. SUCCESS
     * =====================================================
     *
     * IMPORTANT:
     *
     * We intentionally DO NOT send a confirmation
     * email to the client.
     *
     * Resend testing mode only allows sending to the
     * account's own email address.
     *
     * The enquiry has already reached Nura.
     */

    return res.status(200).json({
      success: true,
      message:
        "Project enquiry sent successfully. I'll get back to you soon.",
    });

  } catch (error) {
    /*
     * =====================================================
     * 7. GENERAL ERROR
     * =====================================================
     */

    console.error("Contact API error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to send your enquiry right now. Please try again or contact me directly.",
    });
  }
});

/*
 * =========================================================
 * SERVE VITE BUILD
 * =========================================================
 */

const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

/*
 * =========================================================
 * START SERVER
 * =========================================================
 */

app.listen(PORT, () => {
  console.log(
    `Contact backend running on port ${PORT}`
  );

  if (process.env.RESEND_API_KEY) {
    console.log(
      "Resend API key detected successfully."
    );
  } else {
    console.error(
      "RESEND_API_KEY is missing."
    );
  }

  if (process.env.CONTACT_RECEIVER) {
    console.log(
      `Contact receiver configured: ${process.env.CONTACT_RECEIVER}`
    );
  } else {
    console.error(
      "CONTACT_RECEIVER is missing."
    );
  }
});