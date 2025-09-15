import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    paymentType: { type: String, enum: ["COD", "Card"], required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    isPaid: { type: Boolean, default: false, required: true },
    deliverySlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliverySlot",
      required: true,
    },
    points: { type: Number, default: 0, required: true },
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
