import mongoose, { isValidObjectId } from "mongoose";
import { DeliverySlot } from "../model/DeliverySlot.model.js";
import { Order } from "../model/Order.model.js";
import { DraftOrder } from "../model/DraftOrder.model.js";

//#region Get All Delivery Slots -> api/v1/delivery/slots
export const getDeliverySlots = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 5; // default 5 days

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);

    const deliverySlots = await DeliverySlot.find({
      date: { $gte: today, $lt: endDate },
    }).sort({ date: 1, time: 1 });

    return res.status(200).json({
      success: true,
      deliverySlots,
      message: `Delivery slots for next ${days} days fetched`,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Reserve Delvivery Slot -> api/v1/delivery/slots/reserve
export const reserveDeliverySlot = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { slotId } = req.body;
    const userId = req.user?._id;

    if (!isValidObjectId(slotId) || !isValidObjectId(userId)) {
      return res.json({
        success: false,
        message: "Invalid Slot Id or User Id",
      });
    }

    const deliverySlot = await DeliverySlot.findByIdAndUpdate(slotId, {
      reservedBy: userId,
      status: "reserved",
    }).session(session);

    const draftOrder = new DraftOrder({
      userId,
      deliverySlot,
    });

    await draftOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, message: "Slot Reserved" });
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
