import Queue from "bull";
import "dotenv/config";

const REDIS_URL =
  "redis://default:BinxrxhkZtCYPxLSktezuNFNsIMKcHre@hopper.proxy.rlwy.net:14165";

// Create a single queue that will be shared across webhook and worker
export const paymentQueue = new Queue("stripe-payments", REDIS_URL);

paymentQueue.on("error", (err) => {
  console.error("Queue error:", err);
});
