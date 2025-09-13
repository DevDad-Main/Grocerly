import mongoose from "mongoose";

const deliverySlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["available", "reserved", "booked"],
    default: "available",
  },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

deliverySlotSchema.index({ date: 1, time: 1 });

export const DeliverySlot = mongoose.model("DeliverySlot", deliverySlotSchema);
