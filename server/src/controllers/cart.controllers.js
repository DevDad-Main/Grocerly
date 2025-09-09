import { isValidObjectId } from "mongoose";
import { User } from "../model/User.model.js";
import { Product } from "../model/Product.model.js";

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
    const updated = await User.updateOne(
      { _id: userId, "cartItems.product": productId },
      { $inc: { "cartItems.$.quantity": 1 } },
    );

    //NOTE: product not in cart → Add It
    if (updated.modifiedCount === 0) {
      await User.updateOne(
        { _id: userId },
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
