import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import cors from "cors";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 * =========================================================
 * RESEND — OWNER ENQUIRY EMAIL
 * =========================================================
 */

const resend = new Resend(process.env.RESEND_API_KEY);

const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/*
 * =========================================================
 * GOOGLE GMAIL OAUTH
 * =========================================================
 *
 * Gmail is used only for the automatic confirmation email
 * sent back to the client.
 *
 * Required Render/local environment variables:
 *
 * GOOGLE_CLIENT_ID
 * GOOGLE_CLIENT_SECRET
 * GOOGLE_REDIRECT_URI
 * GMAIL_USER
 * GMAIL_REFRESH_TOKEN
 *
 * GOOGLE_REDIRECT_URI must exactly match the URI configured
 * in Google Cloud OAuth credentials.
 */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "https://nura-video-portfolio.onrender.com/oauth2callback";

const GMAIL_USER =
  process.env.GMAIL_USER || process.env.CONTACT_RECEIVER;

const GMAIL_SEND_SCOPE =
  "https://www.googleapis.com/auth/gmail.send";

const oauth2Client =
  GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
    ? new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
      )
    : null;

/*
 * One-time OAuth state values.
 *
 * This protects the authorization callback from unsolicited
 * requests. The value only needs to survive for the short
 * duration of the authorization flow.
 */

const oauthStates = new Map();
const OAUTH_STATE_TTL = 10 * 60 * 1000;

function createOAuthState() {
  const state = crypto.randomBytes(32).toString("hex");

  oauthStates.set(state, Date.now() + OAUTH_STATE_TTL);

  return state;
}

function consumeOAuthState(state) {
  const expiresAt = oauthStates.get(state);

  if (!expiresAt) {
    return false;
  }

  oauthStates.delete(state);

  return Date.now() <= expiresAt;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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
 * GMAIL OAUTH ROUTES
 * =========================================================
 */

app.get("/auth/google", (req, res) => {
  if (!oauth2Client) {
    return res.status(500).send(
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
    );
  }

  const state = createOAuthState();

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [GMAIL_SEND_SCOPE],
    state,
    include_granted_scopes: true,
  });

  return res.redirect(authorizationUrl);
});

app.get("/oauth2callback", async (req, res) => {
  try {
    if (!oauth2Client) {
      return res.status(500).send(
        "Google OAuth is not configured on this server."
      );
    }

    const code =
      typeof req.query.code === "string"
        ? req.query.code
        : null;

    const state =
      typeof req.query.state === "string"
        ? req.query.state
        : null;

    const oauthError =
      typeof req.query.error === "string"
        ? req.query.error
        : null;

    if (oauthError) {
      return res.status(400).send(`
        <h2>Google authorization was not completed.</h2>
        <p>Error: ${escapeHtml(oauthError)}</p>
        <p>You can close this page and try again.</p>
      `);
    }

    if (!code || !state || !consumeOAuthState(state)) {
      return res.status(400).send(
        "Invalid or expired OAuth authorization request. Start again from /auth/google."
      );
    }

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return res.status(400).send(`
        <h2>No refresh token was returned.</h2>
        <p>Start the authorization again. The server requests offline access and consent.</p>
      `);
    }

    const refreshToken = tokens.refresh_token;

    console.log(
      "Google Gmail OAuth authorization completed successfully."
    );

    return res.status(200).send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Nura Portfolio — Gmail Connected</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 760px;
              margin: 60px auto;
              padding: 0 24px;
              line-height: 1.6;
              color: #222;
            }
            textarea {
              width: 100%;
              min-height: 140px;
              box-sizing: border-box;
              padding: 12px;
              font-family: monospace;
            }
            .warning {
              padding: 14px;
              border: 1px solid #d99;
              background: #fff5f5;
            }
          </style>
        </head>
        <body>
          <h1>Gmail authorization successful ✓</h1>
          <p>
            Copy the refresh token below and save it as the
            <strong>GMAIL_REFRESH_TOKEN</strong> environment variable
            in Render.
          </p>

          <textarea readonly>${escapeHtml(refreshToken)}</textarea>

          <div class="warning">
            <strong>Security:</strong> this refresh token is private.
            Do not commit it to GitHub or share it in chat.
          </div>

          <p>
            After adding it to Render, redeploy the service and then
            test the contact form.
          </p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Google OAuth callback error:", error);

    return res.status(500).send(`
      <h2>Google authorization failed.</h2>
      <p>Check the Render logs for the technical error.</p>
    `);
  }
});

/*
 * =========================================================
 * GMAIL CONFIRMATION TRANSPORTER
 * =========================================================
 */

function createGmailTransporter() {
  if (
    !oauth2Client ||
    !GMAIL_USER ||
    !process.env.GMAIL_REFRESH_TOKEN
  ) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: GMAIL_USER,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
}

