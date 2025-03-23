import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";  

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(`${BASE_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        toast.error("Unauthorized! Please log in.");
        navigate("/admin/login");
      }
    };
    fetchUsers();
  }, [navigate]);

  //  Function to Download PDF
  const downloadPDF = () => {
    if (users.length === 0) {
      toast.error("No data available to download!");
      return;
    }

    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("Admin Dashboard Report", 14, 20);

    const headers = [["Name", "Email", "Role", "Contact"]];
    const data = users.map((user) => [
      user.name,
      user.email,
      user.role,
      user.contact,
    ]);

    //  Apply autoTable correctly
    autoTable(pdf, {
      startY: 30,
      head: headers,
      body: data,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },  // Blue header
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [240, 240, 240] },  // Light grey alternating rows
    });

    pdf.save("admin_dashboard.pdf");
    toast.success("PDF downloaded successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Admin Dashboard</h2>

        {/* ✅ Download Buttons */}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => navigate("/admin/scanner")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Scan QR Code
          </button>

          <button
            onClick={downloadPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Download PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Contact</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index} className="text-center border-b hover:bg-gray-100 transition">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">{user.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
