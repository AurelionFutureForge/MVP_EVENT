import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, email, eventName, qrCode } = location.state || {}; // Updated to use 'qrCode' from backend
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    console.log("Received Data in SuccessPage:", location.state); // Debugging
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300 p-6">
      {showConfetti && (
        <div className="fixed inset-0 flex items-center justify-center">
          <span className="text-6xl animate-bounce">🎉</span>
        </div>
      )}
      <div className="bg-white shadow-2xl rounded-xl p-8 text-center max-w-lg w-full">
        <h2 className="text-4xl font-extrabold text-green-700 mb-4">
          Registration Successfull for the Event,<span>{eventName}</span>
        </h2>
        <p className="text-gray-700 text-lg">
          Thank you for registering, <span className="font-semibold">{name || "Guest"}</span>.
        </p>
        <p className="text-gray-600 mt-2">
          A confirmation email with a QR code has been sent to <span className="font-semibold">{email || "your email"}</span>.
        </p>

        <div className="mt-6 flex justify-center">
          {qrCode ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode)}&size=200x200`}
              alt="QR Code"
              className="w-40 h-40 border rounded-lg shadow-lg"
            />
          ) : (
            <p className="text-red-500 font-bold">QR SENT TO YOUR MAIL</p>
          )}
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition-all duration-300 hover:cursor-pointer"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default SuccessPage; 