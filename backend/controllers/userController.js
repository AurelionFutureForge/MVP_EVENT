const nodemailer = require("nodemailer");
const User = require("../models/User");
const QRCode = require("qrcode");

exports.registerUser = async (req, res) => {
  const { name, email, contact, role } = req.body;
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

    // Send confirmation email with QR code image
    await sendSuccessEmail(name, email, qrCodeImage);

    res.status(201).json({ 
      message: "Registration successful!", 
      name: newUser.name,
      email: newUser.email,
      qrCode: qrCodeData // Now it stores a consistent QR code
    });

  } catch (error) {
    console.error("Error Registering User:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Function to send success email
const sendSuccessEmail = async (name, email, qrCodeImage) => {
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
      subject: "🎉 Registration Successful!",
      html: `
        <div style="text-align: center; font-family: Arial, sans-serif;">
          <h2 style="color: green;">Registration Successful! 🎉</h2>
          <p>Thank you for registering, <strong>${name}</strong>.</p>
          <p>Your confirmation QR code is attached to this email.</p>
          <p>See you at the event!</p>
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
