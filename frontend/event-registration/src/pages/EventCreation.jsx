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
    setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
  };

  // Validate input fields
  const validateForm = () => {
    if (!eventDetails.companyName || !eventDetails.eventName || !eventDetails.place || !eventDetails.time || !eventDetails.date) {
      setError("All fields are required.");
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
        setEventDetails({ companyName: '', eventName: '', place: '', time: '', date: '' });
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
    navigate(`/register/${event.companyName}/${event.eventName}`, { state: { 
      place: event.place, 
      time: event.time,
      date: event.date 
    } });
  };

  return (
    <div className="min-h-screen flex flex-col">
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
        <h3 className="text-2xl md:text-3xl font-semibold mb-4">Your Events</h3>

        {/* Display Existing Events */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <p>No events created yet. Add a new event!</p>
          ) : (
            events.map((event) => (
              <div key={event._id} className="border p-4 rounded-lg">
                <h4 className="font-semibold text-xl">{event.eventName}</h4>
                <p>{event.companyName}</p>
                <p>{event.place} - {event.time}</p>
                <p>{new Date(event.date).toLocaleDateString()}</p>
                <button 
                  onClick={() => handleRegister(event)} 
                  className="text-blue-500 hover:text-blue-600"
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
          <div className="mt-6 p-6 border border-gray-300 rounded-lg bg-white">
            <h4 className="text-xl font-semibold mb-4">Create New Event</h4>
            <input type="text" name="companyName" placeholder="Company Name" className="w-full p-2 mb-3 border rounded" onChange={handleChange} value={eventDetails.companyName} />
            <input type="text" name="eventName" placeholder="Event Name" className="w-full p-2 mb-3 border rounded" onChange={handleChange} value={eventDetails.eventName} />
            <input type="text" name="place" placeholder="Place" className="w-full p-2 mb-3 border rounded" onChange={handleChange} value={eventDetails.place} />
            <input type="time" name="time" className="w-full p-2 mb-3 border rounded" onChange={handleChange} value={eventDetails.time} />
            <input type="date" name="date" className="w-full p-2 mb-3 border rounded" onChange={handleChange} value={eventDetails.date} />

            {/* Show Error Message */}
            {error && <p className="text-red-600 mb-3">{error}</p>}

            <button onClick={handleSubmit} className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700" disabled={loading}>
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
