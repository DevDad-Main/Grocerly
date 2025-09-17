import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Gift, Lock } from "lucide-react";
import toast from "react-hot-toast";

const Rewards = () => {
  const { axios, user } = useAppContext();
  const [userPoints, setUserPoints] = useState(0);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    // Fetch user points from backend
    const fetchUserPoints = async () => {
      try {
        const { data } = await axios.get("/api/v1/user/points");
        if (data.success) {
          setUserPoints(data.points);
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch user points");
      }
    };

    // Example rewards – in real app, fetch from backend
    setRewards([
      {
        id: 1,
        title: "10% Off Coupon",
        cost: 100,
        description: "Save 10% on your next purchase",
      },
      {
        id: 2,
        title: "Free Delivery",
        cost: 200,
        description: "Enjoy free delivery on one order",
      },
      {
        id: 3,
        title: "15% Off Coupon",
        cost: 300,
        description: "Save 15% on any purchase",
      },
      {
        id: 4,
        title: "20% Off Coupon",
        cost: 500,
        description: "Big savings on your order!",
      },
    ]);

    if (user) fetchUserPoints();
  }, [user, axios]);

  const redeemReward = async (reward) => {
    if (userPoints < reward.cost) {
      toast.error("Not enough points to redeem this reward.");
      return;
    }

    try {
      const { data } = await axios.post("/api/v1/rewards/redeem", {
        rewardId: reward.id,
      });
      if (data.success) {
        toast.success(`Redeemed: ${reward.title}`);
        setUserPoints((prev) => prev - reward.cost);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to redeem reward");
    }
  };

  return (
    <div className="mt-20 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Rewards Center 🎉</h1>
        <p className="mt-2">
          Earn points with every order and redeem exciting rewards.
        </p>
        <div className="mt-4 text-xl font-semibold">
          Your Points: <span className="text-yellow-300">{userPoints}</span>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const canRedeem = userPoints >= reward.cost;
          return (
            <div
              key={reward.id}
              className="bg-white border rounded-2xl shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">{reward.title}</h2>
                  {canRedeem ? (
                    <Gift className="text-green-600" size={22} />
                  ) : (
                    <Lock className="text-gray-400" size={22} />
                  )}
                </div>
                <p className="text-gray-500 text-sm">{reward.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="font-bold text-gray-700">
                  {reward.cost} pts
                </span>
                <button
                  onClick={() => redeemReward(reward)}
                  disabled={!canRedeem}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                    canRedeem
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {canRedeem ? "Redeem" : "Locked"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Rewards;
