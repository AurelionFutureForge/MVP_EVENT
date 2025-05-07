import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function PrivilegeDashboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const privilegeName = localStorage.getItem("privilegeName");
  const token = localStorage.getItem("privilegeToken");

  useEffect(() => {
    if (!token || !privilegeName) {
      toast.error("Unauthorized access. Please login.");
      navigate("/privilege-login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/privilege/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch users");
      }
    };

    fetchUsers();
  }, [token, privilegeName, navigate, BASE_URL]);

  const handleScanQR = () => {
    // For now — navigate to scan page (we'll create later)
    navigate("/admin/scanner");
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Privilege Dashboard — <span className="text-blue-600">{privilegeName}</span>
      </h1>

      <button
        onClick={handleScanQR}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mb-4"
      >
        Scan QR to Claim {privilegeName}
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Contact</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">Claim Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="py-2 px-3">{user.name}</td>
                <td className="py-2 px-3">{user.email}</td>
                <td className="py-2 px-3">{user.contact}</td>
                <td className="py-2 px-3">{user.role}</td>
                <td className="py-2 px-3">
                  {user.claimed ? (
                    <span className="text-green-600 font-semibold">Claimed</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Not Claimed</span>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PrivilegeDashboard;
