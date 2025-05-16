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
    startDate: '',
    endDate: '',
    time: '',
    eventRoles: [],
  });

  const [posterFile, setPosterFile] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [privileges, setPrivileges] = useState('');
  const [rolePrice, setRolePrice] = useState('');
  const [maxRegistrations, setMaxRegistrations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/events/edit/${eventId}`);
        const event = res.data;

        const rolesWithPrivilegesString = event.eventRoles.map(role => ({
          ...role,
          privileges: role.privileges.join(', '),
        }));

        setEventDetails({
          companyName: event.companyName,
          eventName: event.eventName,
          place: event.place,
          startDate: event.startDate,
          endDate: event.endDate,
          time: event.time,
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
    if (newRole.trim() && roleDescription.trim() && privileges.trim() && rolePrice && maxRegistrations) {
      if (editIndex !== null) {
        setEventDetails(prev => {
          const updatedRoles = [...prev.eventRoles];
          updatedRoles[editIndex] = {
            roleName: newRole.trim(),
            roleDescription: roleDescription.trim(),
            privileges: privileges.trim(),
            rolePrice: parseFloat(rolePrice),
            maxRegistrations: parseInt(maxRegistrations),
          };
          return { ...prev, eventRoles: updatedRoles };
        });
        setEditIndex(null);
      } else {
        setEventDetails(prev => ({
          ...prev,
          eventRoles: [
            ...prev.eventRoles,
            {
              roleName: newRole.trim(),
              roleDescription: roleDescription.trim(),
              privileges: privileges.trim(),
              rolePrice: parseFloat(rolePrice),
              maxRegistrations: parseInt(maxRegistrations),
            },
          ],
        }));
      }

      setNewRole('');
      setRoleDescription('');
      setPrivileges('');
      setRolePrice('');
      setMaxRegistrations('');
    } else {
      toast.error("All fields for role are required.");
    }
  };

  const handleEditRole = (index) => {
    const selectedRole = eventDetails.eventRoles[index];
    setNewRole(selectedRole.roleName);
    setRoleDescription(selectedRole.roleDescription);
    setPrivileges(selectedRole.privileges);
    setRolePrice(selectedRole.rolePrice);
    setMaxRegistrations(selectedRole.maxRegistrations);
    setEditIndex(index);
  };

  const handleDeleteRole = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete ?");
    if (confirmDelete) {
      setEventDetails(prev => ({
        ...prev,
        eventRoles: prev.eventRoles.filter((_, i) => i !== index),
      }));
    }
  };


  const validateForm = () => {
    const { companyName, eventName, place, startDate, eventRoles, time } = eventDetails;
    if (!companyName || !eventName || !place || !startDate || eventRoles.length === 0 || !time) {
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
      const sanitizedRoles = eventDetails.eventRoles.map(role => ({
        roleName: role.roleName.trim(),
        roleDescription: role.roleDescription.trim(),
        privileges: role.privileges.split(',').map(p => p.trim()).filter(p => p),
        rolePrice: role.rolePrice,
        maxRegistrations: role.maxRegistrations,
      }));

      const formData = new FormData();
      formData.append("companyName", eventDetails.companyName);
      formData.append("eventName", eventDetails.eventName);
      formData.append("place", eventDetails.place);
      formData.append("startDate", new Date(eventDetails.startDate).toISOString().split('T')[0]);
      if (eventDetails.endDate) {
        formData.append("endDate", new Date(eventDetails.endDate).toISOString().split('T')[0]);
      }
      formData.append("time", eventDetails.time);
      formData.append("eventRoles", JSON.stringify(sanitizedRoles));
      if (posterFile) {
        formData.append("poster", posterFile);
      }

      const res = await axios.put(`${BASE_URL}/events/${eventId}`, formData);

      if (res.status === 200) {
        toast.success("Event updated successfully!");
        navigate('/create-event');
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

        <input type="date" name="startDate"
          className="w-full p-3 mb-4 border rounded"
          value={eventDetails.startDate} onChange={handleChange} />

        {eventDetails.endDate && (
          <input
            type="date"
            name="endDate"
            className="w-full p-3 mb-4 border rounded"
            value={eventDetails.endDate}
            onChange={handleChange}
          />
        )}

        <input
          type="text"
          name="time"
          placeholder="Time (e.g., 10:00 AM)"
          className="w-full p-3 mb-4 border rounded-lg shadow-sm"
          onChange={handleChange}
          value={eventDetails.time}
        />

        {/* Poster Upload */}
        <input
          type="file"
          accept="image/*"
          className="w-full mb-4 p-2 border rounded"
          onChange={(e) => setPosterFile(e.target.files[0])}
        />

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

          <input type="number" placeholder="Role Price"
            className="w-full p-2 mb-2 border rounded"
            value={rolePrice} onChange={(e) => setRolePrice(e.target.value)} />

          <input type="number" placeholder="Max Registrations"
            className="w-full p-2 mb-2 border rounded"
            value={maxRegistrations} onChange={(e) => setMaxRegistrations(e.target.value)} />

          <button
            onClick={handleAddRole}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >{editIndex !== null ? 'Update Role' : 'Add Role'}</button>

          <div className="mt-4 space-y-2">
            {eventDetails.eventRoles.map((role, index) => (
              <div key={index} className="flex justify-between items-start p-2 bg-gray-100 rounded">
                <div>
                  <strong>{role.roleName}</strong> — {role.roleDescription}<br />
                  <small className="text-sm text-gray-600">Privileges: {role.privileges}</small><br />
                  <small className="text-sm text-gray-600">Price: ${role.rolePrice}</small><br />
                  <small className="text-sm text-gray-600">Max Registrations: {role.maxRegistrations}</small>
                </div>
                <div className="flex flex-col items-end space-y-16 ml-2">
                  <button
                    onClick={() => handleEditRole(index)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRole(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ✕
                  </button>
                </div>
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
