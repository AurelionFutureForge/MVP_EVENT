import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-hot-toast";

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
  const [newRole, setNewRole] = useState('');
  const [rolePrivileges, setRolePrivileges] = useState(''); // To hold dynamic privileges input
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

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "eventRoles") {
      const roleName = value;
      setEventDetails((prevDetails) => {
        const updatedRoles = prevDetails.eventRoles.some(role => role.roleName === roleName)
          ? prevDetails.eventRoles.filter(role => role.roleName !== roleName)
          : [...prevDetails.eventRoles, { roleName, privileges: [] }];
        return { ...prevDetails, eventRoles: updatedRoles };
      });
    } else if (name.includes('_')) {
      const [roleName, privilege] = name.split("_");
      setEventDetails((prevDetails) => {
        const updatedRoles = prevDetails.eventRoles.map(role => 
          role.roleName === roleName ? { 
            ...role, 
            privileges: role.privileges.includes(privilege) 
              ? role.privileges.filter(p => p !== privilege)
              : [...role.privileges, privilege] 
          } : role
        );
        return { ...prevDetails, eventRoles: updatedRoles };
      });
    } else {
      setEventDetails({ ...eventDetails, [name]: value });
    }
  };

  const handleAddRole = () => {
    if (newRole.trim()) {
      const privilegesArray = rolePrivileges.split(',').map(privilege => privilege.trim()).filter(privilege => privilege);

      setEventDetails((prevDetails) => ({
        ...prevDetails,
        eventRoles: [
          ...prevDetails.eventRoles,
          { roleName: newRole.trim(), privileges: privilegesArray }
        ]
      }));
      setNewRole('');
      setRolePrivileges(''); // Reset privileges input
    }
  };

  const validateForm = () => {
    if (!eventDetails.companyName || !eventDetails.eventName || !eventDetails.place || !eventDetails.time || !eventDetails.date || eventDetails.eventRoles.length === 0) {
      setError("All fields are required, including at least one role.");
      return false;
    }
    setError(""); 
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log("Sending Event Details:", eventDetails);

      const response = await axios.post(`${BASE_URL}/events/create-event`, {
        ...eventDetails,
        date: new Date(eventDetails.date).toISOString().split('T')[0],
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-500 to-purple-600">
      <nav className="bg-blue-600 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center text-white">
          <h1 className="text-2xl font-bold">EventMVP</h1>
          <div className="hidden md:flex space-x-6">
            <a href="/" className="hover:text-gray-200">Home</a>
            <a href="/admin/login" className="hover:text-gray-200">Admin</a>
          </div>
        </div>
      </nav>

      <section className="container mx-auto text-center p-6 md:p-12">
        <h3 className="text-3xl font-semibold text-white mb-4">Your Events</h3>

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
              </div>
            ))
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
          >
            {showForm ? 'Cancel' : 'Add New Event'}
          </button>
        </div>

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
              <h5 className="text-lg font-semibold mb-2">Add New Role</h5>
              <input
                type="text"
                placeholder="New Role Name"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-3 mb-2 border rounded-lg shadow-sm"
              />
              <input
                type="text"
                placeholder="Privileges (comma separated)"
                value={rolePrivileges}
                onChange={(e) => setRolePrivileges(e.target.value)}
                className="w-full p-3 mb-2 border rounded-lg shadow-sm"
              />
              <button
                onClick={handleAddRole}
                className="w-full py-2 mt-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700"
              >
                Add Role
              </button>
            </div>

            <div className="mb-6">
              <h5 className="text-lg font-semibold mb-2">Selected Roles</h5>
              {eventDetails.eventRoles.map((role, index) => (
                <div key={index} className="mb-3">
                  <span className="font-semibold">{role.roleName}</span> - 
                  {role.privileges && role.privileges.length > 0 
                    ? role.privileges.join(', ') 
                    : 'No privileges'}
                </div>
              ))}
            </div>

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
