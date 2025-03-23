import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Destructure dynamic event details
  const { name, email, qrCode, eventDate, eventTime, eventAddress, eventLink } = location.state || {}; 
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    console.log("Received Data in SuccessPage:", location.state); // Debugging
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-6">
      
      {showConfetti && (
        <div className="fixed inset-0 flex items-center justify-center">
          <span className="text-6xl animate-bounce">🎉</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden transform transition duration-500 hover:scale-105">
        
        {/* Event Banner */}
        <img 
          src="https://via.placeholder.com/600x300" 
          alt="Event Banner"
          className="w-full h-60 object-cover"
        />

        {/* Card Content */}
        <div className="p-6">
          
          <h2 className="text-3xl font-bold text-blue-700 text-center mb-4">
            Registration Successful! 🎉
          </h2>

          <p className="text-gray-600 text-lg text-center">
            Thank you for registering, <span className="font-semibold">{name || "Guest"}</span>.
          </p>

          <p className="text-gray-500 mt-2 text-center">
            A confirmation email with your QR code has been sent to <span className="font-semibold">{email || "your email"}</span>.
          </p>

          {/* Dynamic Event Details in the Card */}
          <div className="mt-6">
            <p className="text-gray-700">
              <strong>📅 Event Date:</strong> {eventDate || "TBD"}
            </p>
            <p className="text-gray-700">
              <strong>⏰ Time:</strong> {eventTime || "TBD"}
            </p>
            <p className="text-gray-700">
              <strong>📍 Address:</strong> {eventAddress || "TBD"}
            </p>
            {eventLink && (
              <a 
                href={eventLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 underline mt-2 inline-block">
                View Event Details
              </a>
            )}
          </div>

          {/* QR Code */}
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

          {/* Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition-all duration-300"
            >
              Go to Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SuccessPage;
