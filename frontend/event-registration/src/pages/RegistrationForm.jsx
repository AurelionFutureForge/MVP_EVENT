import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

function RegistrationForm() {
  const [formData, setFormData] = useState({ name: "", email: "", eventName:"", contact: "", role: "Visitor", paymentCompleted: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  console.log(BASE_URL);

  const validate = (isPayment = false) => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = "Name is required";
    if (!formData.email) tempErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) tempErrors.email = "Invalid email format";
    if (!formData.contact) tempErrors.contact = "Contact number is required";
    else if (!/^\d{10}$/.test(formData.contact)) tempErrors.contact = "Invalid contact number";
    if(!formData.eventName) tempErrors.eventName = "Event Name is required";

    // Only validate payment when submitting the form, not when making a payment
    if (!isPayment && !formData.paymentCompleted) {
      tempErrors.payment = "Payment is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = () => {
    if (!validate(true)) {  // Pass true to skip payment validation
      toast.error("Please correct the highlighted errors before proceeding.");
      return;
    }
    toast.success("Payment successful! You can now register.");
    setFormData((prev) => ({ ...prev, paymentCompleted: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;  // Normal validation, includes payment check
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/users/register`, formData);
      
      if (!response.data || !response.data.qrCode) {
        throw new Error("QR Code not received");
      }

      const { name, email, qrCode } = response.data;
      toast.success("Registration successful!");

      navigate("/success", { state: { name, email, eventName, qrCodeUrl: qrCode } });
    } catch (error) {
      toast.error("Registration failed. Try again.");
      console.error("Error:", error);
    }
    setLoading(false);
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Event Registration</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Event Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.eventName} 
            onChange={handleChange} 
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
          />
          {errors.eventName && <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Contact No</label>
          <input 
            type="text" 
            name="contact" 
            value={formData.contact} 
            onChange={handleChange} 
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
          />
          {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Role</label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange} 
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="Visitor">Visitor</option>
            <option value="Speaker">Speaker</option>
          </select>
        </div>

        {!formData.paymentCompleted ? (
          <button 
            type="button" 
            onClick={handlePayment} 
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            Pay Now
          </button>
        ) : (
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        )}
      </form>
    </div>
  );
}

export default RegistrationForm;
