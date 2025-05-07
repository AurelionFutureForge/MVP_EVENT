import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function PrivilegeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState(""); // Added company name state
  const [eventName, setEventName] = useState(""); // Added event name state
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for required fields
    if (!companyName || !eventName) {
      toast.error("Please provide both Company Name and Event Name.");
      return;
    }

    try {
      // Send email, password, company name, and event name to backend
      const res = await axios.post(`${BASE_URL}/privilege/login`, { email, password, companyName, eventName });

      // Save the token and privilege name to localStorage
      localStorage.setItem("privilegeToken", res.data.token);
      localStorage.setItem("privilegeName", res.data.privilegeName);

      // Redirect to privilege dashboard
      toast.success("Login successful!");
      navigate("/privilege/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Privilege Login</h2>

        {/* Company Name Input */}
        <input
          type="text"
          placeholder="Company Name"
          className="border p-2 w-full mb-3 rounded"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />

        {/* Event Name Input */}
        <input
          type="text"
          placeholder="Event Name"
          className="border p-2 w-full mb-3 rounded"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          required
        />

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
  );
}

export default PrivilegeLogin;
