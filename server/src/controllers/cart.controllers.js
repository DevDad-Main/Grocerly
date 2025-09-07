import { isValidObjectId } from "mongoose";
import { User } from "../model/User.model.js";

//#region Update User Cart -> api/v1/cart/update-cart
export const updateUserCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { cartItems } = req.body;

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    await User.findByIdAndUpdate(userId, { $set: { cartItems } });

    return res.status(200).json({ success: true, message: "Cart Updated" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion
