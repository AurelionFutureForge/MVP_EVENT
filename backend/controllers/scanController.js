const User = require("../models/User");

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
    return res.json({ status: "success", message: "QR Code Verified!", user });
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

exports.claimLunch = async (req, res) => {
  const { qrCode } = req.body;

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user || user.role !== "Speaker") {
      return res.status(403).json({ status: "error", message: "Only speakers can claim lunch!" });
    }

    if (user.hasClaimedLunch) {
      return res.status(403).json({ status: "error", message: "Lunch already claimed!" });
    }

    user.hasClaimedLunch = true;
    await user.save();
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

    if (!user || user.role !== "Speaker") {
      return res.status(403).json({ status: "error", message: "Only speakers can claim gifts!" });
    }

    if (user.hasClaimedGift) {
      return res.status(403).json({ status: "error", message: "Gift already claimed!" });
    }

    user.hasClaimedGift = true;
    await user.save();
    return res.json({ status: "success", message: "Gift claimed successfully!", user });
  } catch (error) {
    console.error("Error claiming gift:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
