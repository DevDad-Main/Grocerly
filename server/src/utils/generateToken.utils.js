import jwt from "jsonwebtoken";
import { User } from "../model/User.model.js";

//#region Generate Token
export default async function generateUserToken(userId) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User does not exist." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return { token };
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message:
        "Something went wrong while generating access and refresh tokens",
    });
  }
}
//#endregion
