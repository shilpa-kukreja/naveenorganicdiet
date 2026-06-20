import cron from "node-cron";
import { cleanupUpdatedProducts, removeExpiredCarts } from "../controllers/abandonedCartCleanupController.js";

/**
 * Schedule cleanup jobs
 */
export const scheduleAbandonedCartJobs = () => {
  // Cleanup updated products every 1 hour
  cron.schedule("0 * * * *", async () => {
    console.log("Running abandoned cart cleanup...");
    await cleanupUpdatedProducts();
  });

  // Remove expired carts every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("Removing expired abandoned carts...");
    await removeExpiredCarts();
  });

  // Send initial reminders after 1 hour of inactivity
  cron.schedule("*/30 * * * *", async () => {
    console.log("Checking for abandoned carts to send reminders...");
    // You can add logic here to send first reminder after 1 hour
   
  });

  console.log("Abandoned cart jobs scheduled");
};