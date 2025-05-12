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

        if (response.data && Array.isArray(response.data)) {
          setEvents(response.data);
        } else {
          setEvents([]);
        }
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch events. Please try again.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, [companyName, navigate, BASE_URL]);

  const handleEventClick = (eventId) => {
    localStorage.setItem("selectedEvent", eventId);
    navigate(`/admin/dashboard/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-xl rounded-2xl max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Select Events to View
        </h2>
        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event._id}
                  className="cursor-pointer border rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition transform hover:-translate-y-1 hover:scale-105 duration-300"
                  onClick={() => handleEventClick(event._id)}
                >
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                    <h3 className="text-xl font-semibold truncate">{event.eventName}</h3>
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    <p className="text-gray-700">
                      📍 <span className="font-medium">{event.place}</span>
                    </p>
                    <p className="text-gray-700">
                      📅 <span className="font-medium">{event.date}</span>
                    </p>
                    <p className="text-gray-700">
                      ⏰ <span className="font-medium">{event.time}</span>
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Roles</span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                        {event.eventRoles.length} roles
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-lg text-gray-600 col-span-full">
                No events found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventList;
