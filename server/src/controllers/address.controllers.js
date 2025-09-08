import { isValidObjectId } from "mongoose";
import { Address } from "../model/Address.model.js";
import { User } from "../model/User.model.js";

//#region Add Address -> api/v1/address/add-address
export const addAddress = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { address } = req.body;

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    await Address.create({ ...address, userId });

    return res.status(201).json({ success: true, message: "Address Added" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Get User Address -> api/v1/address/get-addresses
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }
    const addresses = await Address.find({ userId });

    if (!addresses.length) {
      return res.json({ success: false, message: "No Addresses Found" });
    }

    return res
      .status(200)
      .json({ success: true, addresses, message: "Addresses Fetched" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};

//#endregion
