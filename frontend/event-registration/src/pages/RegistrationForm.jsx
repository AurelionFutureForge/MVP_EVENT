import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";

function RegistrationForm() {
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const { eventID } = useParams();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/${eventID}`);
        setEvent(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch event details. Please try again.");
        setLoading(false);
      }
    };

    if (eventID) {
      fetchEventDetails();
    } else {
      toast.error("No event selected.");
      setLoading(false);
    }
  }, [eventID, BASE_URL]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    if (type === "checkbox") {
      // For checkboxes, update formData with selected values
      setFormData({
        ...formData,
        [name]: checked
          ? [...(formData[name] || []), value]
          : (formData[name] || []).filter((v) => v !== value),
      });
    } else {
      // For other fields (like text, email, etc.), update formData directly
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      await axios.post(`${BASE_URL}/users/register`, {
        formData,
        eventID,
      });
      toast.success("Registration successful!");
      setFormData({});
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading event details...</div>;
  }

  if (!event) {
    return <div>No event found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-xl rounded-2xl max-w-lg mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">
          Register for {event.eventName}
        </h2>

        <form onSubmit={handleSubmit}>
          {event.registrationFields.map((field, idx) => (
            <div key={idx} className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                {field.fieldName.charAt(0).toUpperCase() + field.fieldName.slice(1)}{" "}
                {field.required && <span className="text-red-600">*</span>}
              </label>

              {field.fieldType === "text" && (
                <input
                  type="text"
                  name={field.fieldName}
                  value={formData[field.fieldName] || ""}
                  onChange={handleChange}
                  required={field.required}
                  className="border rounded px-4 py-2 w-full"
                />
              )}

              {field.fieldType === "email" && (
                <input
                  type="email"
                  name={field.fieldName}
                  value={formData[field.fieldName] || ""}
                  onChange={handleChange}
                  required={field.required}
                  className="border rounded px-4 py-2 w-full"
                />
              )}

              {field.fieldType === "number" && (
                <input
                  type="number"
                  name={field.fieldName}
                  value={formData[field.fieldName] || ""}
                  onChange={handleChange}
                  required={field.required}
                  className="border rounded px-4 py-2 w-full"
                />
              )}

              {field.fieldType === "select" && (
                <select
                  name={field.fieldName}
                  value={formData[field.fieldName] || ""}
                  onChange={handleChange}
                  required={field.required}
                  className="border rounded px-4 py-2 w-full"
                >
                  <option value="">Select an option</option>
                  {field.options.map((option, optionIdx) => (
                    <option key={optionIdx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {/* Dynamic checkbox handling for other checkbox fields */}
              {field.fieldType === "checkbox" && field.fieldName !== "ROLE" && (
                <div className="flex flex-col gap-2">
                  {field.options.map((option, idx) => (
                    <label key={idx} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={field.fieldName}
                        value={option}
                        checked={formData[field.fieldName]?.includes(option) || false}
                        onChange={handleChange}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Handling radio buttons for 'ROLE' field specifically */}
              {field.fieldType === "checkbox" && field.fieldName === "ROLE" && (
                <div className="flex flex-col gap-2">
                  {field.options.map((option, idx) => (
                    <label key={idx} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={field.fieldName}
                        value={option}
                        checked={formData[field.fieldName] === option || false}
                        onChange={handleChange}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow w-full"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegistrationForm;
