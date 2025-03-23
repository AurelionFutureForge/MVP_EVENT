const sendSuccessEmail = async (name, email, eventName, qrCodeImage, role, ticketID) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "amthemithun@gmail.com",
        pass: "ptfk ykpn uygd yodb",
      },
    });

    // ✅ Define Ticket Class & Payment Status Based on Role
    let ticketClass = "";
    let paymentStatus = "";

    if (role === "Visitor") {
      ticketClass = "Visitors Registration (PAID ENTRY)";
      paymentStatus = "✅ Payment Received";
    } else if (role === "Speaker") {
      ticketClass = "Speaker Registration (FREE ENTRY)";
      paymentStatus = "✅ No Payment Required";
    } else {
      ticketClass = "Unknown Role";
      paymentStatus = "❓ Payment Status Unknown";
    }

    // ✅ Convert base64 image to buffer for attachment
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
    const qrCodeBuffer = Buffer.from(base64Data, "base64");

    const mailOptions = {
      from: "amthemithun@gmail.com",
      to: email,
      subject: `🎉 ${eventName} - You're Invited!`, 
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
          cid: "qrcode"    //  Added 'cid' reference for inline display
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};
