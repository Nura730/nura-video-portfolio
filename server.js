import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import cors from "cors";
import { google } from "googleapis";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================================================
   CONFIGURATION
========================================================= */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "https://nura-video-portfolio.onrender.com/oauth2callback";

const GMAIL_USER =
  process.env.GMAIL_USER || "aruneditor0703@gmail.com";

const CONTACT_RECEIVER =
  process.env.CONTACT_RECEIVER || "aruneditor0703@gmail.com";

const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

/* =========================================================
   GOOGLE OAUTH
========================================================= */

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

/* =========================================================
   OAUTH STATE
========================================================= */

const oauthStates = new Map();

const OAUTH_STATE_TTL = 10 * 60 * 1000;

function createOAuthState() {
  const state = crypto.randomBytes(32).toString("hex");

  oauthStates.set(
    state,
    Date.now() + OAUTH_STATE_TTL
  );

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

/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  express.json({
    limit: "50kb",
  })
);

app.use(
  cors({
    origin: [
      "https://nura-video-portfolio.vercel.app",
      "http://localhost:5173",
      "http://localhost:4173",
    ],
  })
);

/* =========================================================
   GOOGLE OAUTH START
========================================================= */

app.get("/auth/google", (req, res) => {
  if (!oauth2Client) {
    return res.status(500).send(
      "Google OAuth is not configured. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
    );
  }

  const state = createOAuthState();

  const authorizationUrl =
    oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [GMAIL_SEND_SCOPE],
      state,
      include_granted_scopes: true,
    });

  return res.redirect(authorizationUrl);
});

/* =========================================================
   GOOGLE OAUTH CALLBACK
========================================================= */

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
      `);
    }

    if (
      !code ||
      !state ||
      !consumeOAuthState(state)
    ) {
      return res.status(400).send(
        "Invalid or expired OAuth request. Open /auth/google and try again."
      );
    }

    const { tokens } =
      await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return res.status(400).send(`
        <h2>No refresh token returned.</h2>
        <p>
          Start the authorization again with consent.
        </p>
      `);
    }

    const refreshToken = tokens.refresh_token;

    console.log(
      "Google Gmail OAuth authorization completed successfully."
    );

    return res.status(200).send(`
      <!DOCTYPE html>

      <html>
      <head>
        <meta charset="UTF-8">
        <title>Gmail Authorization Successful</title>

        <style>
          body {
            background:#080808;
            color:#fff;
            font-family:Arial,sans-serif;
            padding:40px;
          }

          .box {
            max-width:800px;
            margin:auto;
            background:#111;
            border:1px solid #333;
            padding:30px;
          }

          textarea {
            width:100%;
            min-height:160px;
            box-sizing:border-box;
            background:#050505;
            color:#fff;
            border:1px solid #444;
            padding:15px;
            font-family:monospace;
          }

          .warning {
            margin-top:20px;
            padding:15px;
            border:1px solid #ff641c;
            color:#ffb08b;
          }
        </style>
      </head>

      <body>

        <div class="box">

          <h1>Gmail authorization successful ✓</h1>

          <p>
            Copy the refresh token and save it in Render as:
          </p>

          <p>
            <strong>GMAIL_REFRESH_TOKEN</strong>
          </p>

          <textarea readonly>${escapeHtml(
            refreshToken
          )}</textarea>

          <div class="warning">
            <strong>IMPORTANT:</strong>
            Never commit this token to GitHub
            or share it publicly.
          </div>

          <p>
            After saving it in Render,
            redeploy the service.
          </p>

        </div>

      </body>
      </html>
    `);
  } catch (error) {
    console.error(
      "Google OAuth callback error:",
      error
    );

    return res.status(500).send(`
      <h2>Google authorization failed.</h2>
      <p>Check the Render logs.</p>
    `);
  }
});

/* =========================================================
   GMAIL TRANSPORTER
========================================================= */

function createGmailTransporter() {
  if (
    !oauth2Client ||
    !GMAIL_USER ||
    !GMAIL_REFRESH_TOKEN
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

      refreshToken: GMAIL_REFRESH_TOKEN,
    },
  });
}

/* =========================================================
   RATE LIMIT
========================================================= */

const submissions = new Map();

const RATE_LIMIT_WINDOW = 60 * 1000;

const MAX_SUBMISSIONS_PER_WINDOW = 5;

function checkRateLimit(ip) {
  const now = Date.now();

  const previous =
    submissions.get(ip) || [];

  const recent = previous.filter(
    (timestamp) =>
      now - timestamp <
      RATE_LIMIT_WINDOW
  );

  if (
    recent.length >=
    MAX_SUBMISSIONS_PER_WINDOW
  ) {
    submissions.set(ip, recent);

    return false;
  }

  recent.push(now);

  submissions.set(ip, recent);

  return true;
}

/* =========================================================
   VALIDATION
========================================================= */

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
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim()
    )
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

/* =========================================================
   CLIENT CONFIRMATION EMAIL
========================================================= */

function createClientConfirmationEmail({
  name,
  videoType,
  deadline,
  budget,
  project,
}) {
  const safeName = escapeHtml(name);
  const safeVideoType =
    escapeHtml(videoType);

  const safeDeadline = escapeHtml(
    deadline || "Not specified"
  );

  const safeBudget = escapeHtml(
    budget || "Not specified"
  );

  const safeProject = escapeHtml(
    project
  ).replaceAll("\n", "<br>");

  return `
<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1.0"
/>

<meta
  name="x-apple-disable-message-reformatting"
/>

<title>
Project enquiry received — NURA
</title>

</head>

<body
style="
margin:0;
padding:0;
background:#080808;
font-family:Arial,Helvetica,sans-serif;
color:#f5f5f5;
"
>

<table
role="presentation"
width="100%"
cellpadding="0"
cellspacing="0"
border="0"
style="background:#080808;"
>

<tr>

<td
align="center"
style="padding:40px 16px;"
>

<table
role="presentation"
width="100%"
cellpadding="0"
cellspacing="0"
border="0"
style="
max-width:640px;
background:#101010;
border:1px solid #292929;
"
>

<!-- BRAND -->

<tr>

<td
style="
padding:28px 32px;
border-bottom:1px solid #292929;
"
>

<table
width="100%"
role="presentation"
>

<tr>

<td
style="
font-size:20px;
font-weight:800;
letter-spacing:1px;
color:#fff;
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
color:#777;
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

<td
style="
padding:48px 32px 36px;
"
>

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
color:#fff;
"
>
Let's bring your
<br>
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

Hi ${safeName},

<br><br>

Thank you for reaching out to Nura.

I've received your project enquiry and
will review the details carefully.

I'll get back to you shortly with
the next steps and availability.

</p>

</td>

</tr>


<!-- DETAILS -->

<tr>

<td
style="
padding:0 32px 36px;
"
>

<table
width="100%"
role="presentation"
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
color:#777;
font-size:11px;
text-transform:uppercase;
letter-spacing:1px;
"
>
Project type
</td>

<td
style="
padding:18px 22px;
border-bottom:1px solid #292929;
color:#fff;
font-size:13px;
font-weight:bold;
"
>
${safeVideoType}
</td>

</tr>


<tr>

<td
style="
padding:18px 22px;
border-bottom:1px solid #292929;
color:#777;
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
color:#fff;
font-size:13px;
"
>
${safeDeadline}
</td>

</tr>


<tr>

<td
style="
padding:18px 22px;
color:#777;
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
color:#fff;
font-size:13px;
"
>
${safeBudget}
</td>

</tr>

</table>

</td>

</tr>


<!-- NEXT STEPS -->

<tr>

<td
style="
padding:0 32px 42px;
"
>

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


<table
width="100%"
role="presentation"
style="margin-bottom:18px;"
>

<tr>

<td
width="58"
valign="top"
style="
font-size:13px;
font-weight:bold;
color:#ff641c;
"
>
01
</td>

<td>

<div
style="
font-size:14px;
font-weight:bold;
color:#fff;
margin-bottom:5px;
"
>
REVIEW
</div>

<div
style="
font-size:12px;
line-height:1.7;
color:#888;
"
>
I'll review your requirements,
references, timeline and budget.
</div>

</td>

</tr>

</table>


<table
width="100%"
role="presentation"
style="margin-bottom:18px;"
>

<tr>

