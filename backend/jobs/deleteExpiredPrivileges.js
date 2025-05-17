const cron = require("node-cron");
const Privilege = require("../models/privilegeModel");

cron.schedule("0 0 * * *", async () => {  // Runs every day at midnight
  const now = new Date();

  try {
    const allDocs = await Privilege.find();

    for (const doc of allDocs) {
      // Filter to keep only unexpired privileges
      const validPrivileges = doc.privileges.filter(
        (priv) => !priv.endDate || new Date(priv.endDate) >= now
      );

      if (validPrivileges.length === 0) {
        // If no valid privileges remain, delete the whole document
        await Privilege.findByIdAndDelete(doc._id);
        console.log(`Deleted entire privilege document for event: ${doc.eventName}`);
      } else if (validPrivileges.length !== doc.privileges.length) {
        // Else, update the doc with only valid privileges
        doc.privileges = validPrivileges;
        await doc.save();
        console.log(`Expired privileges removed from event: ${doc.eventName}`);
      }
    }
  } catch (err) {
    console.error("Error while cleaning up privileges:", err);
  }
});
