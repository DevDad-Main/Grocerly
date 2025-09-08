import { User } from "../model/User.model.js";
import bcrypt from "bcryptjs";
import generateUserToken from "../utils/generateToken.utils.js";

//#region CONSTANTS
const SALT_ROUNDS = 12;
const options = {
  httpOnly: true, // keep false for localhost socket io to work
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // Weeks time
};
//#endregion;

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
  try {
    return res
      .status(200)
      .clearCookie("token", options)
      .json({ success: true, message: "User logged out" });
  } catch (error) {
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

    return res
      .status(200)
      .json({
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