/*
 * =========================================================
 * RATE LIMITING
 * =========================================================
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

    const validationError = validateContactData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

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
      typeof deadline === "string" ? deadline.trim() : "";
    const cleanBudget =
      typeof budget === "string" ? budget.trim() : "";
    const cleanSocial =
      typeof social === "string" ? social.trim() : "";
    const cleanProject = project.trim();

    /*
     * =====================================================
     * 1. SEND ENQUIRY TO NURA THROUGH RESEND
     * =====================================================
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
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
            <h2>New Video Editing Project</h2>
            <p>A new project enquiry was submitted through your portfolio.</p>
            <hr />
            <p><strong>Name:</strong><br />${escapeHtml(cleanName)}</p>
            <p><strong>Email:</strong><br /><a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a></p>
            <p><strong>Video Type:</strong><br />${escapeHtml(cleanVideoType)}</p>
            <p><strong>Deadline:</strong><br />${escapeHtml(cleanDeadline || "Not specified")}</p>
            <p><strong>Budget:</strong><br />${escapeHtml(cleanBudget || "Not specified")}</p>
            <p><strong>Social / Channel:</strong><br />${escapeHtml(cleanSocial || "Not specified")}</p>
            <p><strong>Project + References:</strong><br />${escapeHtml(cleanProject).replaceAll("\n", "<br />")}</p>
            <hr />
            <p><strong>Client email:</strong> ${escapeHtml(cleanEmail)}</p>
            <p>Reply directly to this email to contact the client.</p>
            <p>Sent from <strong>Nura Video Portfolio</strong>.</p>
          </div>
        `,
      });

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
     * 2. SEND CONFIRMATION TO CLIENT THROUGH GMAIL
     * =====================================================
     */

    const gmailTransporter = createGmailTransporter();

    if (!gmailTransporter) {
      console.warn(
        "Gmail confirmation skipped: Gmail OAuth environment variables are not fully configured."
      );

      return res.status(200).json({
        success: true,
        message:
          "Project enquiry sent successfully. I'll get back to you soon.",
      });
    }

    try {
      console.log(
        `Sending confirmation email to ${cleanEmail}`
      );

      gmailTransporter.sendMail({
          from: `Nura — Video Editor <${GMAIL_USER}>`,
          to: cleanEmail,
          replyTo: GMAIL_USER,
          subject: "Received — Let's bring your vision to life",

text: `
Hi ${cleanName},

Thank you for reaching out to Nura.

I've received your project enquiry and will review the details carefully. I'll get back to you shortly with the next steps, availability, and any questions I may have about your project.

PROJECT DETAILS

Project type:
${cleanVideoType}

Deadline:
${cleanDeadline || "Not specified"}

Budget:
${cleanBudget || "Not specified"}

WHAT HAPPENS NEXT

01 — REVIEW
I'll go through your requirements, references, timeline, and budget.

02 — DISCUSS
If the project is a good fit, we'll connect to clarify the creative direction and expectations.

03 — CREATE
Once everything is aligned, we'll move forward with the editing process and bring the concept to life.

No action is needed from you right now. I'll be in touch soon.

Looking forward to working with you.

—
NURA
Video Editor
Creative editing for brands, creators & businesses

Portfolio:
https://nura-video-portfolio.vercel.app/
`.trim(),

html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Project enquiry received — NURA</title>
</head>

<body style="margin:0; padding:0; background:#080808; font-family:Arial, Helvetica, sans-serif; color:#f5f5f5;">

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#080808; margin:0; padding:0;"
  >
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="max-width:640px; background:#101010; border:1px solid #292929;"
        >

          <!-- TOP BRAND BAR -->
          <tr>
            <td style="padding:28px 32px; border-bottom:1px solid #292929;">

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>

                  <td
                    style="
                      font-size:20px;
                      font-weight:800;
                      letter-spacing:1px;
                      color:#ffffff;
                    "
                  >
                    NURA
                  </td>

                  <td
                    align="right"
                    style="
                      font-size:10px;
                      font-weight:bold;
                      letter-spacing:2px;
                      color:#777777;
                    "
                  >
                    VIDEO EDITOR
                  </td>

                </tr>
              </table>

            </td>
          </tr>


          <!-- HERO -->
          <tr>
            <td style="padding:48px 32px 36px 32px;">

              <div
                style="
                  font-size:10px;
                  font-weight:bold;
                  letter-spacing:2px;
                  color:#ff641c;
                  margin-bottom:18px;
                "
              >
                PROJECT ENQUIRY · RECEIVED
              </div>

              <h1
                style="
                  margin:0;
                  font-size:34px;
                  line-height:1.15;
                  font-weight:700;
                  letter-spacing:-1px;
                  color:#ffffff;
                "
              >
                Let's bring your
                <br />
                vision to life.
              </h1>

              <div
                style="
                  width:42px;
                  height:3px;
                  background:#ff641c;
                  margin:28px 0;
                "
              ></div>

              <p
                style="
                  margin:0;
                  font-size:15px;
                  line-height:1.8;
                  color:#b8b8b8;
                "
              >
                Hi ${escapeHtml(cleanName)},
                <br /><br />
                Thank you for reaching out to Nura.
                I've received your project enquiry and will review the
                details carefully. I'll get back to you shortly with
                the next steps and availability.
              </p>

            </td>
          </tr>


          <!-- PROJECT DETAILS -->
          <tr>
            <td style="padding:0 32px 36px 32px;">

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background:#151515;
                  border:1px solid #292929;
                "
              >

                <tr>
                  <td
                    colspan="2"
                    style="
                      padding:20px 22px;
                      border-bottom:1px solid #292929;
                      font-size:10px;
                      font-weight:bold;
                      letter-spacing:2px;
                      color:#ff641c;
                    "
                  >
                    PROJECT DETAILS
                  </td>
                </tr>

                <tr>
                  <td
                    width="50%"
                    style="
                      padding:18px 22px;
                      border-bottom:1px solid #292929;
                      color:#777777;
                      font-size:11px;
                      text-transform:uppercase;
                      letter-spacing:1px;
                    "
                  >
                    Project type
                  </td>

                  <td
                    width="50%"
                    style="
                      padding:18px 22px;
                      border-bottom:1px solid #292929;
                      color:#ffffff;
                      font-size:13px;
                      font-weight:bold;
                    "
                  >
                    ${escapeHtml(cleanVideoType)}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:18px 22px;
                      border-bottom:1px solid #292929;
                      color:#777777;
                      font-size:11px;
                      text-transform:uppercase;
                      letter-spacing:1px;
                    "
                  >
                    Deadline
                  </td>

                  <td
                    style="
                      padding:18px 22px;
                      border-bottom:1px solid #292929;
                      color:#ffffff;
                      font-size:13px;
                    "
                  >
                    ${escapeHtml(cleanDeadline || "Not specified")}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:18px 22px;
                      color:#777777;
                      font-size:11px;
                      text-transform:uppercase;
                      letter-spacing:1px;
                    "
                  >
                    Budget
                  </td>

                  <td
                    style="
                      padding:18px 22px;
                      color:#ffffff;
                      font-size:13px;
                    "
                  >
                    ${escapeHtml(cleanBudget || "Not specified")}
                  </td>
                </tr>

              </table>

            </td>
          </tr>


          <!-- NEXT STEPS -->
          <tr>
            <td style="padding:0 32px 42px 32px;">

              <div
                style="
                  font-size:10px;
                  font-weight:bold;
                  letter-spacing:2px;
                  color:#ff641c;
                  margin-bottom:20px;
                "
              >
                WHAT HAPPENS NEXT
              </div>


              <!-- STEP 01 -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-bottom:14px;"
              >
                <tr>

                  <td
                    valign="top"
                    width="58"
                    style="
                      font-size:13px;
                      font-weight:bold;
                      color:#ff641c;
                    "
                  >
                    01
                  </td>

                  <td valign="top">

                    <div
                      style="
                        font-size:14px;
                        font-weight:bold;
                        color:#ffffff;
                        margin-bottom:5px;
                      "
                    >
                      REVIEW
                    </div>

                    <div
                      style="
                        font-size:12px;
                        line-height:1.7;
                        color:#888888;
                      "
                    >
                      I'll go through your requirements, references,
                      timeline, and budget.
                    </div>

                  </td>

                </tr>
              </table>


              <!-- STEP 02 -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-bottom:14px;"
              >
                <tr>

                  <td
                    valign="top"
                    width="58"
                    style="
                      font-size:13px;
                      font-weight:bold;
                      color:#ff641c;
                    "
                  >
                    02
                  </td>

                  <td valign="top">

                    <div
                      style="
                        font-size:14px;
                        font-weight:bold;
                        color:#ffffff;
                        margin-bottom:5px;
                      "
                    >
                      DISCUSS
                    </div>

                    <div
                      style="
                        font-size:12px;
                        line-height:1.7;
                        color:#888888;
                      "
                    >
                      If the project is a good fit, we'll connect to
                      clarify the creative direction and expectations.
                    </div>

                  </td>

                </tr>
              </table>


              <!-- STEP 03 -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>

                  <td
                    valign="top"
                    width="58"
                    style="
                      font-size:13px;
                      font-weight:bold;
                      color:#ff641c;
                    "
                  >
                    03
                  </td>

                  <td valign="top">

                    <div
                      style="
                        font-size:14px;
                        font-weight:bold;
                        color:#ffffff;
                        margin-bottom:5px;
                      "
                    >
                      CREATE
                    </div>

                    <div
                      style="
                        font-size:12px;
                        line-height:1.7;
                        color:#888888;
                      "
                    >
                      Once everything is aligned, we'll move forward
                      with the editing process and bring the concept
                      to life.
                    </div>

                  </td>

                </tr>
              </table>

            </td>
          </tr>


          <!-- CLOSING -->
          <tr>
            <td
              style="
                padding:34px 32px;
                background:#151515;
                border-top:1px solid #292929;
                border-bottom:1px solid #292929;
              "
            >

              <p
                style="
                  margin:0 0 22px 0;
                  font-size:14px;
                  line-height:1.8;
                  color:#b8b8b8;
                "
              >
                No action is needed from you right now.
                I'll review everything and be in touch soon.
              </p>

              <p
                style="
                  margin:0;
                  font-size:14px;
                  line-height:1.7;
                  color:#ffffff;
                "
              >
                Looking forward to working with you.
              </p>

            </td>
          </tr>


          <!-- SIGNATURE -->
          <tr>
            <td style="padding:32px;">

              <div
                style="
                  font-size:18px;
                  font-weight:800;
                  letter-spacing:1px;
                  color:#ffffff;
                  margin-bottom:5px;
                "
              >
                NURA
              </div>

              <div
                style="
                  font-size:10px;
                  letter-spacing:2px;
                  color:#777777;
                  margin-bottom:24px;
                "
              >
                VIDEO EDITOR
              </div>

              <a
                href="https://nura-video-portfolio.vercel.app/"
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#ff641c;
                  color:#ffffff;
                  text-decoration:none;
                  font-size:11px;
                  font-weight:bold;
                  letter-spacing:1px;
                "
              >
                VIEW PORTFOLIO →
              </a>

            </td>
          </tr>


          <!-- FOOTER -->
          <tr>
            <td
              style="
                padding:22px 32px;
                border-top:1px solid #292929;
              "
            >

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>

                  <td
                    style="
                      font-size:10px;
                      color:#555555;
                    "
                  >
                    © 2026 NURA
                  </td>

                  <td
                    align="right"
                    style="
                      font-size:10px;
                      color:#555555;
                    "
                  >
                    Creative editing for brands & creators
                  </td>

                </tr>
              </table>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`.trim(),
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 620px;">
              <h2>Thanks for reaching out, ${escapeHtml(cleanName)}.</h2>

              <p>
                I've received your project enquiry through my portfolio
                and will get back to you as soon as possible.
              </p>

              <div style="margin: 24px 0; padding: 18px; border: 1px solid #e5e5e5; border-radius: 12px;">
                <p><strong>Project type</strong><br />${escapeHtml(cleanVideoType)}</p>
                <p><strong>Deadline</strong><br />${escapeHtml(cleanDeadline || "Not specified")}</p>
                <p><strong>Budget</strong><br />${escapeHtml(cleanBudget || "Not specified")}</p>
                <p><strong>Your project message</strong><br />${escapeHtml(cleanProject).replaceAll("\n", "<br />")}</p>
              </div>

              <p>
                I'll review the details and get back to you soon.
              </p>

              <p>
                Best,<br />
                <strong>Nura</strong><br />
                Video Editor
              </p>
            </div>
          `,
        });

      console.log(
        `Confirmation email sent successfully to ${cleanEmail}. ID: ${confirmationInfo.messageId || "unknown"}`
      );
    } catch (confirmationError) {
      /*
       * The enquiry has already been delivered to Nura.
       * Do not report the whole form as failed just because
       * the optional confirmation email failed.
       */

      console.error(
        "Gmail confirmation email error:",
        confirmationError
      );
    }
    

    return res.status(200).json({
      success: true,
      message:
        "Project enquiry sent successfully. I'll get back to you soon.",
    });
  } catch (error) {
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
  console.log(`Contact backend running on port ${PORT}`);

  if (process.env.RESEND_API_KEY) {
    console.log("Resend API key detected successfully.");
  } else {
    console.error("RESEND_API_KEY is missing.");
  }

  if (process.env.CONTACT_RECEIVER) {
    console.log(
      `Contact receiver configured: ${process.env.CONTACT_RECEIVER}`
    );
  } else {
    console.error("CONTACT_RECEIVER is missing.");
  }

  if (oauth2Client && GMAIL_USER) {
    console.log("Google Gmail OAuth configuration detected.");
  } else {
    console.warn(
      "Google Gmail OAuth is not configured yet. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GMAIL_USER."
    );
  }

  if (process.env.GMAIL_REFRESH_TOKEN) {
    console.log("Gmail refresh token detected.");
  } else {
    console.warn(
      "GMAIL_REFRESH_TOKEN is not configured yet. Complete /auth/google after deployment."
    );
  }
});
