import "dotenv/config";
import { app } from "./app.js";
import connectDB from "./db/mongooseDB.js";
import { generateSlots } from "./utils/generateDeliverySlots.utils.js";

//#region CONSTANTS
const PORT = process.env.PORT || 4000;
//#endregion

//#region MONGO CONNECTION
connectDB()
  .then(
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
      // generateSlots();
    }),
  )
  .catch((err) => {
    console.log(`MongoDB Connection Error`, err);
  });
//#endregion
