import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";

function RegistrationForm() {
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);  // Track payment state
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
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev[name] || []), value]
          : (prev[name] || []).filter((v) => v !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentSuccess) {
      try {
        await axios.post(`${BASE_URL}/users/register`, {
          formData,
          eventID,
        });
        toast.success("Registration successful!");
        setFormData({});
        setPaymentSuccess(false); // Reset after registration
      } catch (error) {
        toast.error("Registration failed. Please try again.");
      }
    } else {
      toast.error("Please complete the payment before registering.");
    }
  };

  const handlePayment = () => {
    setPaymentSuccess(true);  // Simulate payment success
    toast.success("Payment successful! Now you can register.");
  };

  if (loading) return <div>Loading event details...</div>;
  if (!event) return <div>No event found.</div>;

  const otherFields = event.registrationFields.filter(
    (field) => field.fieldName !== "ROLE"
  );
  const roleField = event.registrationFields.find(
    (field) => field.fieldName === "ROLE"
  );

  // Determine button text based on form data
  const getButtonText = () => {
    if (paymentSuccess) {
      return "Register";
    }
    if (formData[roleField?.fieldName]) {
      const selectedRole = event.eventRoles?.find(
        (role) => role.roleName === formData[roleField.fieldName]
      );
      if (selectedRole) {
        return `Pay ₹${selectedRole.rolePrice}`;
      }
    }
    return "Register";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-xl rounded-2xl max-w-lg mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">
          Register for {event.eventName}
        </h2>

        <div className="text-center text-gray-600 mb-6">
          {event.startDate && (
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {new Date(event.startDate).toLocaleDateString()}
            </p>
          )}
          {event.place && (
            <p>
              <span className="font-semibold">Location:</span> {event.place}
            </p>
          )}
          {event.time && (
            <p>
              <span className="font-semibold">Time:</span> {event.time}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {otherFields.map((field, idx) => (
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

              {field.fieldType === "checkbox" && (
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
            </div>
          ))}

          {roleField && (
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                {roleField.fieldName.charAt(0).toUpperCase() + roleField.fieldName.slice(1)}{" "}
                {roleField.required && <span className="text-red-600">*</span>}
              </label>
              <div className="flex flex-col gap-3">
                {roleField.options.map((option, idx) => {
                  const matchingRole = event.eventRoles?.find(
                    (role) => role.roleName === option
                  );
                  const price = matchingRole?.rolePrice || 0;

                  return (
                    <label
                      key={idx}
                      className="flex flex-col border rounded p-3 hover:shadow transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={roleField.fieldName}
                          value={option}
                          checked={formData[roleField.fieldName] === option}
                          onChange={handleChange}
                          required={roleField.required}
                        />
                        <span className="font-medium">{option}</span>
                        <span className="text-sm text-blue-600 font-semibold ml-auto">
                          Pay ₹{price}
                        </span>
                      </div>
                      {matchingRole?.roleDescription && (
                        <p className="text-gray-600 text-sm mt-1 ml-6">
                          {matchingRole.roleDescription}
                        </p>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            className={`mt-4 px-4 py-2 rounded-lg w-full transition shadow ${
              paymentSuccess
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : formData[roleField?.fieldName]
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={paymentSuccess ? handleSubmit : handlePayment}
          >
            {getButtonText()}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegistrationForm;
