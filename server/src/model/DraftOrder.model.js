import mongoose from "mongoose";

const draftOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cartItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number },
    },
  ],
  deliverySlot: { type: mongoose.Schema.Types.ObjectId, ref: "DeliverySlot" },
});

export const DraftOrder = mongoose.model("DraftOrder", draftOrderSchema);
