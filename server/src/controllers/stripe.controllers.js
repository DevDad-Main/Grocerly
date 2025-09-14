import Stripe from "stripe";
import { Order } from "../model/Order.model.js";
import { DraftOrder } from "../model/DraftOrder.model.js";
import { DeliverySlot } from "../model/DeliverySlot.model.js";

//#region Post Confirm Stripe Session Payment
export const postConfirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const stripe = new Stripe(process.env.STRIPE_SK);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const { orderId, userId, slotId } = session.payment_intent.metadata;

    if (session.payment_status === "paid") {
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

      return res.status(200).json({
        success: true,
        message: "Payment confirmed",
      });
    } else {
      await Order.findByIdAndDelete(orderId);

      if (slotId) {
        await DeliverySlot.findByIdAndUpdate(slotId, {
          status: "available",
          reservedBy: null,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error confirming payment",
    });
  }
};
//#endregion