<td
width="58"
valign="top"
style="
font-size:13px;
font-weight:bold;
color:#ff641c;
"
>
02
</td>

<td>

<div
style="
font-size:14px;
font-weight:bold;
color:#fff;
margin-bottom:5px;
"
>
DISCUSS
</div>

<div
style="
font-size:12px;
line-height:1.7;
color:#888;
"
>
If the project is a good fit,
we'll connect to clarify the
creative direction and expectations.
</div>

</td>

</tr>

</table>


<table
width="100%"
role="presentation"
>

<tr>

<td
width="58"
valign="top"
style="
font-size:13px;
font-weight:bold;
color:#ff641c;
"
>
03
</td>

<td>

<div
style="
font-size:14px;
font-weight:bold;
color:#fff;
margin-bottom:5px;
"
>
CREATE
</div>

<div
style="
font-size:12px;
line-height:1.7;
color:#888;
"
>
Once everything is aligned,
we'll move forward with the
editing process.
</div>

</td>

</tr>

</table>

</td>

</tr>


<!-- PROJECT MESSAGE -->

<tr>

<td
style="
padding:30px 32px;
background:#151515;
border-top:1px solid #292929;
border-bottom:1px solid #292929;
"
>

<div
style="
font-size:10px;
font-weight:bold;
letter-spacing:2px;
color:#ff641c;
margin-bottom:14px;
"
>
YOUR MESSAGE
</div>

<p
style="
margin:0;
font-size:13px;
line-height:1.8;
color:#aaa;
"
>
${safeProject}
</p>

</td>

</tr>


<!-- CLOSING -->

<tr>

<td
style="padding:34px 32px;"
>

<p
style="
margin:0 0 20px;
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
color:#fff;
"
>
Looking forward to working with you.
</p>

</td>

</tr>


<!-- SIGNATURE -->

<tr>

<td
style="
padding:32px;
border-top:1px solid #292929;
"
>

<div
style="
font-size:18px;
font-weight:800;
letter-spacing:1px;
color:#fff;
"
>
NURA
</div>

<div
style="
font-size:10px;
letter-spacing:2px;
color:#777;
margin-top:5px;
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
color:#fff;
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

<div
style="
font-size:10px;
color:#555;
"
>
© 2026 NURA · Creative editing for brands & creators
</div>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
  `.trim();
}

/* =========================================================
   CONTACT API
========================================================= */

app.post("/api/contact", async (req, res) => {
  try {
    /* ---------------------------------------------
       RATE LIMIT
    --------------------------------------------- */

    const ip =
      req.headers["x-forwarded-for"]
        ?.toString()
        .split(",")[0]
        .trim() ||
      req.socket.remoteAddress ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        success: false,
        message:
          "Too many submissions. Please wait a minute and try again.",
      });
    }

    /* ---------------------------------------------
       VALIDATION
    --------------------------------------------- */

    const validationError =
      validateContactData(req.body);

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

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim();

    const cleanVideoType =
      videoType.trim();

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

    const cleanProject =
      project.trim();

    /* ---------------------------------------------
       GMAIL CHECK
    --------------------------------------------- */

    const gmailTransporter =
      createGmailTransporter();

    if (!gmailTransporter) {
      console.error(
        "Gmail is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Email service is not configured correctly. Please try again later.",
      });
    }

    /* ---------------------------------------------
       OWNER EMAIL
    --------------------------------------------- */

    console.log(
      `Sending enquiry email for ${cleanName} <${cleanEmail}>`
    );

    const ownerEmailInfo =
      await gmailTransporter.sendMail({
        from: `Nura Portfolio <${GMAIL_USER}>`,

        to: CONTACT_RECEIVER,

        replyTo: cleanEmail,

        subject:
          `New Video Editing Project — ${cleanName}`,

        text: `
A new project enquiry was submitted through your portfolio.

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

Reply directly to this email to contact the client.

Nura Video Portfolio
        `.trim(),

        html: `
<!DOCTYPE html>

<html>

<body
style="
font-family:Arial,sans-serif;
line-height:1.7;
color:#222;
background:#f5f5f5;
padding:30px;
"
>

<div
style="
max-width:650px;
margin:auto;
background:#fff;
padding:35px;
border:1px solid #ddd;
"
>

<h2
style="
margin-top:0;
"
>
New Video Editing Project
</h2>

<p>
A new project enquiry was submitted through your portfolio.
</p>

<hr>

<p>
<strong>Name</strong><br>
${escapeHtml(cleanName)}
</p>

<p>
<strong>Email</strong><br>

<a href="mailto:${escapeHtml(cleanEmail)}">
${escapeHtml(cleanEmail)}
</a>

</p>

<p>
<strong>Video Type</strong><br>
${escapeHtml(cleanVideoType)}
</p>

<p>
<strong>Deadline</strong><br>
${escapeHtml(
  cleanDeadline || "Not specified"
)}
</p>

<p>
<strong>Budget</strong><br>
${escapeHtml(
  cleanBudget || "Not specified"
)}
</p>

<p>
<strong>Social / Channel</strong><br>
${escapeHtml(
  cleanSocial || "Not specified"
)}
</p>

<p>
<strong>Project + References</strong><br>
${escapeHtml(cleanProject).replaceAll(
  "\n",
  "<br>"
)}
</p>

<hr>

<p>
<strong>Client email:</strong>
${escapeHtml(cleanEmail)}
</p>

<p>
Reply directly to this email to contact the client.
</p>

</div>

</body>

</html>
        `.trim(),
      });

    console.log(
      `Enquiry email sent successfully. ID: ${
        ownerEmailInfo?.messageId ||
        "unknown"
      }`
    );

    /* ---------------------------------------------
       CLIENT CONFIRMATION EMAIL
    --------------------------------------------- */

    console.log(
      `Sending confirmation email to ${cleanEmail}`
    );

    const confirmationInfo =
      await gmailTransporter.sendMail({
        from:
          `Nura — Video Editor <${GMAIL_USER}>`,

        to: cleanEmail,

        replyTo: GMAIL_USER,

        subject:
          "Received — Let's bring your vision to life",

        text: `
Hi ${cleanName},

Thank you for reaching out to Nura.

I've received your project enquiry and will review the details carefully.

PROJECT DETAILS

Project type:
${cleanVideoType}

Deadline:
${cleanDeadline || "Not specified"}

Budget:
${cleanBudget || "Not specified"}

WHAT HAPPENS NEXT

01 — REVIEW
I'll review your requirements, references, timeline and budget.

02 — DISCUSS
If the project is a good fit, we'll connect to clarify the creative direction and expectations.

03 — CREATE
Once everything is aligned, we'll move forward with the editing process.

No action is needed from you right now.

I'll be in touch soon.

Looking forward to working with you.

—
NURA
Video Editor

Portfolio:
https://nura-video-portfolio.vercel.app/
        `.trim(),

        html:
          createClientConfirmationEmail({
            name: cleanName,
            videoType: cleanVideoType,
            deadline: cleanDeadline,
            budget: cleanBudget,
            project: cleanProject,
          }),
      });

    console.log(
      `Confirmation email sent successfully to ${cleanEmail}. ID: ${
        confirmationInfo?.messageId ||
        "unknown"
      }`
    );

    /* ---------------------------------------------
       SUCCESS
    --------------------------------------------- */

    return res.status(200).json({
      success: true,

      message:
        "Project enquiry sent successfully. I'll get back to you soon.",
    });
  } catch (error) {
    console.error(
      "Contact API error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to send your enquiry right now. Please try again or contact me directly.",
    });
  }
});

/* =========================================================
   SERVE FRONTEND
========================================================= */

const distPath =
  path.join(__dirname, "dist");

app.use(
  express.static(distPath)
);

app.get("/{*splat}", (_req, res) => {
  res.sendFile(
    path.join(
      distPath,
      "index.html"
    )
  );
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `Contact backend running on port ${PORT}`
  );

  console.log(
    `Gmail user: ${GMAIL_USER}`
  );

  console.log(
    `Contact receiver: ${CONTACT_RECEIVER}`
  );

  console.log(
    `Google OAuth configured: ${
      Boolean(oauth2Client)
    }`
  );

  console.log(
    `Gmail refresh token configured: ${
      Boolean(GMAIL_REFRESH_TOKEN)
    }`
  );

  console.log(
    `Google redirect URI: ${GOOGLE_REDIRECT_URI}`
  );
});