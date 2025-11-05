import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mainRoutes from "./routes/main.js";
import aboutRoutes from "./routes/about.js";
import supportRoutes from "./routes/support.js";
import SibApiV3Sdk from "sib-api-v3-sdk";

dotenv.config();

const app = express();

// --- Пути ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Настройки Express ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// --- Маршруты ---
app.use("/", mainRoutes);
app.use("/about", aboutRoutes);
app.use("/support", supportRoutes);

// --- Отправка писем через Brevo API ---
app.post("/send", async (req, res) => {
  const { email, message } = req.body;

  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      sender: { name: "Pig Dice Support", email: process.env.EMAIL_RECEIVER },
      to: [{ email: process.env.EMAIL_RECEIVER }],
      replyTo: { email },
      subject: "🐷 New message from Pig Dice Support",
      htmlContent: `
        <div style="font-family:Arial, sans-serif; padding:16px; background:#fff9fb; border-radius:10px;">
          <h2 style="color:#C2185B;">🐷 New message from Pig Dice Support</h2>
          <p><strong>Sender’s email:</strong>
            <a href="mailto:${email}" style="color:#C2185B; text-decoration:none;">${email}</a>
          </p>
          <p style="margin-top:1rem; background:#fff; border-left:4px solid #C2185B; padding:10px;">${message}</p>
          <hr style="margin:20px 0; border:none; border-top:1px solid #f3dbe4;">
          <p style="font-size:0.9rem; color:#999;">Please reply directly to
            <a href="mailto:${email}" style="color:#C2185B;">${email}</a>.
          </p>
        </div>
      `,
    };

    await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    res.render("pages/support", { success: true });
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    res.render("pages/support", { error: true });
  }
});

// --- Запуск ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);

