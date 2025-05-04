const User = require("../models/User");

// Modify `verifyQRCode` to include the user's privileges
exports.verifyQRCode = async (req, res) => {
  const { qrCode } = req.body;
  console.log("Searching for QR Code:", qrCode.trim());

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      console.log("No matching user found in DB");
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    console.log("User found:", user);

    // Send privileges dynamically based on the role and status (hasEntered, hasClaimedLunch, hasClaimedGift)
    const privileges = {
      canClaimEntry: !user.hasEntered,
      canClaimLunch: user.role === 'Speaker' && !user.hasClaimedLunch,
      canClaimGift: user.role === 'Speaker' && !user.hasClaimedGift
    };

    return res.json({
      status: "success",
      message: "QR Code Verified!",
      user,
      privileges // Send privileges to the frontend
    });
  } catch (error) {
    console.error("Error verifying QR Code:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


exports.claimEntry = async (req, res) => {
  const { qrCode } = req.body;

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    if (user.hasEntered) {
      return res.status(403).json({ status: "error", message: "Entry already claimed!" });
    }

    user.hasEntered = true;
    await user.save();
    return res.json({ status: "success", message: "Entry claimed successfully!", user });
  } catch (error) {
    console.error("Error claiming entry:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// Update the event roles dynamically when claiming lunch or gift
exports.claimLunch = async (req, res) => {
  const { qrCode } = req.body;

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    const event = await Event.findById(user.eventId); // Assuming the user has an eventId reference

    // Check if the user's role is 'Speaker'
    const role = event.eventRoles.find((role) => role.name === user.role);

    if (!role || !role.lunch) {
      return res.status(403).json({ status: "error", message: "You can't claim lunch!" });
    }

    if (user.hasClaimedLunch) {
      return res.status(403).json({ status: "error", message: "Lunch already claimed!" });
    }

    // Mark lunch as claimed
    user.hasClaimedLunch = true;
    await user.save();

    // Update event role claim status
    role.lunch = true; // Mark that lunch has been claimed for this role
    await event.save();

    return res.json({ status: "success", message: "Lunch claimed successfully!", user });
  } catch (error) {
    console.error("Error claiming lunch:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

exports.claimGift = async (req, res) => {
  const { qrCode } = req.body;

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    const event = await Event.findById(user.eventId); // Assuming the user has an eventId reference

    // Check if the user's role is 'Speaker'
    const role = event.eventRoles.find((role) => role.name === user.role);

    if (!role || !role.gift) {
      return res.status(403).json({ status: "error", message: "You can't claim gift!" });
    }

    if (user.hasClaimedGift) {
      return res.status(403).json({ status: "error", message: "Gift already claimed!" });
    }

    // Mark gift as claimed
    user.hasClaimedGift = true;
    await user.save();

    // Update event role claim status
    role.gift = true; // Mark that gift has been claimed for this role
    await event.save();

    return res.json({ status: "success", message: "Gift claimed successfully!", user });
  } catch (error) {
    console.error("Error claiming gift:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
