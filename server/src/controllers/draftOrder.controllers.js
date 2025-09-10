import { DraftOrder } from "../model/DraftOrder.model.js";
import { isValidObjectId } from "mongoose";

//#region Get Draft Order For User
export const getDraftOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    const draftOrder = await DraftOrder.findOne({ userId }).populate(
      "deliverySlot cartItems.product",
    );
    // .populate("cartItems.product");

    if (!draftOrder) {
      return res.status(404).json({
        success: false,
        message: "No draft order found",
      });
    }

    return res.status(200).json({
      success: true,
      draftOrder,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
//#endregion
