import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const companyName = localStorage.getItem("adminCompany");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          toast.error("Unauthorized! Please log in.");
          navigate("/admin/login");
          return;
        }

        const response = await axios.get(`${BASE_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredUsers = response.data.filter(user => user.companyName === companyName);
        setUsers(filteredUsers);
      } catch (error) {
        toast.error("Failed to fetch users. Please try again.");
      }
    };

    fetchUsers();
  }, [navigate, companyName, BASE_URL]);

  const downloadPDF = () => {
    const filteredUsers = getFilteredUsers();
    if (filteredUsers.length === 0) {
      toast.error("No data available to download!");
      return;
    }

    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("Registered Users", 14, 20);

    const headers = [["Name", "Email", "Role", "Contact", "Entry Status", "Privileges"]];
    const data = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.contact,
      user.hasEntered ? "Entered" : "Not Entered",
      user.claimedPrivileges
        .map(p => `${p.name} (${p.claimed ? "Yes" : "No"})`)
        .join(", ")
    ]);

    autoTable(pdf, {
      startY: 30,
      head: headers,
      body: data,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    pdf.save("registered_users.pdf");
    toast.success("PDF downloaded successfully!");
  };

  const getFilteredUsers = () => {
    return users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  };

  const totalRegistrations = users.length;
  const totalEntries = users.filter(user => user.hasEntered).length;
  const uniqueRoles = [...new Set(users.map(u => u.role))];

  // Privilege stats
  const getPrivilegeStats = () => {
    const privilegeMap = {};
    users.forEach(user => {
      user.claimedPrivileges.forEach(priv => {
        if (!privilegeMap[priv.name]) {
          privilegeMap[priv.name] = { claimed: 0, total: 0 };
        }
        privilegeMap[priv.name].total++;
        if (priv.claimed) {
          privilegeMap[priv.name].claimed++;
        }
      });
    });
    return privilegeMap;
  };

  const privilegeStats = getPrivilegeStats();

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="bg-white p-6 shadow-xl rounded-2xl w-full max-w-7xl">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">Admin Dashboard</h2>
        <p className="text-center text-lg mb-6 text-gray-600">Company: <span className="font-semibold text-blue-600">{companyName}</span></p>

        {/* 📊 Event Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard title="Total Registrations" value={totalRegistrations} color="blue" />
          <SummaryCard title="Total Entries" value={totalEntries} color="green" />
          {Object.entries(privilegeStats).map(([privilege, stats], i) => (
            <SummaryCard
              key={i}
              title={`${privilege} Claimed`}
              value={`${stats.claimed}/${stats.total}`}
              color="purple"
            />
          ))}
        </div>

        {/* 🛠️ Actions */}
        <div className="flex flex-col md:flex-row md:justify-between gap-3 mb-4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64 focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-48 focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Roles</option>
              {uniqueRoles.map((role, idx) => (
                <option key={idx} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end w-full md:w-auto">
            <button
              onClick={() => navigate("/admin/scanner")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow"
            >
              Scan QR Code
            </button>

            <button
              onClick={downloadPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* 📋 Users Table */}
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-500 text-white text-sm">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Entry</th>
                <th className="p-3">Privileges</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredUsers().map((user, index) => (
                <tr key={index} className="text-center border-b hover:bg-gray-100 transition text-sm">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">{user.contact}</td>
                  <td className="p-3">
                    {user.hasEntered ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Entered</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Not Entered</span>
                    )}
                  </td>
                  <td className="p-3 flex flex-wrap justify-center gap-1">
                    {user.claimedPrivileges.map((priv, i) => (
                      <span key={i} className={`px-2 py-1 text-xs rounded-full ${priv.claimed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {priv.name} {priv.claimed ? "✅" : "❌"}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {getFilteredUsers().length === 0 && (
            <p className="text-center text-gray-500 py-4 text-sm">No matching users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// 📊 Summary Card component
function SummaryCard({ title, value, color }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-900",
    green: "bg-green-100 text-green-900",
    purple: "bg-purple-100 text-purple-900",
  };

  return (
    <div className={`${colorMap[color]} p-4 rounded-xl text-center shadow`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium">{title}</p>
    </div>
  );
}

export default AdminDashboard;
