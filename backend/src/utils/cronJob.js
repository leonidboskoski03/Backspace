const cron = require("node-cron");
const { differenceInDays, startOfDay } = require("date-fns");
const Resident = require("../models/Resident");

const startCronJob = () => {
  // Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Running payment due check...");
    try {
      const residents = await Resident.find();
      const today = startOfDay(new Date());

      for (const resident of residents) {
        const payDay = startOfDay(new Date(resident.paymentDate));
        const daysUntil = differenceInDays(payDay, today);

        const isDueSoon = daysUntil === 3;
        if (resident.isDueSoon !== isDueSoon) {
          resident.isDueSoon = isDueSoon;
          await resident.save();
        }
      }

      console.log("[CRON] Payment due check complete.");
    } catch (err) {
      console.error("[CRON] Error:", err.message);
    }
  });
};

module.exports = startCronJob;

