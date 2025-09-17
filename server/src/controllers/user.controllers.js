import { User } from "../model/User.model.js";
import bcrypt from "bcryptjs";
import generateUserToken from "../utils/generateToken.utils.js";
import mongoose, { isValidObjectId } from "mongoose";
import { DraftOrder } from "../model/DraftOrder.model.js";
import { DeliverySlot } from "../model/DeliverySlot.model.js";
import { OAuth2Client } from "google-auth-library";
import { v7 as uuidv7 } from "uuid";

//#region CONSTANTS
const SALT_ROUNDS = 12;
const options = {
  httpOnly: true, // keep false for localhost socket io to work
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // Weeks time
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//#endregion;

//#region Google OAuth callback handler -> api/v1/user/google-login
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify credential
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;
    const password = uuidv7();

    const encryptedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: encryptedPassword, // generate a random one, since Google users won’t use it
        authProvider: "google", // Setting this so in the frontend we can specify which auth provider the user is using and logout correctly
      });
    }

    const { token } = await generateUserToken(user._id);

    return res
      .status(201)
      .cookie("token", token, options)
      .json({
        success: true,
        token,
        user: {
          name: user.name,
          email: user.email,
          authProvider: user.authProvider,
        },
        message: "Google login successful",
      });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};
//#endregion

//#region Register User -> api/v1/user/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //Temporary validation
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Fields" });
    }

    const exisitingUser = await User.findOne({ email });

    if (exisitingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const encryptedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: encryptedPassword,
    });

    const { token } = await generateUserToken(user._id);

    return res
      .status(201)
      .cookie("token", token, options)
      .json({
        success: true,
        user: { email: user.email, name: user.name },
        message: "User created",
      });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Login User -> api/v1/user/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Temporary validation
    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const doesPasswordMatch = await bcrypt.compare(password, user.password);

    if (!doesPasswordMatch) {
      return res.json({ success: false, message: "Incorrect Password" });
    }

    const { token } = await generateUserToken(user._id);

    console.log(token);

    return res
      .status(201)
      .cookie("token", token, options)
      .json({
        success: true,
        user: { email: user.email, name: user.name },
        message: "User Logged In",
      });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Logout User -> api/v1/user/logout
export const logoutUser = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    const draftOrder = await DraftOrder.findOneAndDelete(
      { userId },
      { session },
    );

    if (draftOrder?.deliverySlot) {
      await DeliverySlot.findByIdAndUpdate(
        draftOrder.deliverySlot,
        {
          reservedBy: null,
          status: "available",
        },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .clearCookie("token", options)
      .json({ success: true, message: "User logged out" });
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

//#region Is User Authenticated -> api/v1/user/user-authenticated
export const getUserAuthentication = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    const user = await User.findById(userId);

    if (!user) {
      res.json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user,
      message: "User Passed Authentication Check",
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
//#endregion

//#region Get User Points api/v1/user/points
export const getUserPoints = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!isValidObjectId(userId)) {
      return res.json({ success: false, message: "Invalid User Id" });
    }

    const user = await User.findById(userId).select("points");
  } catch (error) {}
};

//#endregion
