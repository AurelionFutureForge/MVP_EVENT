const nodemailer = require("nodemailer");
const User = require("../models/User");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");   

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, eventName, contact, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists!" });
    }

    const newUser = new User({ name, email, eventName, contact, role });
    await newUser.save();

    // Generate QR Code
    const qrCodeData = `${email}-${newUser._id}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    newUser.qrCode = qrCodeData;
    await newUser.save();

    const ticketID = newUser._id.toString();

    // Generate PDF dynamically with user data
    const pdfPath = path.join(__dirname, "../public/pdfs", `${ticketID}.pdf`);
    await generateTicketPDF(name,email, eventName, role, ticketID, qrCodeImage, pdfPath);

    // Send success email with the generated PDF and QR code
    await sendSuccessEmail(name, email, eventName, qrCodeImage, role, ticketID, pdfPath);

    res.status(201).json({
      message: "Registration successful!",
      name: newUser.name,
      email: newUser.email,
      eventName: newUser.eventName,
      qrCode: qrCodeImage
    });

  } catch (error) {
    console.error("Error Registering User:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Function to generate PDF dynamically
const generateTicketPDF = async (name, email, eventName, role, ticketID,qrCodeImage, pdfPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);


    // ✅ Header section with event branding
    doc.rect(0, 0, doc.page.width, 100).fill("#4CAF50"); // Header background
    doc.fillColor("#fff").fontSize(24).text(`${eventName}`, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text("Mar 15 - 16, 2025, 08:00 AM (IST)", { align: "center" });

    // ✅ Attendee Info
    doc.moveDown(2);
    doc.fontSize(18).fillColor("#333").text("Attendee Information", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Role: ${role}`);

    // ✅ Order ID and Ticket ID
    doc.moveDown(1);
    doc.fontSize(18).fillColor("#333").text("Order Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`Order ID: ${ticketID}`);
    doc.text(`Ticket ID: ${ticketID}`);

    // ✅ Event venue details
    doc.moveDown(1);
    doc.fontSize(18).fillColor("#333").text("Event Venue", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(14).text("M Weddings & Conventions");
    doc.text("98/99, Vanagaram-Ambattur Road, Vanagaram, Chennai, Tamil Nadu - 600095, India");

    // ✅ QR Code Section (bottom-right corner)
    const qrSize = 150;
    const qrX = doc.page.width - qrSize - 80;  // Align QR code on the bottom-right
    const qrY = doc.page.height - qrSize - 100;

    doc.image(Buffer.from(qrCodeImage.split(",")[1], "base64"), qrX, qrY, {
      fit: [qrSize, qrSize],
      align: "center"
    });

    // ✅ Footer with branding
    doc.fillColor("#4CAF50")
      .rect(0, doc.page.height - 50, doc.page.width, 50)
      .fill();

    doc.fillColor("#fff").fontSize(12).text("Powered by YourEvent", {
      align: "center",
      baseline: "middle",
      y: doc.page.height - 35,
    });

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};


//  Updated Email Function with Date, Time, and Location
const sendSuccessEmail = async (name, email, eventName, qrCodeImage, role, ticketID, pdfPath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amthemithun@gmail.com",
        pass: "ptfk ykpn uygd yodb",
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

    // Convert Base64 QR image to buffer
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
    const qrCodeBuffer = Buffer.from(base64Data, "base64");

    // Read the generated PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);

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
          <h3>🎟️ Ticket Details</h3>
          <p><strong>Order ID:</strong> ${ticketID}</p>
          <p><strong>Ticket Class:</strong> ${ticketClass}</p>
          <p><strong>Payment Status:</strong> ${paymentStatus}</p>
        </div>

        <!-- QR Code Section -->
        <div style="text-align: center; padding: 30px; border-top: 1px solid #ddd;">
          <h3>📲 Scan this QR Code at Entry</h3>
          <img src="cid:qrcode123" alt="QR Code" style="width: 250px; height: 250px;"/>
        </div>

        <div style="background: #4CAF50; color: white; text-align: center; padding: 15px;">
          <p>Thank you for joining us. We look forward to seeing you at the event! 🎊</p>
        </div>
      </div>
      `,
      attachments: [
        {
          filename: "QRCode.png",
          content: qrCodeBuffer,
          cid: "qrcode123",   // Embed QR Code
        },
        {
          filename: `${ticketID}.pdf`,  // Attach dynamically generated PDF
          content: pdfBuffer,
        }
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Success email sent with PDF and QR code to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
