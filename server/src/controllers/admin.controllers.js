import jwt from "jsonwebtoken";

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
