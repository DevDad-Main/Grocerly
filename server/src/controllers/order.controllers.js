import mongoose, { isValidObjectId } from "mongoose";
import { Product } from "../model/Product.model.js";
import { Order } from "../model/Order.model.js";
import { DraftOrder } from "../model/DraftOrder.model.js";

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
