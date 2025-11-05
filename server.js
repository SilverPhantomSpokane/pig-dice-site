import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mainRoutes from "./routes/main.js";
import aboutRoutes from "./routes/about.js";
import supportRoutes from "./routes/support.js";

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

// --- Отправка писем ---
app.post("/send", async (req, res) => {
  const { email, message } = req.body;

  try {
   const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

    await transporter.sendMail({
      from: `"Pig Dice Support" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "🐷 New message from Pig Dice Support",
      replyTo: email,
      text: `
🐷 New message from Pig Dice Support

From: ${email}
-------------------------------------
${message}
-------------------------------------
Please reply directly to this address: ${email}
      `,
      html: `
        <div style="font-family:Arial, sans-serif; padding:16px; background:#fff9fb; border-radius:10px;">
          <h2 style="color:#C2185B;">🐷 New message from Pig Dice Support</h2>

          <p><strong>Sender’s email:</strong> 
            <a href="mailto:${email}" style="color:#C2185B; text-decoration:none;">${email}</a>
          </p>

          <p style="margin-top:1rem; background:#fff; border-left:4px solid #C2185B; padding:10px;">
            ${message}
          </p>

          <hr style="margin:20px 0; border:none; border-top:1px solid #f3dbe4;">
          <p style="font-size:0.9rem; color:#999;">
            Please reply directly to 
            <a href="mailto:${email}" style="color:#C2185B;">${email}</a> 
            to contact the sender.
          </p>
        </div>
      `,
    });

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
