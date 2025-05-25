import { Link } from "react-router-dom";
import { Calendar, BarChart3, Users, LayoutGrid, ShieldCheck, Shield, Zap, TrendingUp, DollarSign, UserPlus, CalendarDays, CheckCircle, Clock, Star } from 'lucide-react';
import { useState, useEffect } from "react";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [firstName, setFisrtName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [ticket, setTicket] = useState("General Admission $500");
  const [mail, setMail] = useState("john@example.com");

  const handleContinue = (e) => {
    e.preventDefault();
    setShowForm(true);
  };

  const [showForm, setShowForm] = useState(() => {
  const stored = localStorage.getItem("showForm");
  return stored === null ? true : stored === "true";
});

useEffect(() => {
  localStorage.setItem("showForm", showForm);
}, [showForm]);

  const recentRegistrations = [
    { name: 'Sarah Johnson', time: '2 minutes ago', role: 'VIP' },
    { name: 'Michael Chen', time: '5 minutes ago', role: 'Standard' },
    { name: 'Emma Davis', time: '8 minutes ago', role: 'Student' },
    { name: 'James Wilson', time: '12 minutes ago', role: 'VIP' },
    { name: 'Lisa Rodriguez', time: '15 minutes ago', role: 'Standard' },
  ];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'VIP':
        return 'bg-red-500 text-white';
      case 'Standard':
        return 'bg-gray-200 text-gray-800';
      case 'Student':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed bg-white backdrop-blur-md p-4 shadow-md w-full">
        <div className="container mx-auto flex items-center justify-between text-black">

          {/* Logo + Desktop Nav */}
          <div className="flex items-center space-x-8 ml-4">
            <h1 className="text-2xl font-bold whitespace-nowrap">Stagyn.io</h1>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2 hover:text-gray-700">
                <Calendar className="w-5 h-5" />
                <span>Events</span>
              </Link>
              <Link to="/" className="flex items-center space-x-2 hover:text-gray-700">
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </Link>
              <Link to="/" className="flex items-center space-x-2 hover:text-gray-700">
                <Users className="w-5 h-5" />
                <span>Attendees</span>
              </Link>
            </div>
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <Link to="/admin/login" className="hover:text-gray-700">Admin</Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-black text-2xl focus:outline-none"
            >
              &#9776;
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {menuOpen && (
          <div className="md:hidden flex flex-col items-start px-6 pt-4 space-y-4 text-black">
            <Link to="/" className="flex items-center space-x-2 hover:text-gray-700">
              <Calendar className="w-5 h-5" />
              <span>Events</span>
            </Link>
            <Link to="/" className="flex items-center space-x-2 hover:text-gray-700">
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
            <Link to="/" className="flex items-center space-x-2 hover:text-gray-700">
              <Users className="w-5 h-5" />
              <span>Attendees</span>
            </Link>
            <Link to="/" className="flex items-center space-x-2 hover:text-gray-700">
              <LayoutGrid className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link to="/admin/login" className="flex items-center space-x-2 hover:text-gray-700">
              <ShieldCheck className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="mt-14 flex flex-col items-center justify-center text-center p-8 md:p-12 bg-gradient-to-r from-black to-gray-800 text-white">
        <h2 className="text-3xl md:text-7xl font-bold mb-4">Welcome to Stagyn.io</h2>
        <p className="text-md md:text-2xl mt-2 max-w-2xl">
          Seamlessly register and manage attendees for your events with our QR-based system.
        </p>
        <div className="mt-6 space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
          <Link to="/login" className="px-12 py-3 bg-red-700 text-white font-semibold rounded-lg shadow hover:bg-red-800 transition">
            Login
          </Link>
          <Link to="/admin/register" className="px-6 py-3 bg-white text-black font-semibold rounded-lg shadow hover:bg-gray-200 transition">
            Create Your First Event
          </Link>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 md:px-20">

          <div
            className="mt-10 p-6 rounded-2xl shadow-md transform transition duration-300 hover:-translate-y-2 hover:shadow-xl text-center"
            style={{ backgroundColor: "rgba(245, 245, 245, 0.1)" }}
          >
            <BarChart3 className="mx-auto mb-4 w-15 h-15 text-red-500" />
            <h3 className="text-xl font-semibold mb-2 text-white">Real-Time Analytics</h3>
            <p className="text-gray-300">
              Get instant insights into registration patterns, attendee behavior, and event performance.
            </p>
          </div>

          <div
            className="mt-10 p-6 rounded-2xl shadow-md transform transition duration-300 hover:-translate-y-2 hover:shadow-xl text-center"
            style={{ backgroundColor: "rgba(245, 245, 245, 0.1)" }}
          >
            <Zap className="mx-auto mb-4 w-15 h-15 text-red-500" />
            <h3 className="text-xl font-semibold mb-2 text-white">Lightning Fast</h3>
            <p className="text-gray-300">
              Ultra-fast registration process with intelligent form optimization and instant confirmations.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="mt-10 p-6 rounded-2xl shadow-md transform transition duration-300 hover:-translate-y-2 hover:shadow-xl text-center"
            style={{ backgroundColor: "rgba(245, 245, 245, 0.1)" }}
          >
            <Shield className="mx-auto mb-4 w-15 h-15 text-red-500" />
            <h3 className="text-xl font-semibold mb-2 text-white">Enterprise Security</h3>
            <p className="text-gray-300">
              Bank-level security with GDPR compliance and advanced fraud detection.
            </p>
          </div>

        </section>

      </header>

      {/* Event Info Section */}
      <section className="container mx-auto text-center p-6 md:p-12">
        <h1 className=" text-3xl md:text-5xl font-bold mb-4">Powerful Analytics Dashboard</h1>
        <p className="text-sm md:text-lg max-w-3xl mx-auto text-gray-700">
          Get comprehensive insights into your events with our intelligent analytics platform. Make data-driven decisions to optimize your event success.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-black hover:-translate-y-2 transition duration-300">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-left">Total Events</h3>
              <CalendarDays className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-gray-600 text-sm">Monitor attendees as they check in real-time.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-black hover:-translate-y-2 transition duration-300">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-left">Registrations</h3>
              <UserPlus className="w-5 h-5 text-green-700" />
            </div>
            <p className="text-gray-600 text-sm">Track the total number of check-ins and no-shows.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-black hover:-translate-y-2 transition duration-300">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-left">Revenue</h3>
              <DollarSign className="w-5 h-5 text-red-700" />
            </div>
            <p className="text-gray-600 text-sm">See what devices users are using to interact.</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-black hover:-translate-y-2 transition duration-300">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-left">Conversion Rate</h3>
              <TrendingUp className="w-5 h-5 text-purple-700" />
            </div>
            <p className="text-gray-600 text-sm">Break down attendees by location, age, or role.</p>
          </div>
        </div>
      </section>

      <main className="p-6">
        <div className="bg-gradient-to-r from-gray-900 to-black text-white  px-6 py-4 rounded-md max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold">Event Performance Overview</h2>
          <p className="text-sm text-gray-300">Real-time insights for Tech Conference 2024</p>
        </div>

        {/* Combined Card with Reduced Width */}
        <div className="bg-white shadow-gray-400 p-6 rounded-md shadow mt-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registration Trends */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Registration Trends</h3>
              <div className="mt-10 flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 bg-gray-200 rounded">
                <TrendingUp className="w-20 h-20 text-red-500" />
                <p className="text-gray-500 mt-2">Interactive Chart Coming Soon</p>
              </div>
            </div>

            {/* Recent Registrations */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Registrations</h3>
              <ul className="space-y-4">
                {recentRegistrations.map((reg, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between border border-gray-100 p-3 rounded hover:shadow-sm"
                  >
                    <div>
                      <div className="font-medium">{reg.name}</div>
                      <div className="text-xs text-gray-500">{reg.time}</div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${getRoleBadgeColor(
                        reg.role
                      )}`}
                    >
                      {reg.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
            View Full Dashboard
          </button>
        </div>
      </main>

      <section className="flex flex-col items-center justify-center text-center px-4 py-8 md:py-16">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Seamless Registration Experience
        </h1>
        <p className="text-sm md:text-lg max-w-3xl text-gray-700">
          Our intelligent registration system adapts to your event needs,
          providing a smooth experience for both organizers and attendees.
        </p>
      </section>


      <section className="px-6 py-12 flex flex-col md:flex-row items-center justify-center gap-12">
        {/* Left Side – Registration Card */}
        <div className="bg-white max-w-md w-full rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-black text-white p-5">
            <h2 className="text-xl font-semibold">Tech Conference 2024</h2>
            <p className="text-sm text-gray-300">
              Join 500+ developers for the biggest tech event of the year
            </p>
          </div>
          {!showForm ? (
            <div className="bg-white shadow-xl rounded-lg max-w-md w-full overflow-hidden">
              {/* Success Content */}
              <div className="p-6 text-center">
                <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                <h3 className="text-2xl font-bold mb-2 text-gray-800">
                  Registration Complete!
                </h3>
                <p className="text-gray-600 mb-6">
                  Confirmation email sent to <span className="font-medium">{mail}</span>
                </p>

                {/* Event Details */}
                <div className="bg-gray-100 rounded-md p-4 text-left mb-6 space-y-1 ">
                  <p><b>Event Details:</b></p> <br />
                  <p><strong>Event:</strong> Tech Conference 2024</p>
                  <p><strong>Date:</strong> March 15–16, 2024</p>
                  <p><strong>Location:</strong> San Francisco Convention Center</p>
                  <p><strong>Ticket:</strong> Standard - {ticket}</p>
                </div>

                {/* Action */}
                <button
                  onClick={handleContinue}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 rounded-md transition font-semibold"
                >
                  Register Another Attendee
                </button>
              </div>
            </div>
          ) : (
            // Registration Form
            <form className="bg-white shadow-xl max-w-xl w-full mx-auto p-6 space-y-4 text-gray-700 rounded-lg" onSubmit={(e) => {
              e.preventDefault(); setShowForm(false)
            }}>
              <h2 className="text-2xl font-bold mb-4 text-center">Register Another Attendee</h2>

              <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex-1">
                  <label className="block mb-1 text-black font-semibold">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full px-4 py-2 border rounded"
                  value={firstName}
                  onChange={(e) => setFisrtName(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-black font-semibold">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full px-4 py-2 border rounded"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-black font-semibold">E-Mail</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border rounded"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 text-black font-semibold">Select Ticket</label>
                <select
                  className="w-full px-4 py-2 border rounded text-gray-600"
                  value={ticket}
                  onChange={(e) => setTicket(e.target.value)}
                >
                  <option>Select ticket type</option>
                  <option>General Admission $500</option>
                  <option>Speaker $299</option>
                  <option>VIP $799</option>
                </select>
              </div>

              <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold transition">
                Continue to Payment
              </button>
            </form>
          )}
        </div>

        <div className="space-y-6 max-w-lg">
          <div className="space-y-8">
            <Feature
              icon={<Clock className="w-12 h-12 p-3 text-white" />}
              title="Lightning Fast"
              description="Complete registration in under 60 seconds with our optimized form flow and smart field validation."
            />
            <Feature
              icon={<Star className="w-12 h-12 p-3 text-white" />}
              title="Smart Recommendations"
              description="AI-powered suggestions for ticket types, sessions, and add-ons based on attendee preferences."
            />
            <Feature
              icon={<CheckCircle className="w-12 h-12 p-3 text-white" />}
              title="Instant Confirmation"
              description="Immediate email confirmations with QR codes, calendar invites, and mobile wallet integration."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center p-4 mt-auto text-sm md:text-base">
        <p>&copy; 2025 AurelionFutureForge. All rights reserved.</p>
      </footer>
    </div>
  );
}
const Feature = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4 space-y-9">
    <div className="text-red-500 text-2xl bg-red-500 rounded-lg">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold ">{title}</h3>
      <p className="text-gray-500 text-sm ">{description}</p>
    </div>
  </div>
);


export default Home;
