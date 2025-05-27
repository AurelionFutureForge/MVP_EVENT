const nodemailer = require("nodemailer");
const User = require("../models/User");
const mongoose = require('mongoose');
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Event = require("../models/Event");   // ADD this import at the top if not already

// Function to generate PDF dynamically
const generateTicketPDF = async (name, email, eventName, companyName, place, time, date, role, ticketID, qrCodeImage, pdfPath) => {
  return new Promise((resolve, reject) => {

    //  Increased page height to fit content properly
    const doc = new PDFDocument({ size: [595.28, 1150], margin: 50 });  // Increased height for larger QR
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    //  Header Section (Event Branding)
    doc.rect(0, 0, doc.page.width, 140).fill("#FF0000");
    doc.fillColor("#fff")
      .font("Helvetica-Bold")
      .fontSize(28)
      .text(`${eventName}`, { align: "center", baseline: "middle" });

    doc.moveDown(0.3);
    doc.fontSize(18).text(`${date.toISOString().split('T')[0]}, ${time}(IST)`, { align: "center" });

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
    doc.fontSize(16).text(`${place}`, { align: "center" });

    // Footer Branding (Centered)
    const footerHeight = 50;

    doc.fillColor("#FF0000")
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
const sendSuccessEmail = async (name, email, eventName, companyName, place, time, date, qrCodeImage, role, ticketID, pdfPath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "stagynio@gmail.com",
        pass: "tebj avtf jhrv mjec",
      },
    });

    let ticketClass = role;
    let paymentStatus = "COMPLETED";


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
        <div style="background:  #FF0000; color: white; text-align: center; padding: 20px;">
          <h1 style="margin: 0;">🎫 Your E-Ticket</h1>
          <p> ${companyName} </p>
          <p>You're officially registered for <strong>${eventName}</strong></p>
        </div>

        <!-- Event Details -->
        <div style="padding: 30px;">
          <p style="font-size: 18px;">Hello <strong>${name}</strong>,</p>
          <p>Thank you for registering for <strong>${eventName}</strong>. Here are your event details:</p>

          <div style="border: 1px solid #eee; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Date:</strong> ${date.toISOString().split('T')[0]} </p>
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

        <div style="text-align: center; padding: 20px;">
            <a href="https://events.aurelionfutureforge.com" style="padding: 10px 20px; background-color:  #FF0000; color: white; text-decoration: none; border-radius: 5px;">Click here to register</a>
        </div>

        <!-- QR Code Section -->
        <div style="text-align: center; padding: 30px; border-top: 1px solid #ddd;">
          <h3>📲 Scan this QR Code at Entry</h3>
          <img src="cid:qrcode123" alt="QR Code" style="width: 250px; height: 250px;"/>
        </div>

        <div style="background:  #FF0000; color: white; text-align: center; padding: 15px;">
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
    console.log("Success email sent with PDF, QR code, and available privileges to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

exports.registerUser = async (req, res) => {
  const { formData, eventID } = req.body;
  console.log("eventID:", eventID);
  try {
    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Extract email and name from formData
    const email = formData.EMAIL?.trim().toLowerCase();
    const name = formData.name || formData.fullname || formData.NAME || formData.FULLNAME;

    if (!email || !name) {
      return res.status(400).json({ message: 'Name and Email are required fields' });
    }

    //  Check if user has already registered for the same event under this company
    const existingUser = await User.findOne({ email, companyName: event.companyName });
    if (existingUser) {
      // Check if the user has already registered for the same event
      const isAlreadyRegisteredForThisEvent = existingUser.eventId.toString() === eventID;
      if (isAlreadyRegisteredForThisEvent) {
        return res.status(400).json({ message: 'You have already registered for this event.' });
      }
    }
    console.log(formData);
    const selectedRoleName = formData.ROLE || formData.role;
    let selectedRole = event.eventRoles.find(role => role.roleName === selectedRoleName);
    if (!selectedRole) {
      const roleField = event.registrationFields.find(field => field.fieldName === "ROLE");
      if (roleField && roleField.options.includes(selectedRoleName)) {
        // If found in the registration fields, create a mock role object to avoid breaking the logic
        selectedRole = { roleName: selectedRoleName };
      }
    }

    // Now, if selectedRole is still not found, return the error
    if (!selectedRole) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    // 2. Prepare privileges with 'claim: false'
    const privileges = selectedRole.privileges.map(privilege => ({
      name: privilege,
      claim: false
    }));

    let user = await User.findOne({ email, eventId: event._id });

    if (!user) {
      return res.status(400).json({
        message: 'No user found with this email and event ID. Please complete the payment first.'
      });
    }

    user.companyName = event.companyName;
    user.eventName = event.eventName;
    user.role = selectedRole.roleName;
    user.privileges = privileges;
    user.registrationData = formData;

    await user.save();

    // Generate QR Code and Ticket
    const role = selectedRole.roleName;
    const { eventName, companyName, place, time, startDate } = event;

    const qrCodeData = `${email}-${user._id}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);
    const date = startDate;

    user.qrCode = qrCodeData;
    await user.save();

    const ticketID = user._id.toString();
    const pdfPath = path.join(__dirname, "../public/pdfs", `${ticketID}.pdf`);

    await generateTicketPDF(name, email, eventName, companyName, place, time, date, role, ticketID, qrCodeImage, pdfPath);
    await sendSuccessEmail(name, email, eventName, companyName, place, time, date, qrCodeImage, role, ticketID, pdfPath);

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user', error: err.message || err });
  }
};

exports.getRoleRegistrationsCount = async (req, res) => {
  const { eventID } = req.params;

  try {
    // Step 1: Aggregate count of users per role for the event
    const roleCounts = await User.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventID) } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Convert to { roleName: count } object
    const registrationMap = {};
    roleCounts.forEach((r) => {
      registrationMap[r._id] = r.count;
    });

    // Optional: Also check for roles that are not yet filled and set count to 0
    const event = await Event.findById(eventID);
    if (event && event.eventRoles) {
      event.eventRoles.forEach(role => {
        if (!(role.roleName in registrationMap)) {
          registrationMap[role.roleName] = 0;
        }
      });
    }
    console.log("regMap", registrationMap);
    res.json(registrationMap);
  } catch (err) {
    console.error('Error fetching role registration counts:', err);
    res.status(500).json({ message: 'Failed to fetch registration counts.', err });
  }
};

exports.checkEmail = async (req, res) => {
  const { email, eventId } = req.body;
  console.log("check email :", req.body)

  const existingUser = await User.findOne({ email, eventId });

  if (existingUser) {
    return res.json({ exists: true });
  }
  return res.json({ exists: false });
};

exports.getUsersByTransactionID = async (req, res) => {
  const { transactionID } = req.params;
  try {
    const user = await User.findOne({ transactionId: transactionID });
    if (!user) {
      return res.status(404).json({ error: "user not found for this transactionID !" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Error fetching user by transactionID:", err);
    res.status(500).json({ error: "Server error" });
  }

}
