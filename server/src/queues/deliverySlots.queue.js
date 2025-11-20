// import { Queue, Worker, QueueEvents } from "bullmq";
// import "dotenv/config";
// import { generateSlots } from "../utils/generateDeliverySlots.utils.js";
// import { connection } from "../lib/bullmq.config.js";
//
// //#region Create the queue + Event Listener
// export const slotQueue = new Queue("slot-generator", { connection });
// const slotQueueEvents = new QueueEvents("slot-generator", { connection });
// //#endregion
//
// //#region Wokrer that processses the repeatable job (fortnightly)
// const worker = new Worker(
//   "slot-generator",
//   async (job) => {
//     console.log("Generating new delivery slots for the next 14 days...");
//     await generateSlots();
//     console.log("Delivery slots updated.");
//   },
//   { connection },
// );
// //#endregion
//
// //#region Add the repeatable job -> Wrap it in an async IIFE
// (async () => {
//   await slotQueue.add(
//     "delivery-slot-refresh",
//     {},
//     {
//       jobId: "delivery-slot-refresh",
//       repeat: {
//         // Realistically better than "every: 14 days"
//         cron: "0 0 */14 * *",
//       },
//     },
//   );
// })();
// //#endregion
//
// //#region Event Listeners
// slotQueueEvents.on("completed", ({ jobId }) => {
//   console.log(`Slot Generator job ${jobId} completed successfully.`);
// });
//
// slotQueueEvents.on("failed", ({ jobId, failedReason }) => {
//   console.error(`Slot Generator job ${jobId} failed:`, failedReason);
// });
// //#endregion
//
// setInterval(() => {}, 60 * 1000);
