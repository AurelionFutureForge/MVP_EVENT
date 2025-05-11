// VERIFY QR CODE — Claim the specific privilege and update the user's data
exports.verifyQRCode = async (req, res) => {
  const { qrCode, privilegeName, eventName, eventId } = req.body;  // qrCode, privilegeName, eventId, eventName passed from the frontend

  try {
    // Find the user with the scanned QR code
    const user = await User.findOne({ qrCode });
    
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found!" });
    }

    // Check if the QR code matches the user's event data
    const event = user.events.find((e) => e.eventId.toString() === eventId.toString() && e.eventName === eventName);

    if (!event) {
      return res.status(400).json({
        status: "error",
        message: `QR Code is not associated with the event: ${eventName} (Event ID: ${eventId})`,
      });
    }

    // Find the specific privilege in the user's privileges array
    const privilegeIndex = event.privileges.findIndex(p => p.name === privilegeName);

    if (privilegeIndex === -1) {
      return res.status(404).json({ status: "error", message: "Privilege not found for user!" });
    }

    const privilege = event.privileges[privilegeIndex];

    // Check if the privilege is already claimed
    if (privilege.claim) {
      return res.status(400).json({ status: "error", message: `${privilegeName} is already claimed.` });
    }

    // Mark the specific privilege as claimed (claim: true)
    event.privileges[privilegeIndex].claim = true;

    // Save the updated user document
    await user.save();

    // Return a success response with a message
    return res.json({
      status: "success",
      message: `${privilegeName} has been claimed successfully.`,
      user: {
        name: user.name,
        email: user.email,
        role: event.role,
        privileges: event.privileges, // Privileges updated (but this can be omitted if you don't want to return them)
      },
    });

  } catch (error) {
    console.error("Error verifying QR Code:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};
