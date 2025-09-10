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
export async function generateSlots(daysAhead = 14) {
  const now = new Date();

  for (let i = 0; i < daysAhead; i++) {
    const day = new Date(now);
    // day.setHours(0, 0, 0, 0); // normalize to midnight
    day.setDate(day.getDate() + i);

    // Loop through slotGroups
    for (const [, times] of Object.entries(slotGroups)) {
      for (const time of times) {
        try {
          // Use upsert so duplicates can't slip through
          await DeliverySlot.updateOne(
            { date: day, time }, // filter by unique fields
            { $setOnInsert: { status: "available", reservedBy: null } },
            { upsert: true }, // create if not exists
          );
        } catch (err) {
          console.error(`Failed inserting ${day} ${time}`, err.message);
        }
      }
    }
  }
}

// // Run the script
// generateSlots().catch(console.error);
