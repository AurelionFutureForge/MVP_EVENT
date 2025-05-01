import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EventCreation() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    companyName: '',
    eventName: '',
    place: '',
    time: '',
    date: '',
    eventRoles: [], // Array to hold selected roles
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Fetch existing events when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/get-events`);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    if (e.target.name === "eventRoles") {
      const role = e.target.value;
      setEventDetails((prevDetails) => {
        // Toggle role selection in the eventRoles array
        const updatedRoles = prevDetails.eventRoles.includes(role)
          ? prevDetails.eventRoles.filter((r) => r !== role) // Remove role if already selected
          : [...prevDetails.eventRoles, role]; // Add role if not selected
        return { ...prevDetails, eventRoles: updatedRoles };
      });
    } else {
      setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
    }
  };
  

  // Validate input fields
  const validateForm = () => {
    if (!eventDetails.companyName || !eventDetails.eventName || !eventDetails.place || !eventDetails.time || !eventDetails.date || eventDetails.eventRoles.length === 0) {
      setError("All fields are required, including at least one role.");
      return false;
    }
    setError(""); // Clear error if valid
    return true;
  };

  // Handle form submission for new event
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log("Sending Data to Backend:", eventDetails); // Debugging line
      const response = await axios.post(`${BASE_URL}/events/create-event`, {
        ...eventDetails,
        date: new Date(eventDetails.date).toISOString(), // Ensure correct format
      });

      if (response.status === 201) {
        setEvents([...events, response.data.event]);
        setShowForm(false);
        setEventDetails({ companyName: '', eventName: '', place: '', time: '', date: '', eventRoles: [] });
      }
    } catch (error) {
      console.error("Error creating event:", error.response?.data || error.message);
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to registration page with event details
  const handleRegister = (event) => {
    navigate(`/register/${event.companyName}/${event.eventName}`, {
      state: {
        place: event.place,
        time: event.time,
        date: event.date,
        eventRoles:event.eventRoles,
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-500 to-purple-600">
      {/* Navbar */}
      <nav className="bg-blue-600 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center text-white">
          <h1 className="text-2xl font-bold">EventMVP</h1>
          <div className="hidden md:flex space-x-6">
            <a href="/" className="hover:text-gray-200">Home</a>
            <a href="/register" className="hover:text-gray-200">Register</a>
            <a href="/admin/login" className="hover:text-gray-200">Admin</a>
          </div>
        </div>
      </nav>

      {/* Events Section */}
      <section className="container mx-auto text-center p-6 md:p-12">
        <h3 className="text-3xl font-semibold text-white mb-4">Your Events</h3>

        {/* Display Existing Events */}
        <div className="space-y-6">
          {events.length === 0 ? (
            <p className="text-white">No events created yet. Add a new event!</p>
          ) : (
            events.map((event) => (
              <div key={event._id} className="bg-white p-6 rounded-lg shadow-lg">
                <h4 className="font-semibold text-xl">{event.eventName}</h4>
                <p>{event.companyName}</p>
                <p>{event.place} - {event.time}</p>
                <p>{new Date(event.date).toLocaleDateString()}</p>
                <button
                  onClick={() => handleRegister(event)}
                  className="mt-3 text-blue-500 hover:text-blue-600"
                >
                  Register Now
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add New Event Button */}
        <div className="mt-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
          >
            {showForm ? 'Cancel' : 'Add New Event'}
          </button>
        </div>

        {/* Event Creation Form */}
        {showForm && (
          <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
            <h4 className="text-2xl font-semibold mb-4">Create New Event</h4>

            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.companyName}
            />
            <input
              type="text"
              name="eventName"
              placeholder="Event Name"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.eventName}
            />

            <div className="mb-6">
              <h5 className="text-lg font-semibold mb-2">Select Roles</h5>
              <div className="p-4 border rounded-lg shadow-md bg-white">
                <label className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    name="eventRoles"
                    value="Speaker"
                    onChange={handleChange}
                    checked={eventDetails.eventRoles.includes('Speaker')}
                    className="form-checkbox text-blue-600"
                  />
                  <span className="text-gray-700">Speaker</span>
                </label>
                <label className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    name="eventRoles"
                    value="Visitor"
                    onChange={handleChange}
                    checked={eventDetails.eventRoles.includes('Visitor')}
                    className="form-checkbox text-blue-600"
                  />
                  <span className="text-gray-700">Visitor</span>
                </label>
                <label className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    name="eventRoles"
                    value="Delegate"
                    onChange={handleChange}
                    checked={eventDetails.eventRoles.includes('Delegate')}
                    className="form-checkbox text-blue-600"
                  />
                  <span className="text-gray-700">Delegate</span>
                </label>
              </div>
            </div>



            {/* Additional Input Fields */}
            <input
              type="text"
              name="place"
              placeholder="Place"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.place}
            />
            <input
              type="time"
              name="time"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.time}
            />
            <input
              type="date"
              name="date"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.date}
            />

            {/* Show Error Message */}
            {error && <p className="text-red-600 mb-3">{error}</p>}

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white p-3 rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Event"}
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center p-4 mt-auto text-sm md:text-base">
        <p>&copy; 2025 EventMVP. All rights reserved.</p>
      </footer>
    </div>
  );
}
