import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaClock, FaMapMarkerAlt, FaHome } from "react-icons/fa";

function SuccessPage() {
  const navigate = useNavigate();
  const { eventID } = useParams();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [event, setEvent] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);

    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/${eventID}`);
        setEvent(response.data); // Adjust if your API returns { event: {...} }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      }
    };

    fetchEvent();

    return () => clearTimeout(timer);
  }, [eventID, BASE_URL]);

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading event details...</p>
      </div>
    );
  }

  const sameDate =
    new Date(event.startDate).toLocaleDateString() ===
    new Date(event.endDate).toLocaleDateString();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-6">
      {/* Main Card */}
      <div className="bg-white shadow-2xl rounded-2xl p-10 text-center max-w-lg w-full transform transition duration-500 hover:scale-105">
        {/* ✅ Success Header with Icon */}
        <div className="flex items-center justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-5xl mr-2" />
          <h2 className="text-4xl font-extrabold text-green-700">
            Registration Successful for the event {event.eventName}
          </h2>
        </div>

        {/* Event Info */}
        <div className="text-gray-700 mb-8">
          <p className="flex items-center justify-center mt-2">
            <FaClock className="mr-2 text-yellow-500" />
            <span>
              <span className="font-semibold">Date:</span>{" "}
              {sameDate
                ? new Date(event.startDate).toLocaleDateString()
                : `${new Date(event.startDate).toLocaleDateString()} - ${new Date(
                    event.endDate
                  ).toLocaleDateString()}`}{" "}
              | {event.time} (IST)
            </span>
          </p>
          <p className="flex items-center justify-center mt-2">
            <FaMapMarkerAlt className="mr-2 text-pink-500" /> {event.place}
          </p>
        </div>

        {/* ✅ Navigation Button */}
        <button
          onClick={() => navigate(`/register/${eventID}`)}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full flex items-center justify-center transition duration-300"
          aria-label="Go to event registration page"
        >
          <FaHome className="mr-2" />
          Register Again
        </button>
      </div>
    </div>
  );
}

export default SuccessPage;
