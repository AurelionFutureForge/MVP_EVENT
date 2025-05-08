// src/pages/EditEvent.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-hot-toast";

export default function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventDetails, setEventDetails] = useState({
    companyName: '',
    eventName: '',
    place: '',
    time: '',
    date: '',
    eventRoles: [],
  });

  const [newRole, setNewRole] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [privileges, setPrivileges] = useState(''); // comma separated privileges
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Fetch existing event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/events/${eventId}`);
        const event = res.data;

        // FIXED: Join privileges array into comma separated string for each role
        const rolesWithPrivilegesString = event.eventRoles.map(role => ({
          ...role,
          privileges: role.privileges.join(', ')
        }));

        setEventDetails({
          companyName: event.companyName,
          eventName: event.eventName,
          place: event.place,
          time: event.time,
          date: event.date,
          eventRoles: rolesWithPrivilegesString,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch event details");
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventDetails({ ...eventDetails, [name]: value });
  };

  const handleAddRole = () => {
    if (newRole.trim() && roleDescription.trim() && privileges.trim()) {
      setEventDetails(prev => ({
        ...prev,
        eventRoles: [
          ...prev.eventRoles,
          { roleName: newRole.trim(), roleDescription: roleDescription.trim(), privileges: privileges.trim() }
        ]
      }));
      setNewRole('');
      setRoleDescription('');
      setPrivileges('');
    }
  };

  const handleDeleteRole = (index) => {
    setEventDetails(prev => ({
      ...prev,
      eventRoles: prev.eventRoles.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const { companyName, eventName, place, time, date, eventRoles } = eventDetails;
    if (!companyName || !eventName || !place || !time || !date || eventRoles.length === 0) {
      setError("All fields and at least one role are required.");
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // FIXED: Split privileges string into array properly
      const sanitizedRoles = eventDetails.eventRoles.map(role => ({
        roleName: role.roleName.trim(),
        roleDescription: role.roleDescription.trim(),
        privileges: role.privileges.split(',').map(p => p.trim()).filter(p => p)
      }));

      const updatedEvent = {
        ...eventDetails,
        eventRoles: sanitizedRoles,
        date: new Date(eventDetails.date).toISOString().split('T')[0],
      };

      const res = await axios.put(`${BASE_URL}/events/${eventId}`, updatedEvent);

      if (res.status === 200) {
        toast.success("Event updated successfully!");
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      <h1 className="text-3xl text-white font-bold mb-6 text-center">Edit Event</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <input type="text" name="companyName" placeholder="Company Name"
          className="w-full p-3 mb-4 border rounded"
          value={eventDetails.companyName} onChange={handleChange} />

        <input type="text" name="eventName" placeholder="Event Name"
          className="w-full p-3 mb-4 border rounded"
          value={eventDetails.eventName} onChange={handleChange} />

        <input type="text" name="place" placeholder="Place"
          className="w-full p-3 mb-4 border rounded"
          value={eventDetails.place} onChange={handleChange} />

        <input type="time" name="time"
          className="w-full p-3 mb-4 border rounded"
          value={eventDetails.time} onChange={handleChange} />

        <input type="date" name="date"
          className="w-full p-3 mb-4 border rounded"
          value={eventDetails.date} onChange={handleChange} />

        {/* Roles */}
        <div className="mb-6">
          <h5 className="font-semibold mb-2">Add/Edit Roles & Privileges</h5>
          <input type="text" placeholder="Role Name"
            className="w-full p-2 mb-2 border rounded"
            value={newRole} onChange={(e) => setNewRole(e.target.value)} />

          <input type="text" placeholder="Role Description"
            className="w-full p-2 mb-2 border rounded"
            value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} />

          <input type="text" placeholder="Privileges (comma separated)"
            className="w-full p-2 mb-2 border rounded"
            value={privileges} onChange={(e) => setPrivileges(e.target.value)} />

          <button
            onClick={handleAddRole}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >Add Role</button>

          {/* Display added roles */}
          <div className="mt-4 space-y-2">
            {eventDetails.eventRoles.map((role, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <div>
                  <strong>{role.roleName}</strong> — {role.roleDescription}<br />
                  <small className="text-sm text-gray-600">Privileges: {role.privileges}</small>
                </div>
                <button onClick={() => handleDeleteRole(index)} className="text-red-600 hover:text-red-800">✕</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Event'}
        </button>
      </div>
    </div>
  );
}
