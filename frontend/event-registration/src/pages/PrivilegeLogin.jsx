import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function PrivilegeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send only email and password
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
      <div className="shadow-1xl rounded-3xl px-10 py-12 w-full max-w-2xl transition-all duration-300">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Privilege Login</h2>

          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full mb-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full mb-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Login Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default PrivilegeLogin;
