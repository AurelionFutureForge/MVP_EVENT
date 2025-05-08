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
    eventRoles: [],
    eventPrivileges: []  // Add this field for privileges
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newRole, setNewRole] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [newPrivilege, setNewPrivilege] = useState('');  // New state for privilege
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
    const { name, value } = e.target;
    setEventDetails({ ...eventDetails, [name]: value });
  };

  const handleAddRole = () => {
    if (newRole.trim() && roleDescription.trim()) {
      setEventDetails((prevDetails) => ({
        ...prevDetails,
        eventRoles: [
          ...prevDetails.eventRoles,
          { roleName: newRole.trim(), roleDescription: roleDescription.trim() }
        ]
      }));
      setNewRole('');
      setRoleDescription('');
    }
  };

  const handleAddPrivilege = () => {
    if (newPrivilege.trim()) {
      setEventDetails((prevDetails) => ({
        ...prevDetails,
        eventPrivileges: [...prevDetails.eventPrivileges, newPrivilege.trim()]
      }));
      setNewPrivilege('');
    }
  };

  const handleDeleteRole = (index) => {
    setEventDetails((prevDetails) => ({
      ...prevDetails,
      eventRoles: prevDetails.eventRoles.filter((_, i) => i !== index)
    }));
  };

  const handleDeletePrivilege = (index) => {
    setEventDetails((prevDetails) => ({
      ...prevDetails,
      eventPrivileges: prevDetails.eventPrivileges.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const { companyName, eventName, place, time, date, eventRoles, eventPrivileges } = eventDetails;
    if (!companyName || !eventName || !place || !time || !date || eventRoles.length === 0 || eventPrivileges.length === 0) {
      setError("All fields are required, including at least one role and one privilege.");
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const sanitizedRoles = eventDetails.eventRoles.map(role => ({
        roleName: role.roleName.trim(),
        roleDescription: role.roleDescription.trim(),
      }));

      const sanitizedPrivileges = eventDetails.eventPrivileges.map(privilege => privilege.trim());

      const response = await axios.post(`${BASE_URL}/events/create-event`, {
        ...eventDetails,
        eventRoles: sanitizedRoles,
        eventPrivileges: sanitizedPrivileges,
        date: new Date(eventDetails.date).toISOString().split('T')[0],
      });

      if (response.status === 201) {
        toast.success("Event created successfully!");
        setEvents([...events, response.data.event]);
        setShowForm(false);
        setEventDetails({ companyName: '', eventName: '', place: '', time: '', date: '', eventRoles: [], eventPrivileges: [] });
      }
    } catch (error) {
      console.error("Error creating event:", error.response?.data || error.message);
      setError(error.response?.data?.msg || "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (companyName, eventName) => {
    navigate(`/register/${companyName}/${eventName}`);
  };

  const handleCopyLink = (companyName, eventName) => {
    const registrationLink = `${window.location.origin}/register/${encodeURIComponent(companyName)}/${encodeURIComponent(eventName)}`;
    navigator.clipboard.writeText(registrationLink);
    toast.success('Link copied to clipboard!');
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
                <div className="mt-4 space-x-4 flex justify-center">
                  <button
                    onClick={() => handleRegister(event.companyName, event.eventName)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Register Now
                  </button>
                  <button
                    onClick={() => handleCopyLink(event.companyName, event.eventName)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Copy Link
                  </button>
                </div>
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
                placeholder="Role Description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
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
              <h5 className="text-lg font-semibold mb-2">Add New Privilege</h5>
              <input
                type="text"
                placeholder="Privilege Name"
                value={newPrivilege}
                onChange={(e) => setNewPrivilege(e.target.value)}
                className="w-full p-3 mb-2 border rounded-lg shadow-sm"
              />
              <button
                onClick={handleAddPrivilege}
                className="w-full py-2 mt-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700"
              >
                Add Privilege
              </button>
            </div>

            <div className="mb-6">
              <h5 className="text-lg font-semibold mb-2">Selected Privileges</h5>
              {eventDetails.eventPrivileges.map((privilege, index) => (
                <div key={index} className="flex justify-between items-center mb-2 p-2 border rounded-lg bg-gray-100">
                  <div>{privilege}</div>
                  <button
                    onClick={() => handleDeletePrivilege(index)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
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

            {error && <p className="text-red-600 mb-2">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
