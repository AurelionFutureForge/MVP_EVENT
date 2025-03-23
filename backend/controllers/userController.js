const nodemailer = require("nodemailer");
const User = require("../models/User");
const QRCode = require("qrcode");

exports.registerUser = async (req, res) => {
  const { name, email, eventName, contact, role } = req.body;
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
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); overflow: hidden;">
        
      <!-- Header -->
      <div style="background: #4CAF50; color: white; text-align: center; padding: 20px;">
        <h1 style="margin: 0;">🎉 ${eventName}</h1>
        <p>You're officially registered!</p>
      </div>

      <!-- Event Details -->
      <div style="padding: 30px;">
        <p style="font-size: 18px;">Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering for the <strong>${eventName}</strong>. Here are your event details:</p>

        <div style="border: 1px solid #eee; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📅 Date:</strong> March 15 - 16, 2025</p>
          <p><strong>⏰ Time:</strong> 08:00 AM - 5:00 PM (IST)</p>
          <p><strong>📍 Location:</strong> M Weddings & Conventions, Chennai, India</p>
        </div>

        <p>Get important information about the event from the website:</p>
        <p style="text-align: center;">
          <a href="https://bni-connect-fest.com" style="display: inline-block; padding: 12px 30px; color: white; background: #4CAF50; text-decoration: none; border-radius: 5px; font-weight: bold;">🌐 Visit Event Website</a>
        </p>
      </div>

      <!-- Ticket Details -->
      <div style="background: #f9f9f9; padding: 30px; border-top: 1px solid #ddd;">
        <h3 style="margin: 0 0 10px;">🎟️ Ticket Details</h3>
        <p><strong>Order ID:</strong> 10379000004103300</p>
        <p><strong>Ticket Class:</strong> ${ticketClass}</p>
        <p><strong>Attendee Name:</strong> ${name}</p>
        <p><strong>Payment Status:</strong> ${paymentStatus}</p>
      </div>

      <!-- QR Code -->
      <div style="text-align: center; padding: 20px;">
        <h3>🎫 Your QR Code</h3>
        <p>Show this QR code at the entry gate:</p>
        <img src="cid:qrcode" alt="QR Code" style="width: 150px; height: 150px; border: 2px solid #ddd; border-radius: 8px;"/>
      </div>

      <!-- Footer -->
      <div style="background: #4CAF50; color: white; text-align: center; padding: 15px;">
        <p>Thank you for joining us. We look forward to seeing you at the event! 🎊</p>
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
