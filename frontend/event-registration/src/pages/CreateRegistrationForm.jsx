import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

function CreateRegistrationForm() {
  const [fields, setFields] = useState([
    { fieldName: "", fieldType: "text", options: [], required: false },
  ]);
  const [eventName, setEventName] = useState("");
  const [formLink, setFormLink] = useState(""); // Store the form link

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const companyName = localStorage.getItem("adminCompany");

  // ✅ On component mount — Check if formLink is already stored
  useEffect(() => {
    const savedEventId = localStorage.getItem("eventId");
    if (savedEventId) {
      const link = `https://mvp-event.vercel.app/register/${savedEventId}`;
      setFormLink(link);
    }
  }, []);

  const handleFieldChange = (index, field, value) => {
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
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (!eventName || fields.some((field) => !field.fieldName)) {
      toast.error("Please fill out all required fields.");
      return;
    }

    const token = localStorage.getItem("adminToken");

    try {
      // Send request to save registration fields
      const response = await axios.post(
        `${BASE_URL}/events/save-registration-fields`,
        {
          companyName,
          eventName,
          registrationFields: fields,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const eventId = response.data.eventId;
      const link = `https://mvp-event.vercel.app/register/${eventId}`; // Generate the registration form link
      setFormLink(link); // Set the form link in state

      // ✅ Persist eventId so button stays visible on reload
      localStorage.setItem("eventId", eventId);

      // Reset form fields after successful submission
      setEventName("");
      setFields([{ fieldName: "", fieldType: "text", options: [], required: false }]);

      toast.success("Registration form fields updated successfully!");
    } catch (error) {
      toast.error("Failed to update registration form fields.");
    }
  };

  // Handle copy link action
  const handleCopyLink = () => {
    if (formLink) {
      navigator.clipboard.writeText(formLink);
      toast.success("Link copied to clipboard!");
    } else {
      toast.error("No link to copy.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Registration Form
        </h2>

        <div>
          <label className="block font-semibold">Event Name</label>
          <input
            type="text"
            placeholder="Enter Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="border rounded px-3 py-2 w-full mb-4"
          />

          {/* Info Box */}
          <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded p-3 mb-4 text-sm">
            <strong>Note:</strong> You don't need to create a field for{" "}
            <em>Role</em>. It will be automatically handled from the event roles.
          </div>
        </div>

        {fields.map((field, index) => (
          <div key={index} className="border rounded p-4 mb-3 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Field Name"
                value={field.fieldName}
                onChange={(e) => handleFieldChange(index, "fieldName", e.target.value)}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={field.fieldType}
                onChange={(e) => handleFieldChange(index, "fieldType", e.target.value)}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
                <option value="date">Date</option>
              </select>
            </div>

            {(field.fieldType === "select" || field.fieldType === "checkbox") && (
              <div className="mt-3">
                <label className="block font-semibold">Options (comma separated)</label>
                <input
                  type="text"
                  placeholder="Option 1, Option 2"
                  value={field.options.join(", ")}
                  onChange={(e) =>
                    handleFieldChange(index, "options", e.target.value.split(",").map((opt) => opt.trim()))
                  }
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            <div className="mt-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => handleFieldChange(index, "required", e.target.checked)}
                  className="mr-2"
                />
                Required
              </label>
            </div>

            <button
              type="button"
              onClick={() => removeField(index)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition mt-4"
            >
              Remove Field
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addField}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition w-full mt-4"
        >
          Add Another Field
        </button>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full mt-4"
        >
          Save Registration Form
        </button>

        {/* Displaying the registration form link and copy button */}
        {formLink && (
          <div className="mt-6">
            <button
              onClick={handleCopyLink}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 w-full"
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
