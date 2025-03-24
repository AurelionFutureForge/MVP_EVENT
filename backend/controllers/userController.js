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
    await generateTicketPDF(name, eventName, role, ticketID, qrCodeImage, pdfPath);

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
const generateTicketPDF = async (name, eventName, role, ticketID, qrCodeImage, pdfPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',  // Standard A4 size
      margin: 50,
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    //  Header Section with Background Color
    doc
      .rect(0, 0, doc.page.width, 100)
      .fill('#4CAF50')  // Green header background
      .fillColor('#FFFFFF')
      .fontSize(30)
      .text('🎫 Event Ticket', { align: 'center', valign: 'center' })
      .moveDown();

    //  Event Details Section
    doc
      .fillColor('#333333')  // Dark text color
      .fontSize(18)
      .text(`Event: ${eventName}`, { align: 'center' })
      .moveDown(0.5)
      .fontSize(14)
      .text(`Attendee: ${name}`, { align: 'center' })
      .text(`Role: ${role}`, { align: 'center' })
      .text(`Ticket ID: ${ticketID}`, { align: 'center' })
      .moveDown(0.5);

    // Add Date, Time, and Location with icons
    doc
      .fontSize(12)
      .fillColor('#555555')  // Gray color for details
      .text('📅 Date: March 15 - 16, 2025', { align: 'center' })
      .text('⏰ Time: 08:00 AM - 5:00 PM (IST)', { align: 'center' })
      .text('📍 Location: M Weddings & Conventions, Chennai, India', { align: 'center' })
      .moveDown(1.5);

    //  Stylish Line Separator
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .lineWidth(1)
      .stroke('#AAAAAA')
      .moveDown(1.5);

    //  QR Code Section with Border and Shadow Effect
    const qrBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
    const qrSize = 180;

    doc
      .text('📲 Scan this QR Code at Entry', { align: 'center' })
      .moveDown(0.5)
      .image(qrBuffer, {
        fit: [qrSize, qrSize],
        align: 'center',
        valign: 'center'
      })
      .strokeColor('#4CAF50')
      .lineWidth(3)
      .rect(doc.page.width / 2 - qrSize / 2 - 5, doc.y - qrSize - 5, qrSize + 10, qrSize + 10)
      .stroke();

    doc.moveDown(2);

    //  Footer Section
    doc
      .fillColor('#FFFFFF')
      .rect(0, doc.page.height - 80, doc.page.width, 80)
      .fill('#4CAF50')
      .fontSize(14)
      .fillColor('#FFFFFF')
      .text('🎉 Thank you for registering. We look forward to seeing you at the event!', {
        align: 'center',
        valign: 'center'
      });

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};

// ✅ Updated Email Function with Date, Time, and Location
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
