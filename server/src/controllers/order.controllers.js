import mongoose, { isValidObjectId } from "mongoose";
import { Order } from "../model/Order.model.js";
import { DraftOrder } from "../model/DraftOrder.model.js";
import { DeliverySlot } from "../model/DeliverySlot.model.js";
import { Product } from "../model/Product.model.js";
import { User } from "../model/User.model.js";
import Stripe from "stripe";

const threePercentTax = 0.03;

//#region Place Order With COD -> api/v1/order/place-order
export const placeOrderWithCOD = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const userId = req.user?._id;
    const { address, items, total } = req.body;

    console.log("Address", address);
    console.log("Items", items);

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }
    if (!address || items.length === 0 || total === 0) {
      return res.json({
        success: false,
        message: "Invalid Address or Items or Ttal amount",
      });
    }

    const draftOrder = await DraftOrder.findOneAndDelete(
      { userId },
      { session },
    );

    if (draftOrder?.deliverySlot) {
      await DeliverySlot.findByIdAndUpdate(
        draftOrder.deliverySlot,
        {
          reservedBy: null,
          status: "available",
        },
        { session },
      );
    }

    const order = new Order({
      userId,
      items,
      total,
      address,
      deliverySlot: draftOrder.deliverySlot,
      paymentType: "COD",
    });

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, message: "Order Placed" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Place Order With Stripe -> api/v1/order/place-stripe
export const placeOrderWithStripe = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const userId = req.user?._id;
    const { address, items, total } = req.body;
    const { origin } = req.headers;

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    if (!address || items.length === 0 || total === 0) {
      return res.json({
        success: false,
        message: "Invalid Address or Items or Ttal amount",
      });
    }

    const user = await User.findOne({ _id: userId }).session(session);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Fetch all products safely
    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // Build line items for Stripe
    const line_items = items.map((item) => {
      const product = products.find((p) => p._id.equals(item.product));
      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }

      return {
        price_data: {
          currency: "pln", // or "gbp" etc.
          product_data: {
            name: product.name,
          },
          unit_amount:
            Math.floor(
              product.offerPrice + product.offerPrice * threePercentTax,
            ) * 100,
        },
        quantity: item.quantity,
      };
    });

    const draftOrder = await DraftOrder.findOne({ userId }).session(session);

    if (draftOrder?.deliverySlot) {
      await DeliverySlot.findByIdAndUpdate(
        draftOrder.deliverySlot,
        {
          reservedBy: null,
          status: "available",
        },
        { session },
      );
    }

    const order = new Order({
      userId,
      items,
      total,
      address,
      deliverySlot: draftOrder.deliverySlot,
      paymentType: "Card",
    });

    await order.save({ session });

    // const stripeSession = await stripe.checkout.sessions.create({
    //   payment_method_types: ["card"],
    //   line_items,
    //   mode: "payment",
    //   success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${origin}/cart`,
    //   metadata: {
    //     orderId: order._id.toString(),
    //   },
    // });

    const stripeInstance = new Stripe(process.env.STRIPE_SK);
    const stripeSession = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${origin}/loading?next=orders`,
      cancel_url: `${origin}/cart`,
      customer_email: user.email,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      url: stripeSession.url,
      message: "Order Placed",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Strip Webook to Verify Payment Actions and Give Order PDF
export const stripeWebHook = async (req, res) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SK);

  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  //Handle Event
  switch (event.type) {
    case "payment_intent.succeeded": {
      const data = event.data.object;
      const orderId = data.metadata.orderId;
      const userId = data.metadata.userId;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: data.id,
      });

      await Order.findByIdAndUpdate(orderId, { isPaid: true });

      await DraftOrder.findOneAndDelete({ userId });
      break;
    }

    case "payment_intent.payment_failed": {
      const data = event.data.object;
      const orderId = data.metadata.orderId;
      const userId = data.metadata.userId;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: data.id,
      });

      await Order.findByIdAndDelete(orderId);
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }
  return res.json({ received: true });
};
//#endregion

//#region Get Orders For User -> api/v1/order/orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, orders, message: "Orders Fetched" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};

//#endregion

//#region Get All Orders For Admin -> api/v1/order/admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, orders, message: "Orders Fetched" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};

//#endregion
