import React, { useState } from "react";
import DeliverySlotTable from "../components/DeliverySlotTable";

const DeliveryPage = () => {
  const [booked, setBooked] = useState([]);

  // This handles both adding and removing slots
  const handleConfirmSlot = (slot, action) => {
    if (action === "remove") {
      setBooked((prev) => prev.filter((s) => s !== slot));
    } else if (slot) {
      setBooked((prev) => [...prev, slot]);
    }
  };

  const handleConfirm = async (slot) => {
    console.log("User picked:", slot);

    // Example: save slot to DB
    // await axios.post("/api/v1/delivery/slot", { slot });

    // Then mark it booked locally
    setBooked([...booked, slot]);
  };

  return (
    <div className="p-8">
      <DeliverySlotTable bookedSlots={booked} onConfirm={handleConfirmSlot} />
    </div>
  );
};

export default DeliveryPage;
