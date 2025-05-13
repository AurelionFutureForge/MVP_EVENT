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
    companyPoster: '',
  });

  const [newRole, setNewRole] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [privileges, setPrivileges] = useState('');
  const [rolePrice, setRolePrice] = useState('');
  const [maxRegistrations, setMaxRegistrations] = useState('');
  const [companyPoster, setCompanyPoster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/events/${eventId}`);
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
          companyPoster: event.companyPoster || '',
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyPoster(file);
    }
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
    setEventDetails(prev => ({
      ...prev,
      eventRoles: prev.eventRoles.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const { companyName, eventName, place, startDate, endDate, eventRoles, time } = eventDetails;
    if (!companyName || !eventName || !place || !startDate || !endDate || eventRoles.length === 0 || !time) {
      setError("All fields and at least one role are required.");
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const formData = new FormData();

    // Append the event details to the form data
    formData.append('companyName', eventDetails.companyName);
    formData.append('eventName', eventDetails.eventName);
    formData.append('place', eventDetails.place);
    formData.append('startDate', new Date(eventDetails.startDate).toISOString().split('T')[0]);
    formData.append('endDate', new Date(eventDetails.endDate).toISOString().split('T')[0]);
    formData.append('time', eventDetails.time);

    // Add the event roles
    eventDetails.eventRoles.forEach((role, index) => {
      formData.append(`eventRoles[${index}][roleName]`, role.roleName);
      formData.append(`eventRoles[${index}][roleDescription]`, role.roleDescription);
      formData.append(`eventRoles[${index}][privileges]`, role.privileges);
      formData.append(`eventRoles[${index}][rolePrice]`, role.rolePrice);
      formData.append(`eventRoles[${index}][maxRegistrations]`, role.maxRegistrations);
    });

    // Append the company poster if a new file is selected
    if (companyPoster) {
      formData.append('companyPoster', companyPoster);
    }

    try {
      const res = await axios.put(`${BASE_URL}/events/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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

        <input type="date" name="endDate"
          className="w-full p-3 mb-4 border rounded"
          value={eventDetails.endDate} onChange={handleChange} />

        <input
          type="text"
          name="time"
          placeholder="Time (e.g., 10:00 AM)"
          className="w-full p-3 mb-4 border rounded-lg shadow-sm"
          onChange={handleChange}
          value={eventDetails.time}
        />

        {/* Display the current company poster */}
        {eventDetails.companyPoster && (
          <div className="mb-4">
            <img
              src={eventDetails.companyPoster}
              alt="Company Poster"
              className="w-full max-w-xs mx-auto mb-2"
            />
          </div>
        )}

        {/* File input for company poster */}
        <input
          type="file"
          name="companyPoster"
          className="w-full p-2 mb-4 border rounded"
          onChange={handleFileChange}
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
              <div key={index} className="flex justify-between items-center">
                <span>{role.roleName}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEditRole(index)}
                    className="text-blue-600 hover:text-blue-700"
                  >Edit</button>
                  <button
                    onClick={() => handleDeleteRole(index)}
                    className="text-red-600 hover:text-red-700"
                  >Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          className={`w-full py-3 text-white font-bold bg-green-600 rounded hover:bg-green-700 ${loading ? 'opacity-50' : ''}`}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Event'}
        </button>
      </div>
    </div>
  );
}