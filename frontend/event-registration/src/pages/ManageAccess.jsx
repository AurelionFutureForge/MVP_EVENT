import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function ManageAccess() {
  const [privilegesList, setPrivilegesList] = useState([]);
  const [assignedPrivileges, setAssignedPrivileges] = useState([]);
  const [loading, setLoading] = useState(false); // To handle loading state
  const [prevLoading, setPrivLoading] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const companyName = localStorage.getItem("adminCompany");
  const eventId = localStorage.getItem("selectedEvent");

  // Fetch available privileges from EventDB on load
  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(`${BASE_URL}/admin/event-privileges`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { eventId } // We only need eventId in query params
        });

        const privilegesFromDB = response.data.privileges; // array of privilege names

        // Remove duplicates by using Set
        const uniquePrivileges = [...new Set(privilegesFromDB)];

        // Initialize assignedPrivileges with empty email/password for unique privileges
        const initialAssigned = uniquePrivileges.map(p => ({
          privilegeName: p,
          email: "",
          password: ""
        }));

        setPrivilegesList(uniquePrivileges); // Set unique privileges to state
        setAssignedPrivileges(initialAssigned);
      } catch (error) {
        toast.error("Failed to fetch privileges");
      }
    };

    fetchPrivileges();
  }, [BASE_URL, eventId]);

  const handleInputChange = (index, field, value) => {
    const updated = [...assignedPrivileges];
    updated[index][field] = value;
    setAssignedPrivileges(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");

    // Validation: Check if all fields are filled
    const isValid = assignedPrivileges.every((priv) => priv.email && priv.password);
    if (!isValid) {
      toast.error("Please fill all the fields.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/admin/assign-privileges`, {
        eventId, // Pass eventId here
        privileges: assignedPrivileges
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Privileges assigned successfully!");
      navigate("/admin/dashboard/:eventId");
    } catch (error) {
      toast.error("Failed to assign privileges");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setPrivLoading(true);
      await axios.delete(`${BASE_URL}/admin/delete-privileges/${eventId}`);
      toast.success("Privileges Deleted Successfully");
    } catch (error) {
      toast.error("Failed to delete the Privileges");
    } finally {
      setPrivLoading(false);
    }
  }

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

      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={handleSubmit}
          className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full md:w-auto ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading ? "Assigning..." : "Assign Privileges"}
        </button>

        <button
          onClick={handleDelete}
          className={`bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition w-full md:w-auto ${prevLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={prevLoading}
        >
          {prevLoading ? "Deleting" : "Delete Assigned Privileges"}
        </button>
      </div>


      </div>
    </div>
  );
}

export default ManageAccess;
