import "dotenv/config";
import Queue from "bull";

const REDIS_URL =
  "redis://default:BinxrxhkZtCYPxLSktezuNFNsIMKcHre@hopper.proxy.rlwy.net:14165";

const paymentQueue = new Queue("stripe-payments", REDIS_URL);

paymentQueue.on("error", (err) => {
  console.error("Queue error:", err);
});

async function addJob() {
  const job = await paymentQueue.add({ message: "Hello Bull!" });
  console.log("Job added:", job.id);
  process.exit(0); // exit after adding
}

addJob();
