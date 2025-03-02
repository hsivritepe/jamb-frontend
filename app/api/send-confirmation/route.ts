// app/api/send-confirmation/route.ts

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * This route handler sends a simple confirmation email (no PDF),
 * containing the order number, date, total, and a link to the dashboard.
 */
export async function POST(request: NextRequest) {
  try {
    // 1) Parse JSON from the request body
    const { email, orderId, total, date } = await request.json();

    if (!email || !orderId) {
      return NextResponse.json(
        { error: "Missing email or orderId" },
        { status: 400 }
      );
    }

    // 2) Configure Nodemailer (Office 365 example)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.office365.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 3) Construct the text of the email
    const dashboardLink =
      process.env.NEXT_PUBLIC_SITE_URL?.concat("/dashboard") ||
      "http://localhost:3000/dashboard";

    const textBody = `
Your Order Confirmation
=======================

Order Number: ${orderId}
Date: ${date || "N/A"}
Total: ${total || "N/A"}

For more details, please visit your Dashboard:
${dashboardLink}
`.trim();

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || "info@thejamb.com",
      to: email,
      subject: `Order Confirmation #${orderId}`,
      text: textBody,
    };

    // 4) Send email
    await transporter.sendMail(mailOptions);

    // 5) Return success
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (err: any) {
    console.error("Error sending confirmation email:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}