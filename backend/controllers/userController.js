const nodemailer = require("nodemailer");
const User = require("../models/User");
const QRCode = require("qrcode");

exports.registerUser = async (req, res) => {
  const { name, email, eventName, contact, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists!" });
    }

    const newUser = new User({ name, email, eventName, contact, role });
    await newUser.save();

    // ✅ Generate QR Code Image (Base64)
    const qrCodeData = `${email}-${newUser._id}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    newUser.qrCode = qrCodeData;
    await newUser.save();

    const ticketID = newUser._id.toString();

    // ✅ Send success email with embedded QR code
    await sendSuccessEmail(name, email, eventName, qrCodeImage, role, ticketID);

    // ✅ Send base64 QR image to the frontend
    res.status(201).json({
      message: "Registration successful!",
      name: newUser.name,
      email: newUser.email,
      eventName: newUser.eventName,
      qrCode: qrCodeImage    // ✅ Send base64 QR image
    });

  } catch (error) {
    console.error("Error Registering User:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

const sendSuccessEmail = async (name, email, eventName, qrCodeImage, role, ticketID) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amthemithun@gmail.com",         // ✅ Hardcoded email
        pass: "ptfk ykpn uygd yodb",           // ✅ Hardcoded password
      },
    });

    let ticketClass = "";
    let paymentStatus = "";

    if (role === "Visitor") {
      ticketClass = "VISITORS REGISTRATION (PAID ENTRY)";
      paymentStatus = "✅ Payment Received";
    } else if (role === "Speaker") {
      ticketClass = "SPEAKER REGISTRATION (FREE ENTRY)";
      paymentStatus = "✅ No Payment Required";
    } else {
      ticketClass = "UNKNOWN ROLE";
      paymentStatus = "❓ Payment Status Unknown";
    }

    // ✅ Convert base64 QR code image to buffer for attachment
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
    const qrCodeBuffer = Buffer.from(base64Data, "base64");

    const mailOptions = {
      from: "amthemithun@gmail.com",
      to: email,
      subject: `🎉 ${eventName} - Your Ticket Confirmation`,
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: #4CAF50; color: white; text-align: center; padding: 20px;">
          <h1 style="margin: 0;">🎫 Your E-Ticket</h1>
          <p>You're officially registered for <strong>${eventName}</strong></p>
        </div>

        <!-- Event Details -->
        <div style="padding: 30px;">
          <p style="font-size: 18px;">Hello <strong>${name}</strong>,</p>
          <p>Thank you for registering for <strong>${eventName}</strong>. Here are your event details:</p>

          <div style="border: 1px solid #eee; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Date:</strong> March 15 - 16, 2025</p>
            <p><strong>⏰ Time:</strong> 08:00 AM - 5:00 PM (IST)</p>
            <p><strong>📍 Location:</strong> M Weddings & Conventions, Chennai, India</p>
          </div>
        </div>

        <!-- Ticket Details -->
        <div style="background: #f9f9f9; padding: 30px; border-top: 1px solid #ddd;">
          <h3 style="margin: 0 0 10px;">🎟️ Ticket Details</h3>
          <p><strong>Order ID:</strong> ${ticketID}</p>
          <p><strong>Ticket Class:</strong> ${ticketClass}</p>
          <p><strong>Attendee Name:</strong> ${name}</p>
          <p><strong>Payment Status:</strong> ${paymentStatus}</p>
        </div>

        <!-- QR Code Section -->
        <div style="text-align: center; padding: 30px; border-top: 1px solid #ddd;">
          <h3>📲 Your QR Code is attached to this email</h3>
          <p style="margin-top: 10px; color: #888;">Download the QR code from the attachment for fast check-in at the event.</p>
        </div>

        <!-- Footer -->
        <div style="background: #4CAF50; color: white; text-align: center; padding: 15px;">
          <p>Thank you for joining us. We look forward to seeing you at the event! 🎊</p>
        </div>
      </div>
      `,
      attachments: [
        {
          filename: "QRCode.png",               // ✅ QR code attached as image
          content: qrCodeBuffer,                // ✅ Attach buffer
          encoding: "base64",                   // ✅ Base64 encoding
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Success email sent to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
