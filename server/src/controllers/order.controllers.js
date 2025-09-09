import { isValidObjectId } from "mongoose";
import { Product } from "../model/Product.model.js";
import { Order } from "../model/Order.model.js";

const threePercentTax = 0.03;

//#region Place Order With COD -> api/v1/order/place-order
export const placeOrderWithCOD = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { address, items } = req.body;

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid Address or Items" });
    }

    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.productId);
      return (await acc) + product.offerPrice * item.quantity;
    });

    amount += Math.floor(amount * threePercentTax);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.status(201).json({ success: true, message: "Order Placed" });
  } catch (error) {
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
