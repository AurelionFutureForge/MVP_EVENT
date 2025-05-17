import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    const verifyAndRegister = async () => {
      const txnId = new URLSearchParams(window.location.search).get("transactionId");
      const formData = JSON.parse(localStorage.getItem("formData"));
      const eventID = localStorage.getItem("eventID");

      if (!txnId || !formData || !eventID) {
        toast.error("Missing payment or registration data.");
        navigate("/");
        return;
      }

      const amount = formData.amount;
      const platformFee = amount * 0.025;
      const userAmount = amount - platformFee;

      setBreakdown({
        amount: userAmount,
        platformFee,
        total: amount
      });

      try {
        const verifyRes = await axios.post(`${BASE_URL}/api/phonepe/verify-payment`, {
          transactionId: txnId
        });

        if (verifyRes.data.success) {
          await axios.post(`${BASE_URL}/users/register`, {
            ...formData,
            eventID,
            transactionId: txnId
          });

          toast.success("Registration successful!");
          localStorage.removeItem("formData");
          localStorage.removeItem("eventID");
          navigate(`/success/${eventID}`);
        } else {
          toast.error("Payment verification failed.");
          navigate("/");
        }
      } catch (error) {
        toast.error("Error during registration.");
        navigate("/");
      }
    };

    verifyAndRegister();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto text-center text-lg">
      <h2 className="mb-4">Verifying Payment...</h2>

      {breakdown && (
        <div className="text-left border rounded-md p-4 shadow-sm">
          <div className="flex justify-between py-1">
            <span>Amount</span>
            <span>₹{breakdown.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Platform Fee (2.5%)</span>
            <span>₹{breakdown.platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t mt-2 pt-2">
            <span>Total Amount</span>
            <span>₹{breakdown.total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentSuccess;
