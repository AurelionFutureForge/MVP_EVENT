import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Menu, X } from "lucide-react"; // icons for mobile menu
import { NavLink } from "react-router-dom";

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const companyName = localStorage.getItem("adminCompanyName");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("admin_token");
        if (!token) {
          toast.error("Unauthorized! Please log in.");
          navigate("/admin/login");
          return;
        }

        const response = await axios.get(`${BASE_URL}/admin/events`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { companyName },
        });

        setEvents(Array.isArray(response.data) ? response.data : []);
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
    localStorage.removeItem("admin_token");
    localStorage.removeItem("adminCompanyName");
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-black to-gray-800 relative">
      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-64 bg-white text-black flex flex-col p-6 space-y-6 shadow-lg transform transition-transform duration-300 sm:static sm:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="text-2xl font-bold tracking-wide flex justify-between items-center">
          Stagyn.io
          <button
            onClick={() => setSidebarOpen(false)}
            className="sm:hidden p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
<nav className="flex flex-col gap-4 text-sm">
  <NavLink
    to="/"
    className={({ isActive }) =>
      `w-full px-4 py-2 rounded flex items-center gap-2 transition-colors focus:outline-none ${
        isActive ? "bg-red-600 text-white" : "hover:bg-red-600"
      }`
    }
  >
    Home
  </NavLink>
  <NavLink
    to="/create-event"
    className={({ isActive }) =>
      `w-full px-4 py-2 rounded flex items-center gap-2 transition-colors focus:outline-none ${
        isActive ? "bg-red-600 text-white" : "hover:bg-red-600 active:bg-red-600"
      }`
    }
  >
    Events
  </NavLink>
  <button
    onClick={handleLogout}
    className="hover:bg-red-600 w-full transition-colors px-4 py-2 rounded flex items-center gap-2 text-left focus:outline-none"
  >
    Logout
  </button>
</nav>


      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-black shadow px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <button className="sm:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold">Select Events</h2>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm sm:hidden"
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
                    onClick={() =>
                      handleEventClick(event._id, event.eventName)
                    }
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                      <h3 className="text-lg font-semibold truncate">
                        {event.eventName}
                      </h3>
                    </div>
                    <div className="p-4 space-y-2 text-sm text-gray-800">
                      <p>
                        📍{" "}
                        <span className="font-medium">{event.place}</span>
                      </p>
                      <p>
                        📅{" "}
                        <span className="font-medium">
                          {event.endDate &&
                          new Date(event.startDate).toLocaleDateString() !==
                            new Date(event.endDate).toLocaleDateString()
                            ? `${new Date(
                                event.startDate
                              ).toLocaleDateString()} - ${new Date(
                                event.endDate
                              ).toLocaleDateString()}`
                            : new Date(event.startDate).toLocaleDateString()}
                        </span>
                      </p>
                      <p>
                        ⏰{" "}
                        <span className="font-medium">{event.time}</span>
                      </p>
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
