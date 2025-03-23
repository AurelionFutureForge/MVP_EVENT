import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, email, eventName, qrCode } = location.state || {};
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300 p-6">
      <div className="bg-white shadow-2xl rounded-xl p-8 text-center max-w-lg w-full">
        <h2 className="text-4xl font-extrabold text-green-700 mb-4">
          Registration Successful for {eventName}
        </h2>
        <p className="text-lg">Thank you, {name}!</p>
        <p>A confirmation email has been sent to {email}.</p>

        <div className="mt-6">
          <img 
            src={qrCode.startsWith("data:image") ? qrCode : `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode)}&size=200x200`}
            alt="QR Code"
            className="w-40 h-40 border rounded-lg shadow-lg"
          />
        </div>

        <button onClick={() => navigate("/")} className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg">
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default SuccessPage;
