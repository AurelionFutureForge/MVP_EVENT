const cron = require("node-cron");
const Privilege = require("../models/privilegeModel");

cron.schedule("0 0 * * *", async () => {  // Runs every day at midnight
  const now = new Date();

  try {
    const allDocs = await Privilege.find();

    for (const doc of allDocs) {
      const originalCount = doc.privileges.length;

      // Filter out expired privileges
      doc.privileges = doc.privileges.filter(priv => !priv.endDate || new Date(priv.endDate) >= now);

      if (doc.privileges.length !== originalCount) {
        await doc.save();
        console.log(`Expired privileges removed from event ${doc.eventName}`);
      }
    }
  } catch (err) {
    console.error("Error while deleting expired privileges:", err);
  }
});
