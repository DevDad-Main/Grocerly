import jwt from "jsonwebtoken";
import {
  deleteImageFromCloudinary,
  getPublicIdFromUrl,
  uploadBufferToCloudinary,
} from "../utils/cloudinary.utils.js";
import { Product } from "../model/Product.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../model/User.model.js";
import { Order } from "../model/Order.model.js";

//#region CONSTANTS
const options = {
  httpOnly: true, // keep false for localhost socket io to work
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // Weeks time
};
//#endregion;

//#region admin login -> api/v1/admin/login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (
      password === process.env.ADMIN_PASSWORD &&
      email === process.env.ADMIN_EMAIL
    ) {
      const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      return res
        .status(201)
        .cookie("adminToken", token, options)
        .json({
          success: true,
          user: { email: email },
          message: "admin user logged in",
        });
    } else {
      return res.json({ success: false, message: "invalid admin credentials" });
    }
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};

//#endregion

//#region Logout Admin -> api/v1/admin/logout
export const adminLogout = async (req, res) => {
  try {
    return res
      .status(200)
      .clearCookie("adminToken", options)
      .json({ success: true, message: "Admin Logged Out" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Admin Delete Product -> api/v1/admin/delete-product/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product Id" });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product Not Found" });
    }
    console.log(product);
    return res.status(204).json({ success: true, message: "Product Deleted" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Admin Update Product -> api/v1/admin/product-update/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Parse productData and existingImages from req.body
    const productData = JSON.parse(req.body.productData);
    const existingImages = JSON.parse(req.body.existingImages || "[]");
    const images = req.files || [];

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product Id" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const currentImages = product.image;
    const imagesToDelete = currentImages.filter(
      (img) => !existingImages.includes(img),
    );

    for (let url of imagesToDelete) {
      const publicId = getPublicIdFromUrl(url);
      console.log(publicId);
      await deleteImageFromCloudinary(publicId);
    }

    const newImageUrls = await Promise.all(
      images.map(async (file) => {
        const result = await uploadBufferToCloudinary(
          file.buffer,
          product.folderId,
        );
        return result.secure_url;
      }),
    );

    // Merge existing images that were not replaced with new uploaded images
    product.image = [...existingImages, ...newImageUrls];

    // Update other fields
    product.name = productData.name ?? product.name;
    product.description = productData.description ?? product.description;
    product.category = productData.category ?? product.category;
    product.price = productData.price ?? product.price;
    product.offerPrice = productData.offerPrice ?? product.offerPrice;
    product.points = productData.points ?? product.points;

    await product.save();

    return res.status(200).json({ success: true, message: "Product Updated" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Get Product By Id -> api/v1/admin/product/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product Id" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, product, message: "Product Fetched" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};

//#endregion

//#region Is Admin Authenticated -> api/v1/admin/admin-authenticated
export const getAdminAuthentication = (req, res, next) => {
  try {
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Get Admin Dashboard -> api/v1/admin/dashboard
export const getDashboard = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const orders = await Order.find({}).populate("userId").session(session);
    const customers = await User.find({}).select("_id").session(session);

    const filteredOrders = orders.filter((order) => order.status !== "pending");

    let revenue = filteredOrders
      .reduce((previous, current) => {
        return previous + current.total;
      }, 0)
      .toFixed(2);

    const formattedRevenue = new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(revenue);

    const pendingOrders = orders.filter((order) => order.status === "pending");

    console.log(revenue);
    console.log(pendingOrders);
    console.log(formattedRevenue);
    console.log(orders, customers);

    return res.status(200).json({
      success: true,
      orders,
      customers,
      formattedRevenue,
      pendingOrders,
      mesage: "Admin Data Fetched",
    });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ status: error.status || 500, message: error.message });
  }
};
//#endregion
