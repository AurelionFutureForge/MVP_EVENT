import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

function CreateRegistrationForm() {
  const [eventName, setEventName] = useState("");
  const [formLink, setFormLink] = useState("");
  const [fields, setFields] = useState([
    {
      fieldName: "EMAIL",
      fieldType: "email",
      options: [],
      required: true,
      locked: true,
    },
  ]);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const companyName = localStorage.getItem("adminCompany");
  const EventId = localStorage.getItem("selectedEvent");

  // Generate form link on component mount
  useEffect(() => {
    if (EventId) {
      const link = `https://mvp-event.vercel.app/register/${EventId}`;
      setFormLink(link);
    }
  }, [EventId]);

  // Fetch event roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/${EventId}`);
        const event = response.data;
        const fetchedRoles = event.eventRoles.map((role, index) => ({
          _id: index.toString(),
          roleName: role.roleName,
          roleDescription: role.roleDescription,
        }));
        setRoles(fetchedRoles);
      } catch (err) {
        toast.error("Failed to fetch event roles");
      }
    };
    fetchRoles();
  }, [BASE_URL, EventId]);

  // Toggle role selection
  const handleRoleToggle = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Handle field updates
  const handleFieldChange = (index, field, value) => {
    const updated = [...fields];
    updated[index][field] = value;
    setFields(updated);
  };

  // Add new field
  const addField = () => {
    setFields([
      ...fields,
      { fieldName: "", fieldType: "text", options: [], required: false },
    ]);
  };

  // Remove a field
  const removeField = (index) => {
    if (fields[index].locked) {
      toast.error("Cannot remove locked field.");
      return;
    }
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventName) {
      toast.error("Please enter Event Name.");
      return;
    }
    if (fields.some((f) => !f.fieldName.trim())) {
      toast.error("Please fill all field names.");
      return;
    }

    const token = localStorage.getItem("adminToken");

    try {
      const response = await axios.post(
        `${BASE_URL}/events/save-registration-fields`,
        {
          companyName,
          eventName,
          EventId,
          registrationFields: fields,
          selectedRoles,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const eventId = response.data.eventId;
      const link = `https://mvp-event.vercel.app/register/${eventId}`;
      setFormLink(link);
      localStorage.setItem("eventId", eventId);

      setEventName("");
      setFields([
        {
          fieldName: "EMAIL",
          fieldType: "email",
          options: [],
          required: true,
          locked: true,
        },
      ]);
      setSelectedRoles([]);

      toast.success("Registration form updated successfully!");
    } catch (err) {
      toast.error("Failed to save form.");
    }
  };

  const copyLink = () => {
    if (!formLink) {
      toast.error("No link to copy.");
      return;
    }
    navigator.clipboard.writeText(formLink);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Registration Form
        </h2>

        <label className="block font-semibold mb-1">Event Name</label>
        <input
          type="text"
          placeholder="Enter Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-4"
        />

        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded p-3 mb-4 text-sm">
          <strong>Note:</strong> The <em>Role</em> field is automatically handled. You do not need to add it manually.
        </div>

        {/* Roles Selection */}
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h3 className="font-semibold mb-3">Select Roles for Registration</h3>
          {roles.map((role) => (
            <div key={role._id} className="flex items-start mb-3">
              <input
                type="checkbox"
                id={`role-${role._id}`}
                checked={selectedRoles.includes(role._id)}
                onChange={() => handleRoleToggle(role._id)}
                className="mt-1 mr-2"
              />
              <div>
                <label htmlFor={`role-${role._id}`} className="font-medium">
                  {role.roleName}
                </label>
                <p className="text-sm text-gray-600">{role.roleDescription}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Fields */}
        {fields.map((field, index) => (
          <div
            key={index}
            className="border rounded p-4 mb-3 bg-gray-50 relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Field Name"
                value={field.fieldName}
                onChange={(e) =>
                  handleFieldChange(index, "fieldName", e.target.value.toUpperCase())
                }
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
                style={{ textTransform: "uppercase" }}
                disabled={field.locked}
              />

              <select
                value={field.fieldType}
                onChange={(e) =>
                  handleFieldChange(index, "fieldType", e.target.value)
                }
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
                disabled={field.locked}
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
                <option value="date">Date</option>
              </select>
            </div>

            {(field.fieldType === "select" || field.fieldType === "checkbox") &&
              !field.locked && (
                <div className="mt-3">
                  <label className="block font-semibold">Options (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Option1, Option2"
                    value={field.options.join(", ")}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "options",
                        e.target.value.split(",").map((opt) => opt.trim())
                      )
                    }
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
              )}

            {!field.locked && (
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      handleFieldChange(index, "required", e.target.checked)
                    }
                    className="mr-2"
                  />
                  Required
                </label>

                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-3 mt-4 mb-6">
          <button
            type="button"
            onClick={addField}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Field
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Save Form
          </button>
        </div>

        {formLink && (
          <div className="mt-6">
            <p className="font-semibold mb-1">Registration Form Link:</p>
            <p className="text-blue-700 break-words">{formLink}</p>
            <button
              onClick={copyLink}
              className="bg-gray-800 text-white px-4 py-2 rounded mt-2 hover:bg-gray-900"
            >
              Copy Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateRegistrationForm;
