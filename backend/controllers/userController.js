const nodemailer = require("nodemailer");
const User = require("../models/User");
const QRCode = require("qrcode");

// ✅ Register User
exports.registerUser = async (req, res) => {
  const { name, email, contact, role, eventDate, eventTime, eventAddress, eventLink } = req.body;

  try {
    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists!" });
    }

    // ✅ Create and save new user
    const newUser = new User({ name, email, contact, role });
    await newUser.save();

    // ✅ Generate structured QR code data
    const qrCodeData = JSON.stringify({
      email: newUser.email,
      id: newUser._id.toString(),
      event: "BNI Connect Fest 2025",
      date: eventDate || "March 15 - 16, 2025",
      time: eventTime || "08:00 AM - 5:00 PM (IST)",
      location: eventAddress || "M Weddings & Conventions, Chennai, India",
      link: eventLink || "https://bniconnectfest.com"
    });

    // ✅ Generate QR code image with better scannability
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.9,
      margin: 2,
      scale: 8
    });

    // ✅ Store QR code data in MongoDB
    newUser.qrCode = qrCodeData;
    await newUser.save();

    // ✅ Send stylish invitation email with QR code
    await sendSuccessEmail(name, email, qrCodeImage, eventDate, eventTime, eventAddress, eventLink);

    res.status(201).json({
      message: "Registration successful!",
      name: newUser.name,
      email: newUser.email,
      qrCode: qrCodeData
    });

  } catch (error) {
    console.error("❌ Error Registering User:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// ✅ Stylish Invitation Email Function
const sendSuccessEmail = async (name, email, qrCodeImage, eventDate, eventTime, eventAddress, eventLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amthemithun@gmail.com",
        pass: "ptfk ykpn uygd yodb",
      },
    });

    // ✅ Convert Base64 QR Code to Buffer
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
    const qrCodeBuffer = Buffer.from(base64Data, "base64");

    const mailOptions = {
      from: "amthemithun@gmail.com",
      to: email,
      subject: "🎉 BNI Connect Fest 2025 - You're Invited!",
      html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; border: 2px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);">
          
        <!-- 🎯 Banner -->
        <div style="background: #4CAF50; color: white; text-align: center; padding: 20px;">
          <h1>🎉 BNI Connect Fest 2025</h1>
          <p>Exclusive Invitation</p>
        </div>

        <!-- 🎯 Content -->
        <div style="padding: 30px;">
          <h2 style="text-align: center;">Hello, ${name}!</h2>
          <p>You are officially registered for <strong>BNI Connect Fest 2025</strong>.</p>

          <div style="border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p><strong>📅 Date:</strong> ${eventDate || "March 15 - 16, 2025"}</p>
            <p><strong>⏰ Time:</strong> ${eventTime || "08:00 AM - 5:00 PM (IST)"}</p>
            <p><strong>📍 Location:</strong> ${eventAddress || "M Weddings & Conventions, Chennai, India"}</p>
            ${eventLink ? `<p><a href="${eventLink}" target="_blank" style="color: #3498db;">View Event Details</a></p>` : ''}
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <h3>Your QR Code:</h3>
            <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px;" />
          </div>

          <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 14px;">
            <p>🎯 We can't wait to see you at the event!</p>
            <p>🔥 For more details, visit: <a href="https://bniconnectfest.com" style="color: #3498db;">bniconnectfest.com</a></p>
          </div>
        </div>

      </div>
      `,
      attachments: [
        {
          filename: "QRCode.png",
          content: qrCodeBuffer,
          encoding: "base64",
          cid: "qrcode"  // ✅ Embed the QR code in the email
        }
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Invitation email sent:", email);

  } catch (error) {
    console.error("❌ Email error:", error);
  }
};
