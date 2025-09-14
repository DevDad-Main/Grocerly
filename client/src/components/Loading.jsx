import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";

const Loading = () => {
  const { navigate, axios, clearCart } = useAppContext();
  const { search } = useLocation();
  const query = new URLSearchParams(search);

  const nextUrl = query.get("next"); // e.g. "orders"
  const sessionId = query.get("session_id"); // Stripe injects this

  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId) return;

      try {
        const { data } = await axios.post("/api/v1/stripe/confirm", {
          sessionId,
        });

        if (data.success) {
          setStatus("Payment successful! Redirecting...");
          setTimeout(() => navigate(`/${nextUrl || ""}`), 3000);
          clearCart();
        } else {
          setStatus("Payment failed. Redirecting...");
          setTimeout(() => navigate("/cart"), 3000);
        }
      } catch (err) {
        setStatus("Error confirming payment.");
        console.error(err);
      }
    };

    confirmPayment();
  }, [sessionId, nextUrl, navigate]);
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary"></div>
      <p className="mt-4 text-lg">{status}</p>
    </div>
  );
};

export default Loading;
