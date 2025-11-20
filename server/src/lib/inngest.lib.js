import { Inngest } from "inngest";
import { generateSlots } from "../utils/generateDeliverySlots.utils.js";

//#region Inngest Setup
export const inngest = new Inngest({
  id: "grocerly-app",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
//#endregion

//#region Generate Delivery Slots Fortnightly
const generateDeliverySlotsTask = inngest.createFunction(
  { id: "generate-slots-task" },
  {
    cron: "TZ=Europe/Warsaw 0 0 */14 * *",
  },
  async ({ step }) => {
    console.log("Generating new delivery slots for the next 14 days...");
    await step.run("generate-delivery-slots", async () => {
      await generateSlots();
      console.log("Delivery slots Generated.");
    });
  },
);
//#endregion

//#region Stripe Payment Intent Created
const stripePaymentIntentCreatedTask = inngest.createFunction(
  { id: "stripe-payment-created" },
  {
    event: "stripe/payment_intent.created",
  },
  async ({ event }) => {
    console.log(event);
  },
);
//#endregion

export const functions = [
  generateDeliverySlotsTask,
  stripePaymentIntentCreatedTask,
];
