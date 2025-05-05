const User = require("../models/User");
const Event = require("../models/Event"); // Don't forget this import

// VERIFY QR CODE
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

    const privileges = {
      canClaimEntry: !user.hasEntered,
      canClaimLunch: user.role === 'Speaker' && !user.hasClaimedLunch,
      canClaimGift: user.role === 'Speaker' && !user.hasClaimedGift
    };

    return res.json({
      status: "success",
      message: "QR Code Verified!",
      user,
      privileges
    });
  } catch (error) {
    console.error("Error verifying QR Code:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

//  CLAIM ENTRY
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

// CLAIM LUNCH (Fixed)
exports.claimLunch = async (req, res) => {
  const { qrCode } = req.body;

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    if (!user.eventId) {
      return res.status(400).json({ status: "error", message: "User is not associated with any event!" });
    }

    const event = await Event.findById(user.eventId);

    if (!event) {
      return res.status(404).json({ status: "error", message: "Event not found!" });
    }

    const role = event.eventRoles.find((role) => role.name === user.role);

    if (!role || !role.lunch) {
      return res.status(403).json({ status: "error", message: "You can't claim lunch!" });
    }

    if (user.hasClaimedLunch) {
      return res.status(403).json({ status: "error", message: "Lunch already claimed!" });
    }

    user.hasClaimedLunch = true;
    await user.save();

    role.lunch = true;
    await event.save();

    return res.json({ status: "success", message: "Lunch claimed successfully!", user });
  } catch (error) {
    console.error("Error claiming lunch:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

//  CLAIM GIFT (Fixed)
exports.claimGift = async (req, res) => {
  const { qrCode } = req.body;

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    if (!user.eventId) {
      return res.status(400).json({ status: "error", message: "User is not associated with any event!" });
    }

    const event = await Event.findById(user.eventId);

    if (!event) {
      return res.status(404).json({ status: "error", message: "Event not found!" });
    }

    const role = event.eventRoles.find((role) => role.name === user.role);

    if (!role || !role.gift) {
      return res.status(403).json({ status: "error", message: "You can't claim gift!" });
    }

    if (user.hasClaimedGift) {
      return res.status(403).json({ status: "error", message: "Gift already claimed!" });
    }

    user.hasClaimedGift = true;
    await user.save();

    role.gift = true;
    await event.save();

    return res.json({ status: "success", message: "Gift claimed successfully!", user });
  } catch (error) {
    console.error("Error claiming gift:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
