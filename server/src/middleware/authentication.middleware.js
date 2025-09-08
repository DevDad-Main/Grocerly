import jwt from "jsonwebtoken";
import { User } from "../model/User.model.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } =
      req.cookies || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.json({ success: false, message: "Not Authorized" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
