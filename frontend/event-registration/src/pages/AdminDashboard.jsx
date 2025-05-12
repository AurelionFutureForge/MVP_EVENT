import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Utility to dynamically extract name & email from registrationData
function extractNameAndEmail(registrationData = {}) {
  const nameField = Object.keys(registrationData).find((key) =>
    key.toLowerCase().includes("name")
  );
  const emailField = Object.keys(registrationData).find((key) =>
    key.toLowerCase().includes("mail")
  );

  const name = nameField ? registrationData[nameField] : "";
  const email = emailField ? registrationData[emailField] : "";

  return { name, email };
}

// Utility to dynamically extract contact from registrationData
function extractContact(registrationData = {}) {
  const contactField = Object.keys(registrationData).find((key) => {
    const lowerKey = key.toLowerCase();
    return (
      lowerKey.includes("contact") ||
      lowerKey.includes("mobile") ||
      lowerKey.includes("phone") ||
      lowerKey.includes("number")
    );
  });

  const contact = contactField ? registrationData[contactField] : "";
  return contact;
}

function SummaryCard({ title, value, color }) {
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    gray: "bg-gray-500",
  };

  const selectedColor = colors[color] || "bg-gray-500";

  return (
    <div className={`rounded-xl shadow-md p-4 text-white ${selectedColor}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for menu visibility
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const companyName = localStorage.getItem("adminCompany");
  const selectedEvent = localStorage.getItem("selectedEvent");
  const [registrationFields, setRegistrationFields] = useState([]);

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
          params: { companyName, eventId: selectedEvent, page: currentPage, limit: 10 },
        });

        const filteredUsers = response.data.users || [];
        setUsers(filteredUsers);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        toast.error("Failed to fetch users. Please try again.");
      }
    };

    fetchUsers();
  }, [navigate, companyName, selectedEvent, currentPage, BASE_URL]);

  const downloadPDF = () => {
    const filteredUsers = getFilteredUsers();
    if (filteredUsers.length === 0) {
      toast.error("No data available to download!");
      return;
    }

    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("Registered Users", 14, 20);

    const headers = [["Name", "Email", "Role", "Contact", "Privileges"]];

    const data = filteredUsers.map((user) => {
      const { name, email } = extractNameAndEmail(user.registrationData);
      const contact = extractContact(user.registrationData);
      const privileges = (user.privileges ?? []).length > 0
        ? user.privileges
          .map(
            (p) =>
              `${p.name?.toUpperCase()} (${p.claim ? "Claimed" : "Not Claimed"})`
          )
          .join(", ")
        : "No privileges assigned";

      return [name, email, user.registrationData.role, contact, privileges];
    });

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
      const { name, email } = extractNameAndEmail(user.registrationData);
      const role = user.registrationData?.role || user.registrationData?.ROLE || "";
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || role === roleFilter;
      return matchesSearch && matchesRole;
    });
  };

  const getPrivilegeSummary = () => {
    const summary = {};

    users.forEach((user) => {
      (user.privileges ?? []).forEach((priv) => {
        const name = priv.name?.toUpperCase();
        if (!name) return;

        if (!summary[name]) {
          summary[name] = { claimed: 0, total: 0 };
        }
        summary[name].total += 1;
        if (priv.claim) {
          summary[name].claimed += 1;
        }
      });
    });

    return summary;
  };

  const totalRegistrations = users.length;
  const uniqueRoles = [...new Set(users.map((u) => u.registrationData?.role).filter(Boolean))];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminCompany");
    toast.success("Logged out successfully!");
    navigate("/admin/login");
  };

  const handlePagination = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/admin/event-reg`, {
          params: { eventId: selectedEvent },
        });

        console.log('API Response:', response.data); // Check the full response

        // Make sure the data structure matches what you expect
        if (response.data.registrationFields) {
          setRegistrationFields(response.data.registrationFields);
        } else {
          console.warn('No registrationFields found in the response');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        toast.error("Failed to fetch event details");
      }
    };
    fetchEventDetails();
  }, [companyName, selectedEvent]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      {/* Hamburger Menu */}
      <div className="sm:hidden flex justify-between w-full mb-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-2xl text-gray-800"
        >
          &#9776; {/* Hamburger Icon */}
        </button>
      </div>

      {/* Side Menu (Only visible when isMenuOpen is true) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-4 transition-transform transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } sm:hidden`}
      >
        <button
          onClick={() => setIsMenuOpen(false)}
          className="text-2xl text-gray-800 absolute top-4 right-4"
        >
          &#10005; {/* Close Icon */}
        </button>
        <div className="flex flex-col gap-4 mt-8">
          <button
            onClick={() => navigate("/admin/manage-access")}
            className="text-lg text-blue-600"
          >
            Manage Access
          </button>
          <button
            onClick={() => navigate("/create-regform")}
            className="text-lg text-blue-600"
          >
            {registrationFields.length === 0 ? "Create Registration Form" : "Edit Registration Form"}
          </button>
          <button
            onClick={() => navigate("/manual-registration")}
            className="text-lg text-blue-600"
          >
            Manual Registration
          </button>
          <button
            onClick={handleLogout}
            className="text-lg text-gray-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="bg-white p-6 shadow-xl rounded-2xl w-full max-w-7xl">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">
          Admin Dashboard
        </h2>
        <p className="text-center text-lg mb-6 text-gray-600">
          Company:{" "}
          <span className="font-semibold text-blue-600">{companyName}</span>
        </p>
        {/* Navigation and Other Content */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-6">
            <button
              onClick={() => navigate("/admin/manage-access")}
              className="text-lg text-blue-600"
            >
              Manage Access
            </button>
            <button
              onClick={() => navigate("/create-regform")}
              className="text-lg text-blue-600"
            >
              {registrationFields.length === 0
                ? "Create Registration Form"
                : "Edit Registration Form"}
            </button>
            <button
              onClick={() => navigate("/manual-registration")}
              className="text-lg text-blue-600"
            >
              Manual Registration
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="text-lg text-gray-600"
          >
            Logout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <SummaryCard
            title="Total Registrations"
            value={totalRegistrations}
            color="blue"
          />
          <SummaryCard
            title="Unique Roles"
            value={uniqueRoles.length}
            color="green"
          />
          <SummaryCard
            title="Total Privileges"
            value={Object.keys(getPrivilegeSummary()).length}
            color="yellow"
          />
        </div>

        {/* Filter and Pagination */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="All">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Download PDF
          </button>
        </div>

        {/* User Table (with pagination) */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Role</th>
                <th className="py-2 px-4">Contact</th>
                <th className="py-2 px-4">Privileges</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredUsers().map((user) => (
                <tr key={user._id}>
                  <td className="py-2 px-4">{user.registrationData.name}</td>
                  <td className="py-2 px-4">{user.registrationData.email}</td>
                  <td className="py-2 px-4">{user.registrationData.role}</td>
                  <td className="py-2 px-4">{extractContact(user.registrationData)}</td>
                  <td className="py-2 px-4">{user.privileges?.map(priv => priv.name).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => handlePagination(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Previous
          </button>
          <div className="text-lg">{`Page ${currentPage} of ${totalPages}`}</div>
          <button
            onClick={() => handlePagination(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

