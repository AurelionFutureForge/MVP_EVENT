import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

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

      try {
        const verifyRes = await axios.post(`${BASE_URL}/api/phonepe/verify-payment`, {
          transactionId: txnId
        });

        if (verifyRes.data.success) {
          // Proceed with registration using saved data
          await axios.post(`${BASE_URL}/users/register`, {
            ...formData,         // spread here ✅
            eventID,
            transactionId: txnId 
          });

          toast.success("Registration successful!");
          localStorage.removeItem("formData");
          localStorage.removeItem("eventID");
          navigate("/success/:eventID");
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

  return <div className="p-6 text-center text-lg">Verifying Payment...</div>;
}

export default PaymentSuccess;
