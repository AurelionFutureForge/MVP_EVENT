import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);  
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);  

    try {
      const response = await axios.post(`${BASE_URL}/admin/login`, { email, password });

      localStorage.setItem("adminToken", response.data.token);
      toast.success("Login Successful!");

      navigate("/admin/dashboard");
    } catch (error) {
      toast.error("Invalid Credentials!");
    } finally {
      setLoading(false);  
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
      <div className="bg-white p-8 shadow-xl rounded-lg w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Admin Login</h2>

        <form onSubmit={handleLogin} className="space-y-5">
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

          <button
            type="submit"
            className={`w-full p-3 rounded-lg font-semibold transition transform hover:scale-105 
            ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
            disabled={loading}   
          >
            {loading ? "Logging in..." : "Login"} 
          </button>
        </form>

        <p className="text-gray-600 text-center mt-4 text-sm">
          Admin access only. Unauthorized users will be denied.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
