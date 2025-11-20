import { paymentQueue } from "../queues/paymentQueue.queues.js";
import { Order } from "../model/Order.model.js";

/**
 * Stripe → triggers webhook
 * Webhook → enqueue job in Bull (Redis)
 * Redis → stores job temporarily
 * Worker → picks up job asynchronously
 * Worker → updates DB (Order, DeliverySlot, etc.)
 * Worker → job completes or fails (logged)
 *
 */
paymentQueue.process(async (job) => {
  const { type, orderId, userId, slotId } = job.data;

  console.log("Processing Job:", job.id, job.data);
  try {
    if (type === "succeeded") {
      await Order.findByIdAndUpdate(
        orderId,
        { isPaid: true, status: "completed" },
        { new: true, runValidators: true },
      );

      await DraftOrder.findOneAndDelete({ userId });

      if (slotId) {
        await DeliverySlot.findByIdAndUpdate(slotId, {
          status: "booked",
          reservedBy: userId,
        });
      }
      console.log("Job completed");
    }

    if (type === "failed") {
      await Order.findByIdAndDelete(orderId);

      if (slotId) {
        await DeliverySlot.findByIdAndUpdate(slotId, {
          status: "available",
          reservedBy: null,
        });
      }
      console.log("Job Failed");
    }

    return { success: true };
  } catch (error) {
    console.error("Worker error:", error);
    throw error; // Bull will mark this job as failed
  }
});

paymentQueue.on("completed", (job) =>
  console.log(`Job completed: ${job.id} (${job.data.type})`),
);
paymentQueue.on("failed", (job, err) =>
  console.log(`Job failed: ${job.id} (${job.data.type})`, err),
);

console.log("Worker running, waiting for jobs...");
