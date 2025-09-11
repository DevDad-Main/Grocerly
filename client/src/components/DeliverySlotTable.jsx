import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const DeliverySlotTable = () => {
  const [slots, setSlots] = useState([]); // fetched from backend
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmedSlot, setConfirmedSlot] = useState(null);
  const [windowStart, setWindowStart] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const { navigate, axios, setDraftOrder, user } = useAppContext();

  const DAYS_TO_FETCH = 14; // get 2 weeks worth

  const isPastSlot = (slot) => {
    const [startTime] = slot.time.split(" - "); // e.g. "9:00"
    const [hours, minutes] = startTime.split(":").map(Number);

    const slotDate = new Date(slot.date);
    slotDate.setHours(hours, minutes, 0, 0);

    return slotDate < new Date();
  };

  const fetchSlots = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/delivery/slots?days=${DAYS_TO_FETCH}`,
      );

      if (data.success) {
        setSlots(data.deliverySlots);

        // setSlots(fetchedSlots);
        //
        // auto-restore confirmed slot
        const mySlot = data.deliverySlots.find(
          (s) =>
            s.status === "reserved" &&
            String(s.reservedBy?._id || s.reservedBy) === String(user?._id),
        );

        if (mySlot) {
          setConfirmedSlot(mySlot._id);
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Failed to fetch slots", err);
    }
  };

  // Group slots by day
  const groupedByDay = slots.reduce((acc, slot) => {
    const day = new Date(slot.date).toISOString().split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  const allDays = Object.keys(groupedByDay).map((day) => ({
    label: new Date(day).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    value: day,
  }));

  const currentDay = allDays[selectedDayIndex];

  const handleConfirm = async () => {
    if (!selectedSlot) return;

    try {
      // Reserve on backend
      const { data } = await axios.post("/api/v1/delivery/slots/reserve", {
        slotId: selectedSlot._id,
      });

      if (data.success) {
        setConfirmedSlot(selectedSlot._id);
        setSelectedSlot(null);
        setSlots((prev) =>
          prev.map((s) =>
            s._id === selectedSlot._id
              ? { ...s, status: "reserved", reservedBy: user._id }
              : s,
          ),
        );
        // fetchSlots();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
      console.error("Error reserving slot", err);
    }
  };

  const handleRemove = async () => {
    if (!confirmedSlot) return;

    try {
      const { data } = await axios.post("/api/v1/delivery/slots/release", {
        slotId: confirmedSlot,
      });

      if (data.success) {
        setConfirmedSlot(null);
        setSelectedSlot(null);
        toast.success(data.message);
        fetchSlots();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
      console.error("Error removing slot", err);
    }
  };

  const handleContinueShopping = async () => {
    try {
      const { data } = await axios.get("/api/v1/draft-order/order");
      if (data.success) {
        // Store draft order in context or state
        setDraftOrder(data.draftOrder);
        console.log("Draft order:", data.draftOrder);
        navigate("/products");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Failed to fetch draft order", error);
      navigate("/products");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [user?._id]); // re-run if user changes

  const canConfirm = selectedSlot && !confirmedSlot;
  const canRemove = confirmedSlot !== null;
  const hasConfirmedSlot = confirmedSlot !== null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-7 text-center">
        Choose a Delivery Slot
      </h2>

      {/* Mobile dropdown */}
      <div className="block sm:hidden mb-6">
        <select
          value={selectedDayIndex}
          onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
        >
          {allDays.map((day, index) => (
            <option key={day.value} value={index}>
              {day.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop 5-day row */}
      <div className="hidden sm:flex items-center justify-between mb-6">
        <button
          onClick={() => setWindowStart((i) => Math.max(0, i - 5))}
          disabled={windowStart === 0}
          className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40"
        >
          ← Prev
        </button>
        <div className="flex gap-3">
          {allDays.slice(windowStart, windowStart + 5).map((day, index) => {
            const actualIndex = windowStart + index;
            return (
              <button
                key={day.value}
                onClick={() => setSelectedDayIndex(actualIndex)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedDayIndex === actualIndex
                    ? "bg-primary text-white"
                    : "bg-gray-50 border border-gray-300 text-gray-700 hover:bg-primary/10"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() =>
            setWindowStart((i) => Math.min(allDays.length - 5, i + 5))
          }
          disabled={windowStart >= allDays.length - 5}
          className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      {/* Slots grouped by time */}
      {currentDay && groupedByDay[currentDay.value] ? (
        <>
          {Object.entries({
            Morning: ["9:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00"],
            Afternoon: [
              "12:00 - 13:00",
              "13:00 - 14:00",
              "14:00 - 15:00",
              "15:00 - 16:00",
            ],
            Evening: ["16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00"],
          }).map(([groupName, times]) => (
            <div key={groupName} className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-2">
                {groupName}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {times.map((time) => {
                  const slot = groupedByDay[currentDay.value].find(
                    (s) => s.time === time,
                  );

                  if (!slot) return null;

                  {
                    /* const isSelected = selectedSlot?._id === slot._id; */
                  }
                  {
                    /* const isConfirmed = confirmedSlot === slot._id; */
                  }

                  const isReserved = slot.status === "reserved";
                  const isMine =
                    isReserved &&
                    String(slot.reservedBy?._id || slot.reservedBy) ===
                      String(user?._id);
                  const isSelected = selectedSlot?._id === slot._id;
                  const isConfirmed = confirmedSlot === slot._id || isMine;
                  const past = isPastSlot(slot);

                  return (
                    <button
                      key={slot._id}
                      onClick={() => setSelectedSlot(slot)}
                      disabled={
                        past ||
                        (confirmedSlot && confirmedSlot !== slot._id) ||
                        (isReserved && !isMine)
                      }
                      className={`py-3 px-3 rounded-xl border text-sm font-medium transition shadow-sm
                      ${
                        past
                          ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed" // grey out past slots
                          : isMine
                            ? "bg-red-500 text-white border-red-600 cursor-pointer"
                            : isConfirmed
                              ? "bg-primary text-white border-primary"
                              : isSelected
                                ? "bg-primary text-white border-primary"
                                : isReserved
                                  ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                                  : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-primary/10"
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      ) : (
        <p>No slots available</p>
      )}
      {/* Actions */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handleRemove}
          disabled={!canRemove}
          className={`px-4 py-2 rounded-lg border text-red-500 hover:bg-red-50 ${
            !canRemove ? "opacity-40 cursor-not-allowed" : "border-red-400"
          }`}
        >
          Remove Slot
        </button>
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`ml-auto px-6 py-2 rounded-lg font-medium transition ${
            canConfirm
              ? "bg-primary text-white hover:bg-primary-dull"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Confirm Slot
        </button>
        <button
          onClick={handleContinueShopping}
          className={`${
            hasConfirmedSlot
              ? "ml-2 bg-primary p-2 text-white rounded-lg cursor-pointer"
              : "hidden"
          }`}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default DeliverySlotTable;
