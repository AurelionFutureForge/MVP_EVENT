const User = require("../models/User");
const Event = require("../models/Event"); // Don't forget this import

// VERIFY QR CODE
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

    const privileges = {
      canClaimEntry: !user.hasEntered,
      canClaimLunch: user.role === 'Speaker' && !user.hasClaimedLunch, // Corrected this check for Speaker role
      canClaimGift: user.role === 'Speaker' && !user.hasClaimedGift // Corrected this check for Speaker role
    };

    console.log("Privileges calculated:", privileges);

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

// CLAIM ENTRY
exports.claimEntry = async (req, res) => {
  const { qrCode } = req.body;
  console.log("Claiming entry for QR Code:", qrCode.trim());

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      console.log("No user found for QR Code:", qrCode.trim());
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    if (user.hasEntered) {
      console.log("Entry already claimed for user:", user);
      return res.status(403).json({ status: "error", message: "Entry already claimed!" });
    }

    user.hasEntered = true;
    await user.save();
    console.log("Entry successfully claimed for user:", user);

    return res.json({ status: "success", message: "Entry claimed successfully!", user });
  } catch (error) {
    console.error("Error claiming entry:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// CLAIM LUNCH (Fixed)
exports.claimLunch = async (req, res) => {
  const { qrCode } = req.body;
  console.log("Claiming lunch for QR Code:", qrCode.trim());

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      console.log("No user found for QR Code:", qrCode.trim());
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    if (!user.eventId) {
      console.log("User is not associated with an event:", user);
      return res.status(400).json({ status: "error", message: "User is not associated with any event!" });
    }

    const event = await Event.findById(user.eventId);

    if (!event) {
      console.log("Event not found for user:", user);
      return res.status(404).json({ status: "error", message: "Event not found!" });
    }

    const role = event.eventRoles.find((role) => role.name === user.role);
    console.log("Role for user:", role);

    // Ensure role exists and check for lunch privilege
    if (!role || !role.privileges.lunch) {
      console.log("User is not allowed to claim lunch:", user);
      return res.status(403).json({ status: "error", message: "You can't claim lunch!" });
    }

    if (user.hasClaimedLunch) {
      console.log("Lunch already claimed for user:", user);
      return res.status(403).json({ status: "error", message: "Lunch already claimed!" });
    }

    // Proceed with claiming lunch
    user.hasClaimedLunch = true;
    await user.save();

    // Optionally, update the event roles if needed
    role.privileges.lunch = true;  // Set lunch as claimed in the role privileges if needed
    await event.save();

    console.log("Lunch successfully claimed for user:", user);

    return res.json({ status: "success", message: "Lunch claimed successfully!", user });
  } catch (error) {
    console.error("Error claiming lunch:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// CLAIM GIFT (Fixed)
exports.claimGift = async (req, res) => {
  const { qrCode } = req.body;
  console.log("Claiming gift for QR Code:", qrCode.trim());

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      console.log("No user found for QR Code:", qrCode.trim());
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    if (!user.eventId) {
      console.log("User is not associated with an event:", user);
      return res.status(400).json({ status: "error", message: "User is not associated with any event!" });
    }

    const event = await Event.findById(user.eventId);

    if (!event) {
      console.log("Event not found for user:", user);
      return res.status(404).json({ status: "error", message: "Event not found!" });
    }

    const role = event.eventRoles.find((role) => role.name === user.role);
    console.log("Role for user:", role);

    // Ensure role exists and check for gift privilege
    if (!role || !role.privileges.gift) {
      console.log("User is not allowed to claim gift:", user);
      return res.status(403).json({ status: "error", message: "You can't claim gift!" });
    }

    if (user.hasClaimedGift) {
      console.log("Gift already claimed for user:", user);
      return res.status(403).json({ status: "error", message: "Gift already claimed!" });
    }

    // Proceed with claiming gift
    user.hasClaimedGift = true;
    await user.save();

    // Optionally, update the event roles if needed
    role.privileges.gift = true;  // Set gift as claimed in the role privileges if needed
    await event.save();

    console.log("Gift successfully claimed for user:", user);

    return res.json({ status: "success", message: "Gift claimed successfully!", user });
  } catch (error) {
    console.error("Error claiming gift:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
