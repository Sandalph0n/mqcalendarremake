import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { feedback, email } = await req.json();

    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return NextResponse.json(
        { message: "Feedback is required" },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

      const fromAddress = email || "Unknown";

    const html = `
      <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; padding:20px; border-radius:8px; border:1px solid #e5e7eb;">
      
      <h2 style="color:#111827;">New Feedback Submission</h2>


      <hr style="border:none; border-top:1px solid #e5e7eb; margin:15px 0;" />

      <p><b>From:</b> ${fromAddress}</p>
      <p><b>Received:</b> ${new Date().toLocaleString()}</p>

      <h3>Feedback:</h3>
      <div style="padding:12px; background:#f3f4f6; border-radius:6px;">
        ${feedback.replace(/\n/g, "<br />")}
      </div>

      <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;" />

      <p style="font-size:12px; color:#6b7280;">
        This email was sent automatically from MQ Assignment Planner.
      </p>
    </div>
  </div>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "Feedback from MQ Assignment Planner",
      text: feedback,
      html,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Feedback sent" });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    return NextResponse.json(
      { message: "Failed to send feedback" },
      { status: 500 },
    );
  }
}