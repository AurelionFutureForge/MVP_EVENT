import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function ManageAccess() {
  const [privilegesList, setPrivilegesList] = useState([]);
  const [assignedPrivileges, setAssignedPrivileges] = useState([]);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const companyName = localStorage.getItem("adminCompany");

  // Fetch available privileges from EventDB on load
  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(`${BASE_URL}/admin/event-privileges`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { companyName },
        });
        const privilegesFromDB = response.data.privileges; // array of privilege names

        // Initialize assignedPrivileges with empty email/password
        const initialAssigned = privilegesFromDB.map(p => ({
          privilegeName: p,
          email: "",
          password: ""
        }));
        setPrivilegesList(privilegesFromDB);
        setAssignedPrivileges(initialAssigned);

      } catch (error) {
        toast.error("Failed to fetch privileges");
      }
    };

    fetchPrivileges();
  }, [BASE_URL, companyName]);

  const handleInputChange = (index, field, value) => {
    const updated = [...assignedPrivileges];
    updated[index][field] = value;
    setAssignedPrivileges(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("adminToken");

    try {
      await axios.post(`${BASE_URL}/admin/assign-privileges`, {
        companyName,
        privileges: assignedPrivileges,
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

        {assignedPrivileges.map((priv, index) => (
          <div key={index} className="border rounded p-4 mb-3 bg-gray-50">
            <p className="font-semibold text-gray-700 mb-2">Privilege: {priv.privilegeName}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Enter Email"
                value={priv.email}
                onChange={(e) => handleInputChange(index, "email", e.target.value)}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="password"
                placeholder="Enter Password"
                value={priv.password}
                onChange={(e) => handleInputChange(index, "password", e.target.value)}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        ))}

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
