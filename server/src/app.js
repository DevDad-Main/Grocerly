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
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Headers",
      // "Access-Control-Allow-Origin",
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

export { app };
