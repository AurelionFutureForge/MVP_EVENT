import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Menu, X } from 'lucide-react';
import { NavLink } from "react-router-dom";

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
    white : "bg-white"
  };

  const selectedColor = colors[color] || "bg-white";

  return (
    <div className={`rounded-xl shadow-md p-4 text-white ${selectedColor}`}>
      <h3 className="text-lg font-semibold text-black">{title}</h3>
      <p className="text-2xl font-bold mt-1 text-black">{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const companyName = localStorage.getItem("adminCompanyName");
  const selectedEvent = localStorage.getItem("selectedEvent");
  const [registrationFields, setRegistrationFields] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log(registrationFields);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("admin_token");
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

    const headers = [["S.No", "Name", "Email", "Role", "Contact", "Payment Status", "Date", "Privileges"]];

    const data = filteredUsers.map((user, index) => {
      const { name, email } = extractNameAndEmail(user.registrationData);
      const contact = extractContact(user.registrationData);
      const role = user.registrationData.role || user.registrationData.ROLE || "";
      const privileges = (user.privileges ?? []).length > 0
        ? user.privileges
          .map((p) => `${p.name?.toUpperCase()} (${p.claim ? "Claimed" : "Not Claimed"})`)
          .join(", ")
        : "No privileges assigned";

      // You can customize this based on actual field names
      const paymentStatus = user.registrationData.paymentStatus || "Not Available";
      const registeredDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "N/A";

      return [
        index + 1,
        name,
        email,
        role,
        contact,
        paymentStatus,
        registeredDate,
        privileges,
      ];
    });

    autoTable(pdf, {
      startY: 30,
      head: headers,
      body: data,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8, cellPadding: 4 },
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
  const uniqueRoles = [...new Set(users.map((u) => (u.registrationData?.role || u.registrationData.ROLE)).filter(Boolean))];

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

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const comp = companyName.toUpperCase();
  return (

<div className="flex flex-row h-screen bg-gradient-to-r from-black to-gray-800 w-full">
  {/* Sidebar */}
  <aside
    className={`fixed z-40 top-0 left-0 h-full w-64 bg-white text-black flex flex-col p-6 space-y-6 shadow-lg transform transition-transform duration-300 lg:static lg:translate-x-0 ${
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    }`}
  >
    <div className="text-2xl font-bold tracking-wide flex justify-between items-center">
      Stagyn.io
      <button
        onClick={() => setSidebarOpen(false)}
        className="lg:hidden p-1"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
    <nav className="flex flex-col gap-4 text-sm">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `w-full px-4 py-2 rounded flex items-center gap-2 transition-colors focus:outline-none ${isActive ? "bg-red-600 text-white" : "hover:bg-red-600"
          }`
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/create-event"
        className={({ isActive }) =>
          `w-full px-4 py-2 rounded flex items-center gap-2 transition-colors focus:outline-none ${isActive ? "bg-red-600 text-white" : "hover:bg-red-600 active:bg-red-600"
          }`
        }
      >
        Events
      </NavLink>
      <button
        onClick={handleLogout}
        className="hover:bg-red-600 w-full transition-colors px-4 py-2 rounded flex items-center gap-2 text-left focus:outline-none"
      >
        Logout
      </button>
    </nav>
  </aside>

  {/* Main Content Area */}
  <div className="flex-1 flex-col overflow-y-auto ml-2 mr-2 mb-2 sm:mr-0 sm:mb-5 sm:ml-3 md:ml-12 mt-2 lg:ml-20 sm:mt-8 lg:mr-12">
    {/* Header */}
    <header className="bg-transparent px-6 py-4 lg:flex justify-between lg:items-center text-white">
      <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
        <Menu className="w-6 h-6" />
      </button>
    </header>

      <div className="bg-white flex-1 flex flex-col p-6 shadow-xl w-full md:max-w-2xl xl:max-w-full">
        <h2 className="text-4xl font-extrabold text-black mb-2 text-center">
          Admin Dashboard
        </h2>
        <p className="text-center text-lg mb-6 text-black">
          Company:{" "}
          <span className="font-semibold text-black">{comp}</span>
        </p>

        {/* Event Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4 mb-6">
          <SummaryCard title="Total Registrations" value={totalRegistrations} color="blue" />
        </div>

        {/* Privilege Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(getPrivilegeSummary()).map(([privName, data], idx) => {
            const color =
              data.claimed === data.total
                ? "green"
                : data.claimed > 0
                  ? "yellow"
                  : "red";

            return (

              <SummaryCard
                key={idx}
                title={privName}
                value={`${data.claimed} / ${data.total} Claimed`}
                color={color}
              />
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-3 mb-4">
          <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 w-full sm:w-64 focus:ring-2 focus:ring-gray-400"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border rounded px-3 py-2 w-full lg:w-48 focus:ring-2 focus:ring-gray-400"
            >
              <option value="All">All Roles</option>
              {uniqueRoles.map((role, idx) => (
                <option key={idx} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end mb-4 relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-900 shadow"
              title="Menu"
            >
              <Menu size={24} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-12 bg-white rounded-lg shadow-lg w-56 z-50 flex flex-col border border-gray-200">
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 text-sm hover:bg-gray-300 text-left"
                >
                  📄 Download PDF
                </button>

                <button
                  onClick={() => navigate("/admin/manage-access")}
                  className="px-4 py-2 text-sm hover:bg-gray-300 text-left"
                >
                  🛠️ Manage Access
                </button>

                <button
                  onClick={() => navigate("/create-regform")}
                  className="px-4 py-2 text-sm hover:bg-gray-300 text-left"
                >
                  {registrationFields.length === 0 ? "📝 Create Registration Form" : "✏️ Edit Registration Form"}
                </button>

                <button
                  onClick={() => navigate("/manual-registration")}
                  className="px-4 py-2 text-sm hover:bg-gray-300 text-left"
                >
                  ➕ Manual Registration
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm hover:bg-gray-300 text-left text-red-600"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
       <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
  <table className="max-w-full divide-y divide-gray-200 text-sm 2xl:text-lg">
    {/* Table Head */}
    <thead className="bg-gray-900 text-white font-semibold">
      <tr>
        <th className="px-3 py-2 xl:px-4 2xl:py-3 2xl:px-5 w-12 text-center">S.NO</th>
        <th className="px-3 py-2 xl:px-4 2xl:py-3 2xl:px-5 w-28 text-center">Name</th>
        <th className="px-3 py-2 xl:px-4 2xl:py-3 2xl:px-5 w-40 text-center">Email</th>
        <th className="px-3 py-2 xl:px-4 2xl:py-3 2xl:px-5 w-20 text-center">Role</th>
        <th className="px-3 py-2 xl:px-4 2xl:py-3 2xl:px-5 w-28  text-center">Contact</th>
        <th className="px-3 py-2 xl:px-4 2xl:py-3 2xl:px-5 text-center">Privileges</th>
        <th className="px-3 py-2 xl:px-4 2xl:py-3 2xl:px-5 w-24 text-center">Payment</th>
        <th className="px-3 py-2 xl:px-4 2xl:py-3 2xl:px-5 w-28 text-center">Date</th>
        <th className="px-3 py-2 xl:px-4 2xl:py-3 2xl:px-5 w-28 text-center">Time</th>
      </tr>
    </thead>

    {/* Table Body */}
    <tbody className="divide-y divide-gray-200">
      {getFilteredUsers().map((user, index) => {
        const { name, email } = extractNameAndEmail(user.registrationData);
        const contact = extractContact(user.registrationData);
        const privileges = user.privileges ?? [];

        return (
          <tr
            key={index}
            className="hover:bg-gray-100 transition-colors"
          >
            <td className="px-4 py-3 font-medium">{index + 1}</td>
            <td className="px-4 py-3">{name}</td>
            <td className="px-4 py-3">{email}</td>
            <td className="px-4 py-3">{user.registrationData?.role || user.registrationData?.ROLE}</td>
            <td className="px-4 py-3">{contact}</td>

            <td className="px-4 py-3 max-w-lg">
              {privileges.length > 0 ? (
                <ul className="space-y-1 text-xs ">
                  {privileges.map((priv, idx) => (
                    <li key={idx} className="flex gap-1 items-center">
                      <span className="font-semibold">{priv.name?.toUpperCase()}</span> —
                      {priv.claim ? (
                        <span className="text-green-600 ml-1">Claimed</span>
                      ) : (
                        <span className="text-red-600 ml-1">Not Claimed</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500 italic text-xs">No privileges assigned</span>
              )}
            </td>

            <td className="px-4 py-3">{user.registrationData?.paymentStatus || "Not Paid"}</td>
            <td className="px-4 py-3">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
            <td className="px-4 py-3">{user.createdAt ? new Date(new Date(user.createdAt).getTime() + 5.5 * 60 * 60 * 1000).toTimeString().split(' ')[0]: "N/A"}</td>
          </tr>
        );
      })}

      {getFilteredUsers().length === 0 && (
        <tr>
          <td colSpan={8} className="text-center text-gray-500 py-4">
            No matching users found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>



        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePagination(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-400 text-white rounded-md mr-2"
          >
            Previous
          </button>
          <button
            onClick={() => handlePagination(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-400 text-white rounded-md"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}

export default AdminDashboard;
