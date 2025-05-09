const User = require("../models/User");

exports.verifyQRCode = async (req, res) => {
  const qrCode = req.body.qrCode?.trim();
  const privilegeName = req.body.privilegeName?.trim();

  try {
    const user = await User.findOne({ qrCode });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found!" });
    }

    const privilegeIndex = user.privileges.findIndex(
      (p) => p.name.toLowerCase() === privilegeName.toLowerCase()
    );

    if (privilegeIndex === -1) {
      return res.status(404).json({ status: "error", message: "Privilege not found for user!" });
    }

    const privilege = user.privileges[privilegeIndex];

    if (privilege.claim) {
      return res.status(400).json({ status: "error", message: `${privilegeName} is already claimed.` });
    }

    user.privileges[privilegeIndex].claim = true;
    await user.save();

    return res.json({
      status: "success",
      message: `${privilegeName} has been claimed successfully.`,
      user: {
        name: user.name,
        email: user.email,
        privileges: user.privileges,
      },
    });

  } catch (error) {
    console.error("Error verifying QR Code:", error.message);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};
