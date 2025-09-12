import { DeliverySlot } from "../model/DeliverySlot.model.js"; // adjust path

// Define your delivery slot times
const slotGroups = {
  Morning: ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00"],
  Afternoon: [
    "12:00 - 13:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
  ],
  Evening: ["16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00"],
};

// Function to generate slots for the next N days
// Needs to be 15 due to how the for loop executes, it will stop at 14 days
export async function generateSlots(daysAhead = 15) {
  const now = new Date();

  for (let i = 0; i < daysAhead; i++) {
    const day = new Date(now);
    // day.setHours(0, 0, 0, 0); // normalize to midnight
    day.setDate(day.getDate() + i);

    // Loop through slotGroups
    for (const [, times] of Object.entries(slotGroups)) {
      for (const time of times) {
        try {
          // Randomly decide if this slot should be reserved
          const isReserved = Math.random() < 0.3; // 30% chance to be reserved
          const status = isReserved ? "reserved" : "available";
          const reservedBy = isReserved ? "68c08927d9f7c8f54cdf37c8" : null;

          // Use upsert so duplicates can't slip through
          await DeliverySlot.updateOne(
            { date: day, time }, // filter by unique fields
            { $setOnInsert: { status, reservedBy } },
            { upsert: true }, // create if not exists
          );
        } catch (err) {
          console.error(`Failed inserting ${day} ${time}`, err.message);
        }
      }
    }
  }
  console.log("Completed adding 14 days of delivery slots");
}

// // Run the script
// generateSlots().catch(console.error);
