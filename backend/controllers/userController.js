const nodemailer = require("nodemailer");
const User = require("../models/User");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");  
const Event = require("../models/Event");   // ADD this import at the top if not already

// Register User
exports.register = async (req, res) => {
  const { name, email, eventName, companyName, place, time, date, contact, role, privileges } = req.body;  // Added privileges
  console.log("Received registration request with body:", req.body);

  try {
    // Check if the user is already registered for the event
    const existingUser = await User.findOne({ email, eventName, companyName });
    if (existingUser) {
      console.log("User already registered for this event:", existingUser);
      return res.status(400).json({ message: "User with this email already registered for this event!" });
    }

    // Fetch the event to get the eventId
    const event = await Event.findOne({ companyName, eventName });
    if (!event) {
      console.log("Event not found:", { companyName, eventName });
      return res.status(404).json({ message: "Event not found!" });
    }

    // Prepare the user data for registration (including privileges)
    const newUserData = {
      name,
      email,
      eventId: event._id,
      eventName,
      companyName,
      place,
      time,
      date: new Date(date).toISOString().split("T")[0], // Format to YYYY-MM-DD
      contact,
      role,
      privileges,  // Save the privileges assigned to the user
    };

    // Create the new user with privileges
    const newUser = new User(newUserData);
    await newUser.save();

    console.log("User registered successfully (before QR generation):", newUser);

    // Generate QR Code (qrCode = email-userId)
    const qrCodeData = `${email}-${newUser._id}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Save the QR code data (not the image) in DB
    newUser.qrCode = qrCodeData;
    await newUser.save();

    // Generate PDF ticket
    const ticketID = newUser._id.toString();
    const pdfPath = path.join(__dirname, "../public/pdfs", `${ticketID}.pdf`);
    await generateTicketPDF(name, email, eventName, companyName, place, time, date, role, ticketID, qrCodeImage, pdfPath);

    // Send success email with PDF and QR
    await sendSuccessEmail(name, email, eventName, companyName, place, time, date, qrCodeImage, role, ticketID, pdfPath);

    // Final success response
    res.status(201).json({
      message: "Registration successful!",
      name: newUser.name,
      email: newUser.email,
      eventName: newUser.eventName,
      qrCode: qrCodeImage,
      privileges: newUser.privileges  // Include the privileges in the response
    });

  } catch (error) {
    console.error("Error Registering User:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};



// Function to generate PDF dynamically
const generateTicketPDF = async (name, email, eventName, companyName, place, time, date, role, ticketID, qrCodeImage, pdfPath) => {
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
    doc.fontSize(18).text(`${date}, ${time}(IST)`, { align: "center" });

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
const sendSuccessEmail = async (name, email, eventName, companyName, place, time, date, qrCodeImage, role, ticketID, pdfPath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amthemithun@gmail.com",
        pass: "ptfk ykpn uygd yodb",
      },
    });

    let ticketClass = role;
    let paymentStatus = "will be added soon";

    // Find user and retrieve privileges
    const user = await User.findOne({ email }); // Use email as the query key
    const event = await Event.findById(user.eventId);  // Get the event based on the user


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
            <p><strong>📅 Date:</strong> ${date} </p>
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
            <a href="https://mvp-event.vercel.app/register/${companyName}/${eventName}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Click here to register</a>
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
    console.log("Success email sent with PDF, QR code, and available privileges to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


exports.registerUser = async (req, res) => {
  const { eventId, formData } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 2. Get selected role from formData
    const selectedRoleName = formData.role;
    const selectedRole = event.eventRoles.find(role => role.roleName === selectedRoleName);
    if (!selectedRole) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    // 3. Map privileges to include { name, claim: false }
    const formattedPrivileges = selectedRole.privileges.map(priv => ({
      name: priv,
      claim: false
    }));

    // 4. Save user with registration fields + role + formatted privileges
    const newUser = new User({
      eventId: event._id,
      companyName: event.companyName,
      role: selectedRole.roleName,
      privileges: formattedPrivileges,  // <-- now array of objects
      registrationData: formData
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
};


