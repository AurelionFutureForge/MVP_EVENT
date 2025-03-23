const nodemailer = require("nodemailer");
const User = require("../models/User");
const QRCode = require("qrcode");

exports.registerUser = async (req, res) => {
  const { name, email, contact, role, eventDate, eventTime, eventAddress, eventLink } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists!" });
    }

    // Create a new user and save it first to get the MongoDB _id
    const newUser = new User({ name, email, contact, role });
    await newUser.save();

    // Generate a QR code using the unique _id
    const qrCodeData = `${email}-${newUser._id}`;

    // Generate QR Code Image (For Email Only)
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Update user with the QR code data
    newUser.qrCode = qrCodeData;
    await newUser.save();

    // Send confirmation email with stylish invitation card
    await sendSuccessEmail(name, email, qrCodeImage, eventDate, eventTime, eventAddress, eventLink);

    res.status(201).json({
      message: "Registration successful!",
      name: newUser.name,
      email: newUser.email,
      qrCode: qrCodeData,
    });

  } catch (error) {
    console.error("Error Registering User:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// 🎯 **Send email with invitation card**
const sendSuccessEmail = async (name, email, qrCodeImage, eventDate, eventTime, eventAddress, eventLink) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amthemithun@gmail.com",
        pass: "ptfk ykpn uygd yodb",
      },
    });

    // Convert base64 QR code to buffer
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, ""); 
    const qrCodeBuffer = Buffer.from(base64Data, "base64");

    const mailOptions = {
      from: "amthemithun@gmail.com",
      to: email,
      subject: "🎉 BNI Connect Fest 2025 - Invitation Confirmation",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; border: 2px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);">
          
          <!-- Banner -->
          <div style="background: #4CAF50; color: white; text-align: center; padding: 20px;">
            <h1>🎉 BNI Connect Fest 2025</h1>
            <p>You're Invited!</p>
          </div>

          <!-- Content Section -->
          <div style="padding: 30px;">
            <h2 style="color: #2c3e50; text-align: center;">Hello, ${name}!</h2>
            <p style="text-align: center; font-size: 16px;">Thank you for registering. We are excited to welcome you to the <strong>BNI Connect Fest 2025</strong>.</p>

            <!-- Event Details -->
            <div style="border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <p style="font-size: 18px;"><strong>📅 Date:</strong> ${eventDate || "March 15 - 16, 2025"}</p>
              <p style="font-size: 18px;"><strong>⏰ Time:</strong> ${eventTime || "08:00 AM - 5:00 PM (IST)"}</p>
              <p style="font-size: 18px;"><strong>📍 Location:</strong> ${eventAddress || "M Weddings & Conventions, Chennai, India"}</p>
              ${eventLink ? `<p style="font-size: 16px;"><a href="${eventLink}" target="_blank" style="color: #3498db;">View Event Details</a></p>` : ''}
            </div>

            <!-- QR Code -->
            <div style="text-align: center; margin-top: 30px;">
              <h3>Your QR Code:</h3>
              <img src="cid:qrcode" alt="QR Code" style="width: 200px; height: 200px; border: 4px solid #4CAF50; border-radius: 12px;" />
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; color: #777;">
              <p>🎯 We can't wait to see you there!</p>
              <p>🔥 For more details, visit our website: <a href="https://bniconnectfest.com" style="color: #3498db;">bniconnectfest.com</a></p>
            </div>
          </div>

          <!-- Footer Banner -->
          <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 14px; color: #777;">
            <p>© 2025 BNI Connect Fest. All rights reserved.</p>
          </div>

        </div>
      `,
      attachments: [
        {
          filename: "QRCode.png",
          content: qrCodeBuffer,
          encoding: "base64",
          cid: "qrcode" // Embeds the QR code inside the email
        }
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Invitation email sent to:", email);

  } catch (error) {
    console.error("Error sending email:", error);
  }
};
