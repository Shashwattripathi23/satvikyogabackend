const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  "https://www.satvikyoga.nl",
  "https://satvikyoga.nl",
  "https://satvikyogaui.vercel.app",
  "https://satvikyogaui.vercel.app/",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log(`[CORS] Incoming request from origin: ${origin}`);
    console.log(`[CORS] NODE_ENV: ${process.env.NODE_ENV}`);

    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) {
      console.log("[CORS] No origin - allowing");
      return callback(null, true);
    }

    // In development, allow all origins
    if (process.env.NODE_ENV !== "production") {
      console.log("[CORS] Development mode - allowing all origins");
      return callback(null, true);
    }

    // In production, check if origin is in allowed list OR is a Vercel deployment
    const isAllowed = allowedOrigins.includes(origin);
    const isVercelApp = origin.includes("vercel.app");

    if (isAllowed || isVercelApp) {
      console.log(`[CORS] ✅ Origin ${origin} is ALLOWED`);
      return callback(null, true);
    } else {
      console.log(`[CORS] ❌ Origin ${origin} is BLOCKED`);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", // You can change this to your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Saatvik Yoga Email Service is running!" });
});

// Send email endpoint
app.post("/api/send-email", async (req, res) => {
  const { name, email, number, category, query } = req.body;

  // Validation
  if (!name || !email || !number || !category || !query) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Email content for admin
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `New Contact Form Submission - ${category}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #809671; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Satvik Yoga Studio</h1>
          <p style="color: #E5E0D8; margin: 5px 0;">New Contact Form Submission</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #809671; border-bottom: 2px solid #83B792; padding-bottom: 10px;">Contact Details</h2>
          
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong style="color: #725C3A;">Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong style="color: #725C3A;">Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong style="color: #725C3A;">Number:</strong> ${number}</p>
            <p style="margin: 10px 0;"><strong style="color: #725C3A;">Category:</strong> ${category}</p>
          </div>
          
          <h3 style="color: #809671; margin-top: 25px;">Query:</h3>
          <div style="background-color: #E5E0D8; padding: 15px; border-left: 4px solid #83B792; border-radius: 5px;">
            <p style="color: #725C3A; line-height: 1.6; margin: 0;">${query}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E0D8; text-align: center; color: #999;">
            <p style="margin: 0; font-size: 12px;">This email was sent from the Satvik Yoga Studio contact form</p>
          </div>
        </div>
      </div>
    `,
  };

  // Email content for user (confirmation email)
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thank You for Contacting Satvik Yoga Studio",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #809671; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Satvik Yoga Studio</h1>
          <p style="color: #E5E0D8; margin: 5px 0;">Namaste 🙏</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #809671;">Dear ${name},</h2>
          
          <p style="color: #725C3A; line-height: 1.8;">
            Thank you for reaching out to Satvik Yoga Studio. We have received your message and will get back to you within 24 hours.
          </p>
          
          <div style="background-color: #E5E0D8; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #809671; margin-top: 0;">Your Submitted Information:</h3>
            <p style="margin: 8px 0; color: #725C3A;"><strong>Category:</strong> ${category}</p>
            <p style="margin: 8px 0; color: #725C3A;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0; color: #725C3A;"><strong>Number:</strong> ${number}</p>
          </div>
          
          <p style="color: #725C3A; line-height: 1.8;">
            Our team is excited to help you on your yoga journey. Whether you're seeking physical wellness, mental peace, or spiritual growth, we're here to support you every step of the way.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #809671; font-style: italic; font-size: 16px; margin: 0;">
              "Yoga is the journey of the self, through the self, to the self."
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 5px;">- The Bhagavad Gita</p>
          </div>
          
          <div style="background-color: #83B792; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 25px;">
            <p style="margin: 5px 0; font-size: 14px;">📞 Contact: +91-XXXXXXXXXX</p>
            <p style="margin: 5px 0; font-size: 14px;">📧 Email: ${process.env.EMAIL_USER}</p>
            <p style="margin: 5px 0; font-size: 14px;">📍 Location: Your Studio Address</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E0D8; text-align: center; color: #999;">
            <p style="margin: 0; font-size: 12px;">With gratitude and light,<br>The Satvik Yoga Studio Team</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    // Send email to admin
    await transporter.sendMail(adminMailOptions);

    // Send confirmation email to user
    await transporter.sendMail(userMailOptions);

    res.status(200).json({
      success: true,
      message: "Email sent successfully!",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email. Please try again later.",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🧘‍♀️ Saatvik Yoga Email Server is running on port ${PORT}`);
});
