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
    eventRoles: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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
    alert('Link copied to clipboard!');
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

                {/* Register Now Button and Copy Link Button */}
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
              onChange={(e) => setEventDetails({ ...eventDetails, companyName: e.target.value })}
              value={eventDetails.companyName}
            />
            <input
              type="text"
              name="eventName"
              placeholder="Event Name"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={(e) => setEventDetails({ ...eventDetails, eventName: e.target.value })}
              value={eventDetails.eventName}
            />
            <input
              type="text"
              name="place"
              placeholder="Place"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={(e) => setEventDetails({ ...eventDetails, place: e.target.value })}
              value={eventDetails.place}
            />
            <input
              type="time"
              name="time"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={(e) => setEventDetails({ ...eventDetails, time: e.target.value })}
              value={eventDetails.time}
            />
            <input
              type="date"
              name="date"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={(e) => setEventDetails({ ...eventDetails, date: e.target.value })}
              value={eventDetails.date}
            />

            {error && <p className="text-red-600">{error}</p>}

            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const response = await axios.post(`${BASE_URL}/events/create-event`, eventDetails);
                  if (response.status === 201) {
                    setEvents([...events, response.data.event]);
                    setShowForm(false);
                    setEventDetails({ companyName: '', eventName: '', place: '', time: '', date: '', eventRoles: [] });
                  }
                } catch (error) {
                  setError('Failed to create event. Please try again.');
                } finally {
                  setLoading(false);
                }
              }}
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
