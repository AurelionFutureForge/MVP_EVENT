const nodemailer = require("nodemailer");
const User = require("../models/User");
const QRCode = require("qrcode");

exports.registerUser = async (req, res) => {
  const { name, email, eventName, contact, role } = req.body;
  console.log(req);
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists!" });
    }

    // Create a new user and save it first to get the MongoDB _id
    const newUser = new User({ name, email, eventName, contact, role });
    await newUser.save(); 

    // Generate a QR code using the unique _id
    const qrCodeData = `${email}-${newUser._id}`; 

    // Generate QR Code Image (For Email Only)
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Update user with the QR code data
    newUser.qrCode = qrCodeData;
    await newUser.save();

    // Send confirmation email with QR code image
    await sendSuccessEmail(name, email, eventName, qrCodeImage);

    res.status(201).json({ 
      message: "Registration successful!", 
      name: newUser.name,
      email: newUser.email,
      eventName: newUser.eventName,
      qrCode: qrCodeData // Now it stores a consistent QR code
    });

  } catch (error) {
    console.error("Error Registering User:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Function to send success email
const sendSuccessEmail = async (name, email, eventName, qrCodeImage) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amthemithun@gmail.com",
        pass: "ptfk ykpn uygd yodb",
      },
    });

    // Convert base64 to buffer for attachment
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, ""); // Remove metadata prefix
    const qrCodeBuffer = Buffer.from(base64Data, "base64");

    const mailOptions = {
      from: "amthemithun@gmail.com",
      to: email,
      subject: `🎉${eventName} - Your invited! `,
      html: `

        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;
        color: #333; border: 2px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);">

        <div style="background: #4CAF50; color: white; text-align: center; padding: 20px;">
          <h1>🎉${eventName}</h1>
          <p>Exclusive Invitation</p>
        </div>


        <div style="padding: 30px;">
          <h2 style="text-align: center;">Hello, ${name}!</h2>
          <p>You are officially registered for <strong>${eventName}</strong>.</p>

          <div style="border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p><strong>📅 Date:</strong>March 15 - 16, 2025</p>
            <p><strong>⏰ Time:</strong>08:00 AM - 5:00 PM (IST)</p>
            <p><strong>📍 Location:</strong>M Weddings & Conventions, Chennai, India</p>
          </div>

        </div>
      `,
      attachments: [
        {
          filename: "QRCode.png",
          content: qrCodeBuffer,
          encoding: "base64",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Success email sent to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
