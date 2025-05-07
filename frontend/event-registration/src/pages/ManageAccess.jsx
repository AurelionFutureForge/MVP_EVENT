import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function ManageAccess() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [privileges, setPrivileges] = useState([{ privilegeName: "", email: "", password: "" }]);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const companyName = localStorage.getItem("adminCompany");

  // Fetch roles on load
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(`${BASE_URL}/admin/roles`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { companyName },
        });
        setRoles(response.data.roles);  // Setting the fetched roles
      } catch (error) {
        toast.error("Failed to fetch roles");
      }
    };

    fetchRoles();
  }, [BASE_URL, companyName]);

  const handlePrivilegeChange = (index, field, value) => {
    const newPrivileges = [...privileges];
    newPrivileges[index][field] = value;
    setPrivileges(newPrivileges);
  };

  const addPrivilegeField = () => {
    setPrivileges([...privileges, { privilegeName: "", email: "", password: "" }]);
  };

  const removePrivilegeField = (index) => {
    const newPrivileges = [...privileges];
    newPrivileges.splice(index, 1);
    setPrivileges(newPrivileges);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    const token = localStorage.getItem("adminToken");

    try {
      await axios.put(`${BASE_URL}/admin/assign-privileges`, {
        companyName,
        roleName: selectedRole,
        privileges,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Privileges assigned successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error("Failed to assign privileges");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Manage Access</h2>

        {/* Role selection */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700">Select Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Select Role --</option>
            {roles && roles.map((role, idx) => (
              <option key={idx} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Privilege fields */}
        {privileges.map((priv, index) => (
          <div key={index} className="border rounded p-4 mb-3 bg-gray-50 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Privilege Name"
                value={priv.privilegeName}
                onChange={(e) => handlePrivilegeChange(index, "privilegeName", e.target.value)}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={priv.email}
                onChange={(e) => handlePrivilegeChange(index, "email", e.target.value)}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="password"
                placeholder="Password"
                value={priv.password}
                onChange={(e) => handlePrivilegeChange(index, "password", e.target.value)}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>
            {privileges.length > 1 && (
              <button
                onClick={() => removePrivilegeField(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {/* Add Privilege button */}
        <button
          onClick={addPrivilegeField}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition w-full mb-4"
        >
          + Add Another Privilege
        </button>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full"
        >
          Assign Privileges
        </button>
      </div>
    </div>
  );
}

export default ManageAccess;
