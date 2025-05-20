import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const companyName = localStorage.getItem("adminCompanyName");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("admin_token")
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

  const handleEventClick = (eventId, eventName) => {
    localStorage.setItem("selectedEvent", eventId);
    localStorage.setItem("eventName", eventName);
    navigate(`/admin/dashboard/${eventId}/${eventName}`);
  };

  const handleLogout = () => {
    // Example: Clear token or session
    localStorage.removeItem("admin_token");
    localStorage.removeItem("adminCompanyName"); // or any auth info
    window.location.href = "/"; // Redirect to home or login page
  };


  return (
    <div className="flex h-screen bg-gradient-to-r from-black to-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-black flex flex-col p-6 space-y-6 shadow-lg">
        <div className="text-2xl font-bold tracking-wide">EventMVP</div>
        <nav className="flex flex-col gap-4 text-sm">
          <a href="/" className="hover:bg-red-600 px-4 py-2 rounded transition flex items-center gap-2">
            Home
          </a>
          <a href="/create-event" className="hover:bg-red-600 px-4 py-2 rounded transition flex items-center gap-2">
            Events
          </a>
          <button
            onClick={handleLogout}
            className="hover:bg-red-600 px-4 py-2 hover:cursor-pointer rounded transition flex items-center gap-2 text-left"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-black shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Select Events</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Logout
          </button>
        </header>

        {/* Events Grid */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-center text-gray-200">Loading events...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {events.length > 0 ? (
                events.map((event) => (
                  <div
                    key={event._id}
                    className="cursor-pointer border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition transform hover:-translate-y-1 hover:scale-[1.01]"
                    onClick={() => handleEventClick(event._id, event.eventName)}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                      <h3 className="text-lg font-semibold truncate">{event.eventName}</h3>
                    </div>
                    <div className="p-4 space-y-2 text-sm text-gray-800">
                      <p>📍 <span className="font-medium">{event.place}</span></p>
                      <p>📅 <span className="font-medium">
                        {event.endDate &&
                          new Date(event.startDate).toLocaleDateString() !== new Date(event.endDate).toLocaleDateString()
                          ? `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`
                          : new Date(event.startDate).toLocaleDateString()}
                      </span></p>
                      <p>⏰ <span className="font-medium">{event.time}</span></p>
                      <div className="mt-2 flex justify-between text-xs text-gray-600">
                        <span>Roles</span>
                        <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                          {event.eventRoles.length}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 col-span-full">
                  No events found.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );

}

export default EventList;
