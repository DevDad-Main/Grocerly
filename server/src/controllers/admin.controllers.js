import generateUserToken from "../utils/generateToken.utils";
import jwt from "jsonwebtoken";

//#region CONSTANTS
const options = {
  httpOnly: true, // keep false for localhost socket io to work
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // Weeks time
};
//#endregion;

//#region Admin Login -> api/v1/admin/login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (
      password === process.env.ADMIN_PASSWORD &&
      email === process.env.ADMIN_EMAIL
    ) {
      const { token } = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      return res
        .status(201)
        .cookie("token", token, options)
        .json({
          success: true,
          user: { email: user.email, name: user.name },
          message: "Admin User Logged in",
        });
    } else {
      return res.json({ success: false, message: "Invalid Admin Credentials" });
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
      .json({ success: true, message: "User logged out" });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};
////#endregion
