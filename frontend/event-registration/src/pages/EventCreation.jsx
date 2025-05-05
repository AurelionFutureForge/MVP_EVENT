import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {toast} from "react-hot-toast";

export default function EventCreation() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    companyName: '',
    eventName: '',
    place: '',
    time: '',
    date: '',
    eventRoles: [], // Array to hold selected roles with privileges
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
    const { name, value, checked } = e.target;

    if (name === "eventRoles") {
      const roleName = value;
      setEventDetails((prevDetails) => {
        // Toggle role selection
        const updatedRoles = prevDetails.eventRoles.some(role => role.name === roleName)
          ? prevDetails.eventRoles.filter(role => role.name !== roleName)
          : [...prevDetails.eventRoles, { name: roleName, lunch: false, gift: false }];
        return { ...prevDetails, eventRoles: updatedRoles };
      });
    } else if (name.includes('_')) {
      // Handle changes for lunch and gift checkboxes (e.g., 'Speaker_lunch' or 'Speaker_gift')
      const [roleName, privilege] = name.split("_"); // 'Speaker_lunch' -> ['Speaker', 'lunch']
      setEventDetails((prevDetails) => {
        const updatedRoles = prevDetails.eventRoles.map(role => 
          role.name === roleName ? { ...role, [privilege]: checked } : role
        );
        return { ...prevDetails, eventRoles: updatedRoles };
      });
    } else {
      setEventDetails({ ...eventDetails, [name]: value });
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
      // Log event details for debugging
      console.log("Sending Event Details:", eventDetails);

      // Sending data to backend with correctly formatted date
      const response = await axios.post(`${BASE_URL}/events/create-event`, {
        ...eventDetails,
        date: new Date(eventDetails.date).toISOString().split('T')[0], // Ensure correct format (YYYY-MM-DD)
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
        eventRoles: event.eventRoles,
      }
    });
  };

  const handleCopyLink = (event) => {
    const registrationLink = `${window.location.origin}/register/${encodeURIComponent(event.companyName)}/${encodeURIComponent(event.eventName)}`;
    navigator.clipboard.writeText(registrationLink);
    toast.success('Link copied to clipboard!');
  };


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-500 to-purple-600">
      {/* Navbar */}
      <nav className="bg-blue-600 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center text-white">
          <h1 className="text-2xl font-bold">EventMVP</h1>
          <div className="hidden md:flex space-x-6">
            <a href="/" className="hover:text-gray-200">Home</a>
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

                {/* Register Now Button and Link to Copy */}
                <div className="mt-4 space-x-4 flex justify-center">
                  <button
                    onClick={() => handleRegister(event)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Register Now
                  </button>
                  <button
                    onClick={() => handleCopyLink(event)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Copy Link
                  </button>
                </div>
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

            {/* Select Roles with Lunch and Gift options */}
            <div className="mb-6">
              <h5 className="text-lg font-semibold mb-2">Select Roles</h5>
              <div className="p-4 border rounded-lg shadow-md bg-white">
                {['Speaker', 'Visitor', 'Delegate'].map((role) => (
                  <div key={role} className="mb-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="eventRoles"
                        value={role}
                        onChange={handleChange}
                        checked={eventDetails.eventRoles.some(r => r.name === role)}
                        className="form-checkbox text-blue-600"
                      />
                      <span className="text-gray-700">{role}</span>
                    </label>
                    {/* Lunch and Gift Privileges */}
                    {eventDetails.eventRoles.some(r => r.name === role) && (
                      <div className="flex items-center space-x-4 ml-6">
                        <label className="text-gray-600">
                          <input
                            type="checkbox"
                            name={`${role}_lunch`}
                            onChange={handleChange}
                            checked={eventDetails.eventRoles.find(r => r.name === role)?.lunch || false}
                            className="form-checkbox text-green-600"
                          />
                          Lunch
                        </label>
                        <label className="text-gray-600">
                          <input
                            type="checkbox"
                            name={`${role}_gift`}
                            onChange={handleChange}
                            checked={eventDetails.eventRoles.find(r => r.name === role)?.gift || false}
                            className="form-checkbox text-purple-600"
                          />
                          Gift
                        </label>
                      </div>
                    )}
                  </div>
                ))}
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

            {error && <p className="text-red-600">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
