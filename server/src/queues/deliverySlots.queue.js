import Bull from "bull";
import "dotenv/config";
import { generateSlots } from "../utils/generateDeliverySlots.utils";

const queueOptions = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
};

const slotQueue = new Bull("slot-generator", queueOptions);

slotQueue.process(async (job) => {
  console.log("Generating new Delivery slots for the next 14 days..");
  await generateSlots(); // NOTE: Default is set to 15 for the next 14 days
  console.log("Delivery slots updated.");
});

//INFO: Add the recurring job to process every 14 days

slotQueue.add(
  {},
  {
    jobId: "delivery-slot-refresh",
    repeat: {
      every: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    },
  },
);

// NOTE: Add some event listeners so we can check our logs

slotQueue.on("completed", (job) => {
  console.log("Slot Generator finished successfully.");
});

slotQueue.on("failed", (job, err) => {
  console.error("Slot Generator failed:", err);
});
