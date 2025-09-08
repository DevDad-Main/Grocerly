import jwt from "jsonwebtoken";
import { User } from "../model/User.model.js";

const isAdminAuthenticated = async (req, res, next) => {
  const { adminToken } = req.cookies;
  if (!adminToken) {
    return res.json({ success: false, message: "Not Authorized" });
  }

  try {
    const decodedToken = jwt.verify(adminToken, process.env.JWT_SECRET);

    if (decodedToken.email === process.env.ADMIN_EMAIL) {
      next();
    } else {
      return res.json({ success: false, message: "Not Authorized" });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default isAdminAuthenticated;
