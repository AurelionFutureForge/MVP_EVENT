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

  const handlePayment = async () => {
    if (!formData.role) {
      toast.error("Please select a role before proceeding.");
      return;
    }

    try {
      const selectedRoleData = event.eventRoles.find(role => role.roleName === formData.role);
      const amount = selectedRoleData.rolePrice;

      // Save formData temporarily in localStorage (so you can use it after redirect)
      localStorage.setItem("formData", JSON.stringify(formData));
      localStorage.setItem("eventID", eventID);

      const res = await axios.post(`${BASE_URL}/api/phonepe/initiate-payment`, {
        amount, email: formData.email, eventId: eventID
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

  const handleSubmit = async () => {
    try {
      await axios.post(`${BASE_URL}/users/register`, {
        formData,
        eventID,
      });
      toast.success("Registration successful!");
      setFormData({});
      setPaymentSuccess(false);
      localStorage.removeItem("formData");
      localStorage.removeItem("eventID");
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
    <div className="min-h-screen bg-black p-6">
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

        <form className="space-y-6">
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
                    className="border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {field.fieldType === "email" && (
                  <input
                    type="email"
                    name={field.fieldName}
                    value={formData[field.fieldName] || ""}
                    onChange={handleChange}
                    required={field.required}
                    className="border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {field.fieldType === "number" && (
                  <input
                    type="number"
                    name={field.fieldName}
                    value={formData[field.fieldName] || ""}
                    onChange={handleChange}
                    required={field.required}
                    className="border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {field.fieldType === "select" && (
                  <select
                    name={field.fieldName}
                    value={formData[field.fieldName] || ""}
                    onChange={handleChange}
                    required={field.required}
                    className="border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
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
                    className="flex flex-col border rounded-xl p-3 hover:shadow-lg transition cursor-pointer"
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

          {/* Payment Button */}
          {formData.role && !paymentSuccess && (
            <button
              type="button"
              className="mt-4 px-4 py-2 rounded-xl w-full bg-green-600 text-white hover:bg-green-700"
              onClick={handlePayment}
            >
              Pay ₹{selectedRole?.rolePrice}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default ManualReg;
