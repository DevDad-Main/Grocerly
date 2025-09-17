import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    points: { type: Number, default: 0 },
  },
  { timestamps: true, minimize: false },
);

export const User = mongoose.model("User", userSchema);
