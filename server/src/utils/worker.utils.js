import "dotenv/config";
import Queue from "bull";
const REDIS_URL =
  "redis://default:BinxrxhkZtCYPxLSktezuNFNsIMKcHre@hopper.proxy.rlwy.net:14165";

const paymentQueue = new Queue("stripe-payments", REDIS_URL);

paymentQueue.process(async (job) => {
  console.log("Processing Job:", job.id, job.data);

  await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate work
  return { success: true, message: "Payment Processed" };
});

paymentQueue.on("completed", (job) => {
  console.log("Job Completed:", job.id);
});

paymentQueue.on("failed", (job, err) => {
  console.log("Job Failed:", job.id, err);
});

paymentQueue.on("error", (err) => {
  console.error("Queue error:", err);
});

console.log(
  "Connecting to Redis:",
  "redis://default:BinxrxhkZtCYPxLSktezuNFNsIMKcHre@hopper.proxy.rlwy.net:14165",
);
// console.log("Worker running, waiting for jobs...");
