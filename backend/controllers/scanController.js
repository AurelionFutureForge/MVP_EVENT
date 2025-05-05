const User = require("../models/User");
const Event = require("../models/Event");

// VERIFY QR CODE — Auto-claim Entry
exports.verifyQRCode = async (req, res) => {
  const { qrCode } = req.body;
  const trimmedQR = qrCode.trim();
  console.log("Searching for QR Code:", trimmedQR);

  try {
    const user = await User.findOne({ qrCode: trimmedQR }).collation({ locale: 'en', strength: 2 });

    if (!user) {
      console.log("No matching user found in DB");
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    console.log("User found:", user);

    // Fetch event and role privileges dynamically
    const event = await Event.findById(user.eventId);
    const role = event?.eventRoles.find(r => r.name === user.role);

    if (!role) {
      return res.status(404).json({ status: "error", message: "Role not found for user!" });
    }

    // === AUTO-CLAIM ENTRY ===
    let entryJustClaimed = false;
    if (!user.hasEntered) {
      user.hasEntered = true;
      await user.save();
      entryJustClaimed = true;
      console.log("Entry auto-claimed for user:", user);
    }

    const privileges = {
      canClaimEntry: !user.hasEntered,  // Should be false after auto-claim
      canClaimLunch: role.privileges.lunch ? !user.hasClaimedLunch : false,
      canClaimGift: role.privileges.gift ? !user.hasClaimedGift : false
    };

    console.log("Privileges calculated:", privileges);

    return res.json({
      status: "success",
      message: entryJustClaimed ? "QR Code Verified & Entry auto-claimed!" : "QR Code Verified!",
      user,
      privileges
    });

  } catch (error) {
    console.error("Error verifying QR Code:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


// CLAIM LUNCH (Safe for missing field)
exports.claimLunch = async (req, res) => {
  const { qrCode } = req.body;
  console.log("Claiming lunch for QR Code:", qrCode.trim());

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    const event = await Event.findById(user.eventId);
    const role = event?.eventRoles.find(r => r.name === user.role);

    if (!role || !role.privileges.lunch) {
      return res.status(403).json({ status: "error", message: "You can't claim lunch!" });
    }

    if (user.hasClaimedLunch) {
      return res.status(403).json({ status: "error", message: "Lunch already claimed!" });
    }

    user.hasClaimedLunch = true;  // If field didn't exist before, Mongo will create it now
    await user.save();

    console.log("Lunch successfully claimed for user:", user);
    return res.json({ status: "success", message: "Lunch claimed successfully!", user });

  } catch (error) {
    console.error("Error claiming lunch:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// CLAIM GIFT (Safe for missing field)
exports.claimGift = async (req, res) => {
  const { qrCode } = req.body;
  console.log("Claiming gift for QR Code:", qrCode.trim());

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    const event = await Event.findById(user.eventId);
    const role = event?.eventRoles.find(r => r.name === user.role);

    if (!role || !role.privileges.gift) {
      return res.status(403).json({ status: "error", message: "You can't claim gift!" });
    }

    if (user.hasClaimedGift) {
      return res.status(403).json({ status: "error", message: "Gift already claimed!" });
    }

    user.hasClaimedGift = true;  // If field didn't exist before, Mongo will create it now
    await user.save();

    console.log("Gift successfully claimed for user:", user);
    return res.json({ status: "success", message: "Gift claimed successfully!", user });

  } catch (error) {
    console.error("Error claiming gift:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
