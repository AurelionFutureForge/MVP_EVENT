import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AlertTriangle } from 'lucide-react'
import { useParams, useNavigate } from "react-router-dom";
import logo from '../assets/stagyn_black.png'
import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom';

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

      const checkRes = await axios.post(`${BASE_URL}/users/check-email`, {
        email: formData.EMAIL || formData.email,
        eventId: eventID,
      });

      if (checkRes.data.exists) {
        toast.error("You have already registered for this event with this email.");
        return;
      }

      const calculatedAmount = parseFloat((rolePrice * 1.025).toFixed(2));

      const updatedFormData = {
        ...formData,
        amount: calculatedAmount,
      };
      localStorage.setItem("formData", JSON.stringify(updatedFormData));
      localStorage.setItem("eventID", eventID);

      const res = await axios.post(`${BASE_URL}/api/phonepe/initiate-payment`, {
        amount: (rolePrice * 1.025).toFixed(2),
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
      toast.error("Fill all the required fields or Payment initiation failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-800 p-6 flex flex-col items-center justify-between">
      <div className="bg-white p-6 shadow-xl rounded-2xl max-w-2xl mx-auto">
        {event.companyPoster && (
          <div className="flex justify-center mb-4">
            <img
              src={event.companyPoster}
              alt="Company Poster"
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
        <br />
        <h2 className="text-4xl font-extrabold text-black mb-4 text-center">
          Register for {event.eventName}
        </h2>

        <div className="text-center text-gray-600 mb-6">
          {event.startDate && (
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {event.endDate &&
                !isNaN(new Date(event.endDate)) &&
                new Date(event.startDate).toLocaleDateString() !== new Date(event.endDate).toLocaleDateString()
                ? `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`
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

          {/* Role selection */}
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
                  const remaining = Math.max(
                    matchingRole?.maxRegistrations - (roleRegistrations[matchingRole?.roleName] || 0),
                    0
                  );

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
                          disabled={remaining <= 0}
                        />
                        <span className="font-medium">{option}</span>
                        <span className="text-sm text-blue-600 font-semibold ml-auto">
                          ₹{price}<span className="text-red-800">*</span>
                        </span>
                      </div>
                      {matchingRole?.roleDescription && (
                        <ul className="text-gray-600 text-sm mt-1 ml-6 list-disc pl-5">
                          {matchingRole.roleDescription.split(",").map((desc, index) => (
                            <li key={index}>{desc.trim()}</li>
                          ))}
                        </ul>
                      )}
                      {remaining <= 0 && (
                        <span className="text-red-600 text-xs ml-2">(Sold Out)</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Button */}
          {!paymentSuccess && formData[roleField?.fieldName] && (
            <>
              {selectedRole && (() => {
                const rolePrice = parseFloat(selectedRole.rolePrice);
                const platformFee = (rolePrice * 2.5) / 100;
                const totalAmount = rolePrice + platformFee;

                return (
                  <div className="mb-4 text-black font-medium space-y-1 text-md">
                    <p className="flex justify-between">
                      <span>Amount:</span>
                      <span>₹{rolePrice.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Platform Fee (2.5%):</span>
                      <span>₹{platformFee.toFixed(2)}</span>
                    </p>
                    <hr className="my-1 border-blue-300" />
                    <p className="flex justify-between font-semibold text-xl">
                      <span>Total:</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </p>

                    <button
                      type="button"
                      className="mt-4 px-4 py-2 rounded-lg w-full bg-red-600 text-white hover:bg-red-700"
                      onClick={handlePayment}
                    >
                      Pay ₹{totalAmount.toFixed(2)}
                    </button>
                    <div className="flex items-center justify-center space-x-2 mt-5">
                      <ShieldCheck className="w-7 h-7 text-green-600" />
                      <p className="font-semibold">Safe & Secure Payment</p>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="text-gray-600 text-sm mb-2">Powered by</span>
            <Link to="/">
              <img src={logo} alt="Powered by logo" className="h-12 object-contain" />
            </Link>
          </div>
        </form>
        <div className="mt-4 text-center">
          <Link to="https://www.aurelionfutureforge.com/" target="_blank" rel="noopener noreferrer">
            <p className="text-gray-500 text-sm">@An Aurelion Product</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;
