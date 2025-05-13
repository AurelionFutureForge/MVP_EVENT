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
    startDate: '',
    endDate: '',
    time: '',
    eventRoles: [],
    poster: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newRole, setNewRole] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [privilege, setPrivilege] = useState('');
  const [rolePrice, setRolePrice] = useState('');
  const [roleMaxReg, setRoleMaxReg] = useState('');

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const loggedInEmail = localStorage.getItem('adminEmail');

  useEffect(() => {
    const fetchEvents = async () => {
      if (!loggedInEmail) {
        toast.error('Please login to view your events');
        navigate('/event-login');
        return;
      }

      const companyName = localStorage.getItem('adminCompanyName');
      if (!companyName) {
        toast.error('Company name not found. Please login again.');
        navigate('/event-login');
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/events/get-events?companyName=${encodeURIComponent(companyName)}`);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [loggedInEmail, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventDetails({ ...eventDetails, [name]: value });
  };

  const handlePosterChange = (e) => {
    setEventDetails({ ...eventDetails, poster: e.target.files[0] });
  };

  const handleAddRole = () => {
    if (newRole.trim() && roleDescription.trim() && privilege.trim() && rolePrice && roleMaxReg) {
      const cleanedPrivilege = privilege.split(',').map(p => p.trim()).filter(p => p.length > 0).join(',');

      setEventDetails((prevDetails) => ({
        ...prevDetails,
        eventRoles: [
          ...prevDetails.eventRoles,
          {
            roleName: newRole.trim(),
            roleDescription: roleDescription.trim(),
            privileges: [cleanedPrivilege],
            price: Number(rolePrice),
            maxRegistrations: Number(roleMaxReg)
          }
        ]
      }));

      setNewRole('');
      setRoleDescription('');
      setPrivilege('');
      setRolePrice('');
      setRoleMaxReg('');
    } else {
      toast.error('Please fill all role fields, including price and max registrations');
    }
  };

  const handleDeleteRole = (index) => {
    setEventDetails((prevDetails) => ({
      ...prevDetails,
      eventRoles: prevDetails.eventRoles.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const { companyName, eventName, place, time, startDate, endDate, eventRoles } = eventDetails;
    if (!companyName || !eventName || !place || !time || !startDate || !endDate || eventRoles.length === 0) {
      setError("All fields are required, including at least one role.");
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
        privileges: role.privileges.map(p => p.trim()),
        price: role.price,
        maxRegistrations: role.maxRegistrations
      }));

      const formData = new FormData();
      formData.append("companyName", eventDetails.companyName);
      formData.append("eventName", eventDetails.eventName);
      formData.append("place", eventDetails.place);
      formData.append("time", eventDetails.time);
      formData.append("startDate", new Date(eventDetails.startDate).toISOString().split('T')[0]);
      formData.append("endDate", new Date(eventDetails.endDate).toISOString().split('T')[0]);
      formData.append("companyEmail", loggedInEmail);
      formData.append("eventRoles", JSON.stringify(sanitizedRoles));
      if (eventDetails.poster) {
        formData.append("poster", eventDetails.poster);
      }

      const response = await axios.post(`${BASE_URL}/events/create-event`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Event created successfully!");
        setEvents([...events, response.data.event]);
        setShowForm(false);
        setEventDetails({
          companyName: '',
          eventName: '',
          place: '',
          startDate: '',
          endDate: '',
          time: '',
          eventRoles: [],
          poster: null
        });
      }
    } catch (error) {
      console.error("Error creating event:", error.response?.data || error.message);
      setError(error.response?.data?.msg || "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (eventID) => {
    navigate(`/edit-event/${eventID}`);
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
                <p>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</p>
                <div className="mt-4 space-x-4 flex justify-center">
                  <button
                    onClick={() => handleEditEvent(event._id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Edit Event
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
              <input
                type="text"
                placeholder="Enter privileges (comma-separated)"
                value={privilege}
                onChange={(e) => setPrivilege(e.target.value)}
                className="w-full p-3 mb-2 border rounded-lg shadow-sm"
              />
              <input
                type="number"
                placeholder="Role Price"
                value={rolePrice}
                onChange={(e) => setRolePrice(e.target.value)}
                className="w-full p-3 mb-2 border rounded-lg shadow-sm"
              />
              <input
                type="number"
                placeholder="Max Registrations"
                value={roleMaxReg}
                onChange={(e) => setRoleMaxReg(e.target.value)}
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
                <div key={index} className="flex justify-between items-center mb-2 p-2 border rounded-lg bg-gray-100">
                  <div>
                    <span className="font-semibold">{role.roleName}</span> - {role.roleDescription} <br />
                    <span className="text-sm text-gray-600">Privileges: {role.privileges[0]}</span><br />
                    <span className="text-sm text-gray-600">Price: ₹{role.price}</span><br />
                    <span className="text-sm text-gray-600">Max Registrations: {role.maxRegistrations}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteRole(index)}
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
              type="text"
              name="time"
              placeholder="Time (e.g., 10:00 AM)"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.time}
            />
            <label><b>Start Date</b></label>
            <input
              type="date"
              name="startDate"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.startDate}
            />
            <label><b>End Date</b></label>
            <input
              type="date"
              name="endDate"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.endDate}
            />

            <label><b>Upload Company Poster</b></label>
            <input
              type="file"
              name="poster"
              accept="image/*"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handlePosterChange}
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
