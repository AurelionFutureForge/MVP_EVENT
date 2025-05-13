import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

function ManualReg() {
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [roleRegistrations, setRoleRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Track payment
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

  const handlePayment = () => {
    setPaymentSuccess(true);
    toast.success("Payment successful! Now you can register.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentSuccess) {
      toast.error("Please complete the payment before registering.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/users/register`, {
        formData,
        eventID,
      });
      toast.success("Registration successful!");
      setFormData({});
      setPaymentSuccess(false);
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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="bg-gray-800 p-6 shadow-xl rounded-2xl max-w-4xl mx-auto flex">
        {/* Event Poster on the Left */}
        {event.companyPoster && (
          <div className="flex justify-center mr-6">
            <img
              src={`${BASE_URL}${event.companyPoster}`}
              alt="Company Poster"
              className="max-h-48 object-contain rounded-lg shadow-lg"
            />
          </div>
        )}
        {/* Form Section */}
        <div className="flex-1">
          <h2 className="text-4xl font-extrabold text-gray-200 mb-4 text-center">
            Register for {event.eventName}
          </h2>

          <div className="text-center text-gray-400 mb-6">
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
                  <label className="block text-gray-300 font-semibold mb-2">
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
                      className="border rounded-lg px-4 py-2 w-full bg-gray-700 text-white focus:outline-none"
                    />
                  )}

                  {field.fieldType === "email" && (
                    <input
                      type="email"
                      name={field.fieldName}
                      value={formData[field.fieldName] || ""}
                      onChange={handleChange}
                      required={field.required}
                      className="border rounded-lg px-4 py-2 w-full bg-gray-700 text-white focus:outline-none"
                    />
                  )}

                  {field.fieldType === "number" && (
                    <input
                      type="number"
                      name={field.fieldName}
                      value={formData[field.fieldName] || ""}
                      onChange={handleChange}
                      required={field.required}
                      className="border rounded-lg px-4 py-2 w-full bg-gray-700 text-white focus:outline-none"
                    />
                  )}

                  {field.fieldType === "select" && (
                    <select
                      name={field.fieldName}
                      value={formData[field.fieldName] || ""}
                      onChange={handleChange}
                      required={field.required}
                      className="border rounded-lg px-4 py-2 w-full bg-gray-700 text-white focus:outline-none"
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
                          <span className="text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            {/* Payment Button */}
            {formData.role && !paymentSuccess && (
              <button
                type="button"
                className="mt-4 px-4 py-2 rounded-lg w-full bg-green-600 text-white hover:bg-green-700"
                onClick={handlePayment}
              >
                Pay ₹{selectedRole?.rolePrice}
              </button>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={!paymentSuccess}
              className={`mt-4 px-4 py-2 rounded-lg w-full transition shadow ${
                paymentSuccess
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-600 text-white cursor-not-allowed"
              }`}
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ManualReg;
