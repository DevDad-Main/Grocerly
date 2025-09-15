import mongoose from "mongoose";
import { v7 as uuidv7 } from "uuid";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: {
      type: String,
      enum: [
        "Vegetables",
        "Fruits",
        "Drinks",
        "Instant",
        "Dairy",
        "Bakery",
        "Grains",
      ],
      required: true,
    },
    folderId: {
      type: String,
      unique: true,
    },
    inStock: { type: Boolean, default: true },
    points: { type: Number, default: 5 },
  },
  { timestamps: true },
);

//#region Initialize FolderId Before Saving New Product
productSchema.pre("save", function (next) {
  if (!this.folderId) {
    this.folderId = uuidv7();
  }
  console.log(this.folderId);
  next();
});
//#endregion

export const Product = mongoose.model("Product", productSchema);
