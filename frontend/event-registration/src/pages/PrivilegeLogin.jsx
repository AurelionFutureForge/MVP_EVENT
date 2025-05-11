import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function PrivilegeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(""); // Changed to text input value
  const [selectedEventId, setSelectedEventId] = useState("");
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Fetch events when companyName changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (!companyName) {
        setEvents([]);
        setSelectedEvent("");
        setSelectedEventId("");
        return;
      }
      try {
        const res = await axios.get(`${BASE_URL}/company/events`, {
          params: { companyName },
        });
        setEvents(res.data.events);
      } catch (err) {
        console.error("Error fetching events:", err);
        toast.error("Failed to fetch events for company.");
      }
    };

    fetchEvents();
  }, [companyName, BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!companyName || !selectedEvent || !selectedEventId) {
      toast.error("Please provide Company Name, select an Event, and enter Event Name.");
      return;
    }

    try {
      // Send login info + eventId
      const res = await axios.post(`${BASE_URL}/privilege/login`, {
        email,
        password,
        companyName,
        eventId: selectedEventId,
      });

      // Save auth data
      localStorage.setItem("privilegeToken", res.data.token);
      localStorage.setItem("privilegeName", res.data.privilegeName);
      localStorage.setItem("eventId", selectedEventId); // Save eventId for dashboard fetch

      toast.success("Login successful!");
      navigate("/privilege/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  const handleEventChange = (e) => {
    const eventName = e.target.value;
    setSelectedEvent(eventName);

    // Find eventId by eventName
    const event = events.find((event) => event.eventName === eventName);
    setSelectedEventId(event ? event._id : "");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Privilege Login</h2>

        {/* Company Name Input */}
        <input
          type="text"
          placeholder="Company Name"
          className="border p-2 w-full mb-3 rounded"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />

        {/* Event Name Input (Text Input instead of Dropdown) */}
        <input
          type="text"
          placeholder="Event Name"
          className="border p-2 w-full mb-3 rounded"
          value={selectedEvent}
          onChange={handleEventChange}
          list="eventList"
          required
        />
        {/* Event Suggestions */}
        <datalist id="eventList">
          {events.map((event) => (
            <option key={event._id} value={event.eventName} />
          ))}
        </datalist>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Login Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default PrivilegeLogin;
