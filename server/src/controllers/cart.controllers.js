import { isValidObjectId } from "mongoose";
import { User } from "../model/User.model.js";
import { DraftOrder } from "../model/DraftOrder.model.js";

//#region Update User Cart -> api/v1/cart/update-cart
export const updateUserCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { cartItems } = req.body;

    console.log(cartItems);

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    await User.findByIdAndUpdate(userId, {
      cartItems,
    });

    return res.status(200).json({ success: true, message: "Cart Updated" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Get Users Cart
export const getUserCart = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    const user = await DraftOrder.findOne({ userId }).populate(
      "cartItems.product",
    );

    return res
      .status(200)
      .json({ success: true, user, message: "Cart Fetched" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Add Item To Cart
export const addItemToCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.json({
        success: false,
        message: "Invalid User Id or ProductId",
      });
    }

    //NOTE: product in cart → Increment It
    const updated = await DraftOrder.updateOne(
      { userId, "cartItems.product": productId },
      { $inc: { "cartItems.$.quantity": 1 } },
    );

    //NOTE: product not in cart → Add It
    if (updated.modifiedCount === 0) {
      await DraftOrder.updateOne(
        { userId },
        { $push: { cartItems: { product: productId, quantity: 1 } } },
      );
    }

    return res
      .status(200)
      .json({ success: true, message: "Product Added To Cart" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Remove Item From Cart
export const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.json({
        success: false,
        message: "Invalid User Id or ProductId",
      });
    }

    //NOTE: product in cart → Decrement Quantity by 1
    await DraftOrder.updateOne(
      { userId, "cartItems.product": productId },
      { $inc: { "cartItems.$.quantity": -1 } },
    );

    //NOTE: Once quantity hits 0 then we pull this product from our cartItems Array
    await DraftOrder.updateOne(
      { userId },
      { $pull: { cartItems: { product: productId, quantity: { $lte: 0 } } } },
    );
    return res
      .status(200)
      .json({ success: true, message: "Removed Product From Cart" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Remove From Cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;
    console.log(productId);

    if (!isValidObjectId(userId) || !isValidObjectId(productId)) {
      return res.json({
        success: false,
        message: "Invalid User Id or ProductId",
      });
    }

    await DraftOrder.updateOne(
      { userId },
      { $pull: { cartItems: { product: productId } } },
    );

    return res.status(200).json({ success: true, message: "Product Removed" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion
