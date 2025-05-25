import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

function CreateRegistrationForm() {
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
  const [eventName, setEventName] = useState("");
  const [formLink, setFormLink] = useState("");
  const [loadingRoles, setLoadingRoles] = useState(false);  // Loading state for roles
  const [formVisible, setFormVisible] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const companyName = localStorage.getItem("adminCompany");
  const EventId = localStorage.getItem("selectedEvent");

  useEffect(() => {
    const savedEventId = localStorage.getItem("selectedEvent");
    const savedEventName = localStorage.getItem("eventName");
    if (savedEventId) {
      const link = `https://events.aurelionfutureforge.com/${savedEventName}/register/${savedEventId}`;
      setFormLink(link);

      // Fetch roles for the selected event
      const fetchRoles = async () => {
        setLoadingRoles(true);  // Start loading
        try {
          const response = await axios.get(`${BASE_URL}/admin/event-roles/${EventId}`);
          const roleOptions = response.data.roles || [];
          setRoles(roleOptions);  // Update roles state

          setFields((prevFields) => {
            const hasRoleField = prevFields.some((f) => f.fieldName === "ROLE");
            if (!hasRoleField) {
              return [
                ...prevFields,
                {
                  fieldName: "ROLE",
                  fieldType: "checkbox", // Change fieldType to checkbox
                  options: roleOptions,
                  required: true,
                  locked: false,
                },
              ];
            }
            return prevFields.map((f) =>
              f.fieldName === "ROLE" ? { ...f, options: roleOptions } : f
            );
          });
        } catch (error) {
          toast.error("Failed to fetch event roles");
          console.error(error);
        } finally {
          setLoadingRoles(false);  // Stop loading
        }
      };

      fetchRoles();
    }
  }, [EventId]);

  const handleFieldChange = (index, field, value) => {
    if (fields[index].locked) return;
    const updatedFields = [...fields];
    updatedFields[index][field] = value;
    setFields(updatedFields);
  };

  const addField = () => {
    setFields([
      ...fields,
      { fieldName: "", fieldType: "text", options: [], required: false },
    ]);
  };

  const removeField = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete ?");
    if (confirmDelete) {
      if (fields[index].locked) {
        toast.error("You cannot remove default locked fields.");
        return;
      }
      const updatedFields = [...fields];
      updatedFields.splice(index, 1);
      setFields(updatedFields);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventName || fields.some((field) => !field.fieldName)) {
      toast.error("Please fill out all required fields.");
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
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const eventId = response.data.eventId;
      const EventName = response.data.eventName;
      console.log(eventName);
      const link = `https://events.aurelionfutureforge.com/${EventName}/register/${eventId}`;
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
        {
          fieldName: "ROLE",
          fieldType: "checkbox", // Change fieldType to checkbox
          options: roles,
          required: true,
          locked: false,
        },
      ]);

      toast.success("Registration form fields updated successfully!");
    } catch (error) {
      console.error("❌ Error saving registration fields:", error.response?.data || error.message);
      toast.error("Failed to update registration form fields.");
    }
  };

  const handleCopyLink = () => {
    if (formLink) {
      navigator.clipboard.writeText(formLink);
      toast.success("Link copied to clipboard!");
    } else {
      toast.error("No link to copy.");
    }
  };

  const handleRoleChange = (e, role) => {
    const isChecked = e.target.checked;
    const updatedFields = [...fields];
    const roleField = updatedFields.find((field) => field.fieldName === "ROLE");

    if (roleField) {
      if (isChecked) {
        roleField.options.push(role);
      } else {
        roleField.options = roleField.options.filter((r) => r !== role);
      }
      setFields(updatedFields);
    }
  };

  const handleCloseForm = async () => {
    try {
      const response = await axios.put(`${BASE_URL}/events/toggle-form/${EventId}`);
      const { toggleForm } = response.data;  // Extract updated value

      toast.success(`Form is now ${toggleForm ? "Closed" : "Opened"}`);

      // Optionally update local state or UI
      setFormVisible(toggleForm); // if you have local state to show/hide form
    } catch (error) {
      toast.error("Failed to toggle the form.");
      console.error("Toggle form error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-800 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Registration Form
        </h2>

        <div>
          <label className="block font-semibold">Event Name</label>
          <input
            type="text"
            placeholder="Event name should be same as in the create-event form !"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="border rounded px-3 py-2 w-full mb-4"
          />
        </div>

        {fields.map((field, index) => (
          <div key={index} className="border rounded p-4 mb-3 bg-gray-50">
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

            {(field.fieldType === "select" || field.fieldType === "checkbox") && !field.locked && (
              <div className="mt-3">
                <label className="block font-semibold">Options (comma separated)</label>
                <input
                  type="text"
                  placeholder="Option 1, Option 2"
                  value={field.options.join(", ")}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      "options",
                      e.target.value.split(",").map((opt) => opt.trim())
                    )
                  }
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            {(field.fieldType === "checkbox" && field.fieldName === "ROLE") && !field.locked && (
              <div className="mt-3">
                <label className="block font-semibold">Select Roles</label>
                <div className="space-y-2">
                  {roles.length > 0 ? (
                    roles.map((role, idx) => (
                      <div key={idx} className="flex items-center">
                        <input
                          type="checkbox"
                          value={role}
                          checked={field.options.includes(role)}
                          onChange={(e) => handleRoleChange(e, role)}
                          className="mr-2"
                        />
                        <span>{role}</span>
                      </div>
                    ))
                  ) : (
                    <div>No roles available</div>
                  )}
                </div>
              </div>
            )}

            {!field.locked && (
              <div className="mt-3">
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
              </div>
            )}

            {!field.locked && (
              <button
                type="button"
                onClick={() => removeField(index)}
                className="bg-blue-600 text-white px-6 py-2 rounded-4xl hover:bg-blue-700 transition mt-4"
              >
                Remove Field
              </button>
            )}
          </div>
        ))}


        <div className="mt-4 flex flex-wrap gap-14">
          <button
            type="button"
            onClick={addField}
            className="bg-red-600 text-white px-6 py-2 rounded-4xl hover:bg-red-700 transition"
          >
            Add Another Field
          </button>

          <button
            onClick={handleSubmit}
            className="bg-red-600 border border-gray-300 text-white px-6 py-2 rounded-4xl hover:bg-red-700 transition"
          >
            Save Registration Form
          </button>
          {formLink && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">
                {formVisible ? "Form Visible" : "Form Hidden"}
              </span>
              <button
                onClick={handleCloseForm}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formVisible ? "bg-green-600" : "bg-gray-400"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formVisible ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
          )}
        </div>


        {formLink && (
          <div className="mt-4">
            <button
              onClick={handleCopyLink}
              className="bg-red-600 border border-gray-300 text-white px-6 py-2 rounded-4xl hover:bg-red-700 w-full"
            >
              Copy Registration Form Link
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default CreateRegistrationForm;
