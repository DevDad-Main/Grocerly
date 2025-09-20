import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import deliveryRoutes from "./routes/deliverySlot.routes.js";
import draftOrderRoutes from "./routes/draftOrder.routes.js";
// import { stripeWebHook } from "./controllers/order.controllers.js";
import stripeRoutes from "./routes/stripe.routes.js";
import { rateLimit } from "express-rate-limit";
import hpp from "hpp";
import { errorHandler } from "./middleware/error.middleware.js";

//#region CONSTANTS
const app = express();
const allowedOrigins = process.env.CORS_ORIGIN.split(","); // split comma-separated string
//#endregion

//#region Middlewares
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

//Middleware to protect against HTTP Parameter Pollution
app.use(hpp());
// We will only use it for routes that start with /api
app.use("/api", limiter);
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["PATCH", "POST", "PUT", "GET", "DELETE", "OPTIONS"],
    allowedHeaders: [
      // Indicates the media type of the resource (e.g., application/json, text/html).
      "Content-Type",

      // Used to pass authentication credentials such as JWTs, API keys, or OAuth tokens.
      "Authorization",

      // Commonly used by AJAX requests (e.g., XMLHttpRequest) to identify them as being made via JavaScript.
      "X-Requested-With",

      // Custom header often used to persist device sessions or remember a user across requests.
      "device-remember-token",

      // Lists the HTTP headers that are permitted in requests; usually handled by the server,
      // but sometimes included here for compatibility.
      "Access-Control-Allow-Headers",

      // Identifies where the request originated (scheme, host, port) — used by CORS for validation.
      "Origin",

      // Tells the server which content types the client is willing to accept in the response (e.g., JSON, XML).
      "Accept",
    ],
    credentials: true,
    // optionsSuccessStatus: 200,
  }),
);

app.use(helmet());
app.use(compression());

app.use(express.json());
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);
//#endregion

//#region Endpoints
app.get("/", (req, res) => {
  res.send("Backend API up and running...");
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/delivery", deliveryRoutes);
app.use("/api/v1/draft-order", draftOrderRoutes);
app.use("/api/v1/stripe", stripeRoutes);
//#endregion

//#region Error Handler
app.use(errorHandler);
//#endregion

export { app };
