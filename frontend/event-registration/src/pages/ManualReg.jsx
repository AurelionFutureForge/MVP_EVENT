import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

function ManualReg() {
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [roleRegistrations, setRoleRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPaymentInitiated, setIsPaymentInitiated] = useState(false); // New state variable
  const [isPaymentButtonClicked, setIsPaymentButtonClicked] = useState(false); // Track button click
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const eventID = localStorage.getItem("selectedEvent");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/${eventID}`);
        setEvent(response.data);

        const regRes = await axios.get(`${BASE_URL}/users/${eventID}/role-registrations`);
        setRoleRegistrations(regRes.data);

        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch event details.");
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
      setFormData({
        ...formData,
        [name]: checked
          ? [...(formData[name] || []), value]
          : (formData[name] || []).filter((v) => v !== value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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

  if (loading) return <div>Loading event details...</div>;
  if (!event) return <div>No event found.</div>;

  const selectedRole = event?.eventRoles?.find(
    (role) => role.roleName === formData.role
  );

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
              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
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
          {event.registrationFields
            .filter((field) => field.fieldName !== "ROLE")
            .map((field, idx) => (
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
                  <div className="flex flex-wrap items-center gap-2">
                    {field.options.map((option, optionIdx) => (
                      <label key={optionIdx} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          name={field.fieldName}
                          value={option}
                          checked={formData[field.fieldName]?.includes(option) || false}
                          onChange={handleChange}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Select Role <span className="text-red-600">*</span>
            </label>
            <div className="flex flex-col gap-3">
              {event.eventRoles.map((role, idx) => {
                const remaining = Math.max(role.maxRegistrations - (roleRegistrations[role.roleName] || 0), 0);

                return (
                  <label
                    key={idx}
                    className="flex flex-col border rounded p-3 hover:shadow transition cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="role"
                        value={role.roleName}
                        checked={formData.role === role.roleName}
                        onChange={handleChange}
                        required
                        disabled={remaining <= 0}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{role.roleName}</div>
                        <div className="text-sm font-bold text-green-600">₹{role.rolePrice}</div>
                      </div>
                    </div>

                    {role.roleDescription && (
                      <p className="text-gray-600 text-sm mt-1 ml-6">{role.roleDescription}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm mt-2 ml-6 text-gray-700">
                      <span><strong>Max Slots:</strong> {role.maxRegistrations}</span>
                      <span className={remaining <= 0 ? "text-red-600 font-bold" : ""}>
                        <strong>Remaining:</strong> {remaining}
                      </span>
                    </div>

                    {remaining <= 0 && <span className="text-red-600 text-xs ml-2">(Sold Out)</span>}
                  </label>
                );
              })}
            </div>
          </div>

          {!isPaymentButtonClicked && selectedRole && (
            <button
              type="button"
              onClick={() => {
                setIsPaymentInitiated(true); // Set payment initiated to true when clicked
                setIsPaymentButtonClicked(true); // Hide the payment button after click
                toast.success(`Initiate payment for ₹${selectedRole.rolePrice}`);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow w-full mb-4"
            >
              Pay ₹{selectedRole.rolePrice}
            </button>
          )}

          <button
            type="submit"
            disabled={!isPaymentInitiated} // Disable Register button until payment is initiated
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow w-full"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default ManualReg;
