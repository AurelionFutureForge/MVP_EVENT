import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const companyName = localStorage.getItem("adminCompany");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        if (!token) {
          toast.error("Unauthorized! Please log in.");
          navigate("/admin/login");
          return;
        }

        const response = await axios.get(`${BASE_URL}/admin/events`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { companyName },
        });

        setEvents(response.data.events);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch events. Please try again.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, [companyName, navigate, BASE_URL]);

  const handleEventClick = (eventId) => {
    localStorage.setItem("selectedEvent", eventId); // Save the selected event
    navigate(`/admin/dashboard/${eventId}`); // Redirect to event analytics page
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-xl rounded-2xl">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">
          Select Event for Analytics
        </h2>
        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event._id}
                  className="cursor-pointer border p-4 rounded-xl hover:bg-blue-50 transition"
                  onClick={() => handleEventClick(event._id)}
                >
                  <h3 className="text-xl font-semibold text-gray-700">{event.name}</h3>
                  <p className="text-gray-500">{event.place}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-lg text-gray-600">No events found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventList;
