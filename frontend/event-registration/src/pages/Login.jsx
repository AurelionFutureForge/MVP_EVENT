import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("admin");
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send login request to the backend
      if (role == "admin") {
        const response = await axios.post(`${BASE_URL}/admin/login`, { email, password });

        // Store the admin token and company name in localStorage
        localStorage.setItem("admin_token", response.data.token);
        localStorage.setItem("adminCompanyName", response.data.admin.companyName);

        // Success message
        toast.success("Login Successful!");

        // Redirect to the dashboard after login
        navigate("/event-list");
      } else {
        const res = await axios.post(`${BASE_URL}/privilege/login`, {
          email,
          password,
        });

        // Save auth data returned from backend
        localStorage.setItem("privilegeToken", res.data.token);
        localStorage.setItem("privilegeName", res.data.privilegeName);
        localStorage.setItem("eventId", res.data.eventId);
        localStorage.setItem("companyName", res.data.companyName);
        localStorage.setItem("eventName", res.data.eventName);

        toast.success("Login successful!");
        navigate("/privilege/dashboard");
      }

    } catch (error) {
      // Handle invalid credentials
      toast.error("Invalid Credentials!");
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
      <div className="bg-white p-8 shadow-xl rounded-lg w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">LOGIN</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 font-medium">Login As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            >
              <option value="admin">Admin</option>
              <option value="privilege">Privilege</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg font-semibold transition transform hover:scale-105 
            ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-gray-600 text-center mt-4 text-sm">
          Choose your role to proceed. Unauthorized access will be denied.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
