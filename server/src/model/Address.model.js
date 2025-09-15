import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: {
      type: String, // Saving it as a string as multiple addresses can have a mix of numbers and letters
      required: true,
    },
    country: { type: String, required: true },
    phone: { type: Number, required: true }, // leaving this here as at the minute i dont like the idea of it being on the user, may change this later
  },
  { timestamps: true },
);

export const Address = mongoose.model("Address", addressSchema);
