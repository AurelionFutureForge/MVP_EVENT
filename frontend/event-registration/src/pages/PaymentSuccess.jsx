import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [breakdown, setBreakdown] = useState(null);
  const [formData, setFormData] = useState(null);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    const verifyAndRegister = async () => {
      const txnId = new URLSearchParams(window.location.search).get("transactionId");
      const storedFormData = JSON.parse(localStorage.getItem("formData"));
      const eventID = localStorage.getItem("eventID");

      if (!txnId || !storedFormData || !eventID) {
        toast.error("Missing payment or registration data.");
        navigate("/");
        return;
      }

      setTransactionId(txnId);
      setFormData(storedFormData);

      const amount = storedFormData.amount;
      const platformFee = amount * 0.025;
      const userAmount = amount - platformFee;

      setBreakdown({
        amount: userAmount,
        platformFee,
        total: amount
      });

      try {
        // Check for existing registration
        const checkEmailRes = await axios.post(`${BASE_URL}/users/check-email`, {
          email: storedFormData.email,
          eventId: eventID
        });

        if (checkEmailRes.data.exists) {
          toast.error("You are already registered for this event.");
          navigate("/");
          return;
        }

        // Proceed with registration
        await axios.post(`${BASE_URL}/users/register`, {
          ...storedFormData,
          eventID,
          transactionId: txnId
        });

        toast.success("Registration successful!");
        localStorage.removeItem("formData");
        localStorage.removeItem("eventID");

      } catch (error) {
        toast.error("Error during registration.");
        console.error(error);
        navigate("/");
      }
    };

    verifyAndRegister();
  }, []);

  const generatePDF = () => {
    const element = document.getElementById("invoice");
    import("html2pdf.js").then(html2pdf => {
      html2pdf.default().from(element).save("invoice.pdf");
    });
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-center text-lg">
      <h2 className="mb-4 text-2xl font-semibold">Verifying Payment...</h2>

      {breakdown && (
        <div className="text-left border rounded-md p-4 shadow-sm mb-6">
          <h3 className="text-xl font-semibold mb-2">Payment Breakdown</h3>
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

      {formData && (
        <div id="invoice" className="text-left border p-4 rounded shadow-md">
          <h3 className="text-xl font-bold mb-3">Invoice</h3>
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Contact:</strong> {formData.contact}</p>
          <p><strong>Role:</strong> {formData.role}</p>
          <p><strong>Transaction ID:</strong> {transactionId}</p>
          <p><strong>Total Paid:</strong> ₹{formData.amount}</p>
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      )}

      {formData && (
        <button
          className="mt-5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={generatePDF}
        >
          Download Invoice as PDF
        </button>
      )}
    </div>
  );
}

export default PaymentSuccess;
