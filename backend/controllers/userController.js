const nodemailer = require("nodemailer");
const User = require("../models/User");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");   

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, eventName,companyName, place, time, contact, role } = req.body;
  console.log("req-body : "+req.body);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists!" });
    }

    const newUser = new User({ name, email, eventName, companyName, place, time, contact, role });
    await newUser.save();

    // Generate QR Code
    const qrCodeData = `${email}-${newUser._id}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    newUser.qrCode = qrCodeData;
    await newUser.save();

    const ticketID = newUser._id.toString();

    // Generate PDF dynamically with user data
    const pdfPath = path.join(__dirname, "../public/pdfs", `${ticketID}.pdf`);
    await generateTicketPDF(name,email, eventName, companyName, place, time, role, ticketID, qrCodeImage, pdfPath);

    // Send success email with the generated PDF and QR code
    await sendSuccessEmail(name, email, eventName, companyName, place, time, qrCodeImage, role, ticketID, pdfPath);

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
const generateTicketPDF = async (name, email, eventName, companyName, place, time,  role, ticketID, qrCodeImage, pdfPath) => {
  return new Promise((resolve, reject) => {
    
    //  Increased page height to fit content properly
    const doc = new PDFDocument({ size: [595.28, 1150], margin: 50 });  // Increased height for larger QR
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    //  Header Section (Event Branding)
    doc.rect(0, 0, doc.page.width, 120).fill("#4CAF50"); 
    doc.fillColor("#fff")
      .font("Helvetica-Bold")
      .fontSize(28)
      .text(`${eventName}`, { align: "center", baseline: "middle" });

    doc.moveDown(0.3);
    doc.fontSize(18).text("March 15 - 16, 2025, 08:00 AM - 5:00 PM (IST)", { align: "center" });

    //  Attendee Info Section
    doc.moveDown(1.5);
    doc.fillColor("#333").fontSize(20).text("Attendee Information", { align: "center", underline: true });

    doc.moveDown(0.7);
    doc.fontSize(16).text(`Name: ${name}`, { align: "center" });
    doc.text(`Email: ${email}`, { align: "center" });
    doc.text(`Role: ${role}`, { align: "center" });

    //  Order ID and Ticket ID Section
    doc.moveDown(1.5);
    doc.fontSize(20).text("Order Details", { align: "center", underline: true });

    doc.moveDown(0.7);
    doc.fontSize(16).text(`Order ID: ${ticketID + 1}`, { align: "center" });
    doc.text(`Ticket ID: ${ticketID}`, { align: "center" });

    //  Larger QR Code Section (Centered)
    const qrSize = 280;  //  Bigger QR code
    const centerX = (doc.page.width - qrSize) / 2;  

    //  Adjusted spacing for QR code
    doc.moveDown(2);
    doc.fontSize(16).text("Scan this QR code at entry:", { align: "center" });

    const qrY = doc.y + 20;  // Space before QR code
    doc.image(Buffer.from(qrCodeImage.split(",")[1], "base64"), centerX, qrY, {  
      fit: [qrSize, qrSize],  
      align: "center"  
    });

    // Add more spacing after the QR code
    doc.moveDown(18);

    //  Event Venue Section
    doc.fontSize(20).text("Event Venue", { align: "center", underline: true });

    doc.moveDown(0.7);
    doc.fontSize(16).text("M Weddings & Conventions", { align: "center" });
    doc.text("98/99, Vanagaram-Ambattur Road", { align: "center" });
    doc.text("Vanagaram, Chennai, Tamil Nadu - 600095, India", { align: "center" });

    // Footer Branding (Centered)
    const footerHeight = 50;

    doc.fillColor("#4CAF50")
      .rect(0, doc.page.height - footerHeight, doc.page.width, footerHeight)
      .fill();

    doc.fillColor("#fff")
      .fontSize(14)
      .text("Powered by EVENT-MVP", {
        align: "center",
        y: doc.page.height - footerHeight + 15,  
      });

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};


//  Updated Email Function with Date, Time, and Location
const sendSuccessEmail = async (name, email, eventName, companyName, place, time, qrCodeImage, role, ticketID, pdfPath) => {
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
          <p> ${companyName} </p>
          <p>You're officially registered for <strong>${eventName}</strong></p>
        </div>

        <!-- Event Details -->
        <div style="padding: 30px;">
          <p style="font-size: 18px;">Hello <strong>${name}</strong>,</p>
          <p>Thank you for registering for <strong>${eventName}</strong>. Here are your event details:</p>

          <div style="border: 1px solid #eee; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Date:</strong> March 15 - 16, 2025</p>
            <p><strong>⏰ Time:</strong> ${time} (IST)</p>
            <p><strong>📍 Location:</strong> ${place} </p>
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
