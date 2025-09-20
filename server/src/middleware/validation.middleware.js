import { body, param, query, validationResult } from "express-validator";
import { AppError } from "./error.middleware.js";
import { User } from "../model/User.model.js";

//#region Validate Function
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    console.log(extractedErrors);
    throw new AppError("Validation failed", 400, extractedErrors);
  };
};
//#endregion

//#region Common validation chains
export const commonValidations = {
  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  objectId: (field) =>
    param(field).isMongoId().withMessage(`Invalid ${field} ID format`),

  email: body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email address already in use, Please choose another.");
      }
    })
    .normalizeEmail(),

  password: body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isStrongPassword({
      minLength: 6,
      maxLength: 12,
      minUppercase: 1,
      minNumbers: 3,
      minSymbols: 1,
    })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage(
      "Password must be 6–12 characters and include at least 1 uppercase, 3 numbers, and 1 symbol.",
    )
    .trim(),

  name: body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("Name can only contain letters and spaces"),

  price: body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  url: body("url").isURL().withMessage("Please provide a valid URL"),
};
//#endregion

//#region User validation chains
export const validateSignup = validate([
  commonValidations.name,
  commonValidations.email,
  commonValidations.password,
]);
//#endregion

//#region Sign In Validation
export const validateSignin = validate([
  commonValidations.email,
  body("password").notEmpty().withMessage("Password is required"),
]);
//#endregion

//#region Validate Password Change
export const validatePasswordChange = validate([
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage(
      "Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character",
    ),
]);
//#endregion
