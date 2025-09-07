import { User } from "../models/User.models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;
const options = {
  httpOnly: true, // keep false for localhost socket io to work
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // Weeks time
};

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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

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
