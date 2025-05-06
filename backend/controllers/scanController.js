const User = require("../models/User");
const Event = require("../models/Event");

// VERIFY QR CODE — Always show user info & available privileges
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

    const event = await Event.findById(user.eventId);
    const role = event?.eventRoles.find(r => r.name === user.role);

    if (!role) {
      return res.status(404).json({ status: "error", message: "Role not found for user!" });
    }

    let entryJustClaimed = false;
    let entryMessage = "";

    // Auto-claim entry if not yet done
    if (!user.hasEntered) {
      user.hasEntered = true;
      await user.save();
      entryJustClaimed = true;
      entryMessage = "Entry auto-claimed!";
      console.log("Entry auto-claimed for user:", user.name);
    } else {
      entryMessage = "Entry already claimed!";
      console.log("Entry was already claimed for user:", user.name);
    }

    // Compute dynamic privileges (based on claimedPrivileges array)
    const privileges = user.claimedPrivileges.map((priv) => ({
      privilegeName: priv.privilegeName,
      canClaim: !priv.claimed,
    }));

    console.log("Privileges calculated:", privileges);

    return res.json({
      status: "success",
      message: entryMessage,
      user,
      privileges,   // Array of { privilegeName, canClaim }
    });

  } catch (error) {
    console.error("Error verifying QR Code:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


// UNIVERSAL CLAIM PRIVILEGE — handles any privilege
exports.claimPrivilege = async (req, res) => {
  const { qrCode, privilegeName } = req.body;
  console.log(`Claiming '${privilegeName}' for QR Code:`, qrCode.trim());

  try {
    const user = await User.findOne({ qrCode: new RegExp(`^${qrCode.trim()}$`, "i") });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Invalid QR Code!" });
    }

    const event = await Event.findById(user.eventId);
    const role = event?.eventRoles.find(r => r.name === user.role);

    if (!role) {
      return res.status(404).json({ status: "error", message: "Role not found!" });
    }

    // Check if the role has this privilege
    const rolePrivilege = role.privileges.find(p => p.name === privilegeName);
    if (!rolePrivilege) {
      return res.status(403).json({ status: "error", message: `You can't claim '${privilegeName}'!` });
    }

    // Find the user's claimedPrivileges record
    const userPrivilege = user.claimedPrivileges.find(p => p.privilegeName === privilegeName);
    if (!userPrivilege) {
      return res.status(403).json({ status: "error", message: `Privilege '${privilegeName}' not found for user!` });
    }

    if (userPrivilege.claimed) {
      return res.status(403).json({ status: "error", message: `'${privilegeName}' already claimed!` });
    }

    userPrivilege.claimed = true;
    await user.save();

    console.log(`Privilege '${privilegeName}' successfully claimed for user:`, user.name);
    return res.json({ status: "success", message: `'${privilegeName}' claimed successfully!`, user });

  } catch (error) {
    console.error("Error claiming privilege:", error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
