import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AlertTriangle } from 'lucide-react'
import { useParams, useNavigate } from "react-router-dom";

function RegistrationForm() {
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [roleRegistrations, setRoleRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formVisible, setFormVisible] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const { eventID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/${eventID}`);
        setEvent(response.data);

        // Check if toggleField or togglefield exists in event data
        if (
          !response.data.hasOwnProperty("toggleForm") &&
          !response.data.hasOwnProperty("toggleform")
        ) {
          setFormVisible(false);
        } else {
          setFormVisible(!response.data.toggleForm);
        }

        const regRes = await axios.get(
          `${BASE_URL}/users/${eventID}/role-registrations`
        );
        setRoleRegistrations(regRes.data);

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

  const handleSubmit = async (e = null) => {
    if (e) e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/users/register`, {
        formData,
        eventID,
      });
      toast.success("Registration successful!");
      setFormData({});
      setPaymentSuccess(false);
      navigate("/success", {
        state: {
          eventName: event?.eventName,
          place: event?.place,
          time: event?.time,
          startDate: event?.startDate,
          endDate: event?.endDate,
          eventID,
        },
      });
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-white mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <p className="text-lg">REG FROM...</p>
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M12 21.75C6.615 21.75 2.25 17.385 2.25 12S6.615 2.25 12 2.25 21.75 6.615 21.75 12 17.385 21.75 12 21.75z"
          />
        </svg>
        <p className="text-xl text-gray-300">No event found.</p>
      </div>
    );

  if (!formVisible)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 px-4">
        <div className="bg-white rounded-2xl p-10 shadow-2xl max-w-lg w-full text-center space-y-5">
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-600 p-4 rounded-full shadow-md">
              <AlertTriangle className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Oops! Form is Closed</h2>
          <p className="text-gray-600 text-base">
            We're sorry, but registration for this event is currently closed. Please check back later or contact the organizer for more info.
          </p>
          <button
            className="mt-4 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-full transition duration-200"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const otherFields = event.registrationFields.filter(
    (field) => field.fieldName !== "ROLE"
  );
  const roleField = event.registrationFields.find(
    (field) => field.fieldName === "ROLE"
  );
  const selectedRole = event.eventRoles?.find(
    (role) => role.roleName === formData[roleField?.fieldName]
  );
  const rolePrice = selectedRole?.rolePrice || 0;

  const handlePayment = async () => {
    if (!formData[roleField?.fieldName]) {
      toast.error("Please select a role before proceeding.");
      return;
    }

    try {
      localStorage.setItem("formData", JSON.stringify(formData));
      localStorage.setItem("eventID", eventID);

      const res = await axios.post(`${BASE_URL}/api/phonepe/initiate-payment`, {
        amount: rolePrice,
        email: formData.EMAIL,
        eventId: eventID,
      });

      const { redirectUrl } = res.data;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        toast.error("Failed to get PhonePe payment URL.");
      }
    } catch (err) {
      toast.error("Payment initiation failed.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <div className="bg-white p-6 shadow-xl rounded-2xl max-w-lg mx-auto">
        {event.companyPoster && (
          <div className="flex justify-center mb-4">
            <img
              src={`${BASE_URL}${event.companyPoster}`}
              alt="Company Poster"
              className="max-h-32 object-contain rounded-xl"
            />
          </div>
        )}

        <h2 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">
          Register for {event.eventName}
        </h2>

        <div className="text-center text-gray-600 mb-6">
          {event.startDate && (
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {event.endDate &&
                !isNaN(new Date(event.endDate)) &&
                new Date(event.startDate).toLocaleDateString() !==
                new Date(event.endDate).toLocaleDateString()
                ? `${new Date(event.startDate).toLocaleDateString()} - ${new Date(
                  event.endDate
                ).toLocaleDateString()}`
                : new Date(event.startDate).toLocaleDateString()}
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

        <form>
          {otherFields.map((field, idx) => (
            <div key={idx} className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                {field.fieldName.charAt(0).toUpperCase() +
                  field.fieldName.slice(1)}{" "}
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
                  <option value="">Select {field.fieldName}</option>
                  {field.options.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {field.fieldType === "checkbox" && (
                <div className="flex flex-wrap gap-2">
                  {field.options.map((option, optionIdx) => (
                    <label
                      key={optionIdx}
                      className="inline-flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        name={field.fieldName}
                        value={option}
                        checked={
                          formData[field.fieldName]
                            ? formData[field.fieldName].includes(option)
                            : false
                        }
                        onChange={handleChange}
                        className="form-checkbox"
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
                Select Role <span className="text-red-600">*</span>
              </label>
              <select
                name={roleField.fieldName}
                value={formData[roleField.fieldName] || ""}
                onChange={handleChange}
                required
                className="border rounded px-4 py-2 w-full"
              >
                <option value="">Select Role</option>
                {event.eventRoles.map((role, idx) => (
                  <option key={idx} value={role.roleName}>
                    {role.roleName} ({role.rolePrice} INR)
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>

        {!paymentSuccess ? (
          <button
            onClick={handlePayment}
            className="mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 w-full"
          >
            Pay {rolePrice} INR & Register
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded w-full"
          >
            Confirm Registration
          </button>
        )}
      </div>
    </div>
  );
}

export default RegistrationForm;
