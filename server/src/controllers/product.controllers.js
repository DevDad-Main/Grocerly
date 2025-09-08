import { uploadBufferToCloudinary } from "../utils/cloudinary.utils.js";
import { isValidObjectId } from "mongoose";
import { Product } from "../model/Product.model.js";

//#region Add Product -> api/v1/product/add-product
export const addProduct = async (req, res) => {
  try {
    let { productData } = req.body;

    if (typeof productData === "string") {
      productData = JSON.parse(productData);
    }

    const images = req.files;
    const product = await Product.create({
      ...productData,
    });

    let imageUrls = await Promise.all(
      images.map(async (file) => {
        let result = await uploadBufferToCloudinary(
          file.buffer,
          product.folderId,
        );
        return result.secure_url;
      }),
    );

    product.image = imageUrls;
    await product.save();

    console.log(product);
    return res.status(201).json({ success: true, message: "Product Added" });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ status: error.status || 500, message: error.message });
  }
};
//#endregion

//#region Get Products -> api/v1/product/products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    if (!products) {
      return res.json({ success: false, message: "No Products Found" });
    }

    return res.status(200).json({
      success: true,
      products,
      message: "Products Fetched Successfully",
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Get Product By Id -> api/v1/product/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.json({ success: false, message: "Invalid Product Id" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.json({ success: false, message: "Product Not Found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Amend Product Stock -> api/v1/product/stock
export const amendProductStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;

    if (!isValidObjectId(id)) {
      return res.json({ success: false, message: "Invalid Product Id" });
    }

    await Product.findByIdAndUpdate(id, { $set: { inStock } });
    return res.status(200).json({ success: true, message: "Stock Updated" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion
