const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const User = require("../models/User");
const QRCode = require("qrcode");
const path = require("path");

exports.registerUser = async (req, res) => {
  const { name, email, eventName, contact, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists!" });
    }

    const newUser = new User({ name, email, eventName, contact, role });
    await newUser.save();

    const qrCodeData = `${email}-${newUser._id}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    newUser.qrCode = qrCodeData;
    await newUser.save();

    const ticketID = newUser._id.toString();

    // Generate PDF file with event details and QR code
    const pdfFilePath = await generateTicketPDF(name, email, eventName, ticketID, role, qrCodeImage);

    // Send email with PDF attachment
    await sendSuccessEmail(name, email, eventName, role, ticketID, pdfFilePath);

    res.status(201).json({ 
      message: "Registration successful!", 
      name: newUser.name,
      email: newUser.email,
      eventName: newUser.eventName,
      qrCode: qrCodeData
    });

  } catch (error) {
    console.error("Error Registering User:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Function to generate PDF ticket
const generateTicketPDF = async (name, email, eventName, ticketID, role, qrCodeImage) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4' });
    const pdfFilePath = path.join(__dirname, `../tickets/ticket_${ticketID}.pdf`);
    const stream = fs.createWriteStream(pdfFilePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(24).fillColor('#4CAF50').text(eventName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).fillColor('black').text("Mar 15 - 16, 2025, 08:00 AM (IST)", { align: 'center' });
    doc.moveDown(0.5);
    doc.text("M Weddings & Conventions, Chennai - India", { align: 'center' });

    // Attendee details
    doc.moveDown(1);
    doc.fontSize(14).text(`Attendee: ${name}`, { align: 'left' });
    doc.text(`Email: ${email}`);
    doc.text(`Order ID: ${ticketID}`);
    doc.text(`Ticket Class: ${role === "Visitor" ? "Visitors Registration (PAID ENTRY)" : "Speaker Registration (FREE ENTRY)"}`);
    doc.text(`Payment Status: ${role === "Visitor" ? "✅ Payment Received" : "✅ No Payment Required"}`);

    // QR code image
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
    const qrCodeBuffer = Buffer.from(base64Data, "base64");
    const qrCodeFilePath = path.join(__dirname, `../tickets/qrcode_${ticketID}.png`);
    
    fs.writeFileSync(qrCodeFilePath, qrCodeBuffer);
    
    doc.image(qrCodeFilePath, {
      fit: [150, 150],
      align: 'center',
      valign: 'center'
    });

    // Footer
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#4CAF50').text("Powered by Zoho Backstage", { align: 'center' });

    doc.end();

    stream.on("finish", () => {
      console.log(`PDF generated: ${pdfFilePath}`);
      resolve(pdfFilePath);
    });

    stream.on("error", (error) => {
      console.error("Error generating PDF:", error);
      reject(error);
    });
  });
};

// Function to send success email
const sendSuccessEmail = async (name, email, eventName, role, ticketID, pdfFilePath) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "amthemithun@gmail.com",
      pass: "ptfk ykpn uygd yodb",
    },
  });

  let ticketClass = role === "Visitor" 
    ? "Visitors Registration (PAID ENTRY)" 
    : "Speaker Registration (FREE ENTRY)";
  
  let paymentStatus = role === "Visitor" 
    ? "✅ Payment Received" 
    : "✅ No Payment Required";

  const mailOptions = {
    from: "amthemithun@gmail.com",
    to: email,
    subject: `🎉 ${eventName} - Your Ticket & Event Details`,
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
        </div>

        <!-- Ticket Details -->
        <div style="background: #f9f9f9; padding: 30px; border-top: 1px solid #ddd;">
          <h3 style="margin: 0 0 10px;">🎟️ Ticket Details</h3>
          <p><strong>Order ID:</strong> ${ticketID}</p>
          <p><strong>Ticket Class:</strong> ${ticketClass}</p>
          <p><strong>Attendee Name:</strong> ${name}</p>
          <p><strong>Payment Status:</strong> ${paymentStatus}</p>
        </div>

        <!-- Footer -->
        <div style="background: #4CAF50; color: white; text-align: center; padding: 15px;">
          <p>Thank you for joining us. We look forward to seeing you at the event! 🎊</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Ticket_${ticketID}.pdf`,
        path: pdfFilePath,
      }
    ],
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${email} with PDF attachment`);
};
