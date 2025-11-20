import "dotenv/config";
import { app } from "./app.js";
import connectDB from "./db/mongooseDB.js";
import { generateSlots } from "./utils/generateDeliverySlots.utils.js";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
// import { slotQueue } from "./queues/deliverySlots.queue.js";

//#region CONSTANTS
const PORT = process.env.PORT || 4000;
//#endregion

//#region Bull Board
// NOTE: Initialize the express adapter and define a path for us to access the ui
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [],
  // queues: [new BullMQAdapter(slotQueue)],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());
//#endregion

//#region MONGO CONNECTION
connectDB()
  .then(
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
      console.log(
        `Bull Board available at: http://localhost:${PORT}/admin/queues`,
      );
      // generateSlots();
    }),
  )
  .catch((err) => {
    console.log(`MongoDB Connection Error`, err);
  });
//#endregion
