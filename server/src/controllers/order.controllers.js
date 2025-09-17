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

    // Fetch all products safely
    const productIds = items.map((item) => item.product);

    const products = await Product.find({ _id: { $in: productIds } });

    // Calculate Total Points for the Order
    const pointsTotal = items.reduce((acc, item) => {
      const product = products.find((p) => p._id.equals(item.product));
      return acc + product.points * item.quantity;
    }, 0);

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
      points: pointsTotal,
    });

    await order.save({ session });

    // Increment the users points total by the amount of the order
    await User.findByIdAndUpdate(
      userId,
      { $inc: { points: pointsTotal } },
      { session },
    );

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
          unit_amount: Math.floor(product.offerPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    // Work out cart total
    const cartSubtotal = items.reduce((acc, item) => {
      const product = products.find((p) => p._id.equals(item.product));
      return acc + product.offerPrice * item.quantity;
    }, 0);

    // add tax line item (3% of cart total)
    const taxAmount = Math.floor(cartSubtotal * threePercentTax * 100);

    // Calculate Total Points for the Order
    const pointsTotal = items.reduce((acc, item) => {
      const product = products.find((p) => p._id.equals(item.product));
      return acc + product.points * item.quantity;
    }, 0);

    if (taxAmount > 0) {
      line_items.push({
        price_data: {
          currency: "pln",
          product_data: {
            name: "Tax (3%)",
          },
          unit_amount: taxAmount,
        },
        quantity: 1,
      });
    }

    const draftOrder = await DraftOrder.findOne({ userId }).session(session);

    // if (draftOrder?.deliverySlot) {
    //   await DeliverySlot.findByIdAndUpdate(
    //     draftOrder.deliverySlot,
    //     {
    //       reservedBy: null,
    //       status: "available",
    //     },
    //     { session },
    //   );
    // }

    const order = new Order({
      userId,
      items,
      total,
      address,
      deliverySlot: draftOrder.deliverySlot,
      paymentType: "Card",
      points: pointsTotal,
    });

    await order.save({ session });

    // Increment the users points total by the amount of the order
    await User.findByIdAndUpdate(
      userId,
      { $inc: { points: pointsTotal } },
      { session },
    );

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
      success_url: `${origin}/loading?next=dashboard&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: user.email,
      payment_intent_data: {
        metadata: {
          orderId: order._id.toString(),
          userId: userId.toString(),
          slotId: draftOrder.deliverySlot?.toString() || "",
        },
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

////#region Strip Webook to Verify Payment Actions and Give Order PDF
//export const stripeWebHook = async (req, res) => {
//  const stripeInstance = new Stripe(process.env.STRIPE_SK);
//  const sig = req.headers["stripe-signature"];
//  let event;
//
//  try {
//    event = stripeInstance.webhooks.constructEvent(
//      req.body,
//      sig,
//      process.env.STRIPE_WEBHOOK_SECRET,
//    );
//  } catch (error) {
//    return res.status(400).send(`Webhook Error: ${error.message}`);
//  }
//
//  //Handle Event and enqueue jobs for succeeded and failed payments
//  switch (event.type) {
//    case "payment_intent.succeeded": {
//      const data = event.data.object;
//
//      //NOTE: Here we will enqueue a job instead of updating DB directly as this was where we were having the issue
//
//      await paymentQueue.add(
//        {
//          type: "succeeded",
//          orderId: data.metadata.orderId,
//          userId: data.metadata.userId,
//          slotId: data.metadata.slotId,
//        },
//        { attempts: 3, backoff: 5000 },
//      );
//
//      break;
//    }
//
//    case "payment_intent.payment_failed": {
//      const data = event.data.object;
//
//      await paymentQueue.add(
//        {
//          type: "failed",
//          orderId: data.metadata.orderId,
//          userId: data.metadata.userId,
//          slotId: data.metadata.slotId,
//        },
//        { attempts: 3, backoff: 5000 },
//      );
//
//      break;
//    }
//
//    default:
//      console.log(`Unhandled event type ${event.type}`);
//      break;
//  }
//  return res.status(200).json({ received: true });
//};
////#endregion
//

//#region Get Orders For User -> api/v1/order/orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    // const orders = await Order.find({
    //   userId,
    //   $or: [{ paymentType: "COD" }, { isPaid: true }],
    // })
    //   .populate("items.product address")
    //   .sort({ createdAt: -1 });

    const orders = await Order.find({
      userId,
    })
      .populate("items.product address deliverySlot")
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

//#region Get User Order By Id -> api/v1/order/:orderId
export const getUserOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    const order = await Order.findById(orderId).populate(
      "items.product address deliverySlot",
    );

    return res
      .status(200)
      .json({ success: true, order, message: "Orders Fetched" });
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
