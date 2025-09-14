import "dotenv/config";
import Queue from "bull";

const REDIS_URL =
  "redis://default:BinxrxhkZtCYPxLSktezuNFNsIMKcHre@hopper.proxy.rlwy.net:14165";

// Create a single queue that will be shared across webhook and worker
export const paymentQueue = new Queue("stripe-payments", process.env.REDIS_URL);

paymentQueue.on("error", (err) => {
  console.error("Queue error:", err);
});

// console.log("Queue connection established:", process.env.REDIS_URL);
