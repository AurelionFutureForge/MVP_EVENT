const User = require("../models/User");

// VERIFY QR CODE — Claim the specific privilege and update the user's data
exports.verifyQRCode = async (req, res) => {
  const { qrCode, privilegeName, eventId, eventName } = req.body;  // qrCode, privilegeName, eventId, and eventName are passed from the frontend

  try {
    // Find the user with the scanned QR code
    const user = await User.findOne({ qrCode });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found!" });
    }

    // Ensure the QR code is linked to the correct eventId and eventName
    if (user.eventId !== eventId || user.eventName !== eventName) {
      return res.status(400).json({
        status: "error",
        message: `QR Code is not associated with the event: ${eventName} (Event ID: ${eventId})`,
      });
    }

    // Find the specific privilege in the user's privileges array
    const privilegeIndex = user.privileges.findIndex(p => p.name === privilegeName);

    if (privilegeIndex === -1) {
      return res.status(404).json({ status: "error", message: "Privilege not found for user!" });
    }

    const privilege = user.privileges[privilegeIndex];

    // Check if the privilege is already claimed
    if (privilege.claim) {
      return res.status(400).json({ status: "error", message: `${privilegeName} is already claimed.` });
    }

    // Mark the specific privilege as claimed (claim: true)
    user.privileges[privilegeIndex].claim = true;

    // Save the updated user document
    await user.save();

    // Return a success response with a message
    return res.json({
      status: "success",
      message: `${privilegeName} has been claimed successfully.`,
      user: {
        name: user.registrationData.NAME,  // Assuming user.registrationData has the name
        email: user.registrationData.EMAIL, // Assuming user.registrationData has the email
        role: user.role,                    // Assuming user has a role field
        privileges: user.privileges,        // Privileges updated (but this can be omitted if you don't want to return them)
      },
    });

  } catch (error) {
    console.error("Error verifying QR Code:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};
