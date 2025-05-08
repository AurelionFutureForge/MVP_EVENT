import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

function AdminRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Register admin and get token and company details
      const response = await axios.post(`${BASE_URL}/admin/register`, { email, password, companyName });
  
      // Store token and company details in localStorage (log the user in)
      localStorage.setItem("admin_token", response.data.token);
      localStorage.setItem("adminCompanyName", response.data.companyName);
  
      toast.success("Admin registered successfully!");
      
      // After successful registration, redirect to create-event page
      navigate("/create-event");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
      <div className="bg-white p-8 shadow-xl rounded-lg w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Admin Registration</h2>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Company Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder="Enter your company name"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`w-full p-3 rounded-lg font-semibold transition transform hover:scale-105 
            ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Link to navigate to the login page if already registered */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already registered?{" "}
            <Link to="/event-login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
