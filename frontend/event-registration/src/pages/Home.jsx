import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center text-white">
          <h1 className="text-2xl font-bold">EventMVP</h1>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-gray-200">Home</Link>
            <Link to="/admin/login" className="hover:text-gray-200">Admin</Link>
          </div>
          <div className="md:hidden">
            <button className="text-white text-2xl">&#9776;</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center text-center p-8 md:p-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Welcome to EventMVP</h2>
        <p className="text-md md:text-lg max-w-2xl">
          Seamlessly register and manage attendees for your events with our QR-based system.
        </p>
        <div className="mt-6 space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
          <Link to="/login" className="px-12 py-3 bg-blue-700 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition">
           Login 
          </Link>
          <Link to="/admin/register" className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition">
            Create Event
          </Link>
        </div>
      </header>

      {/* Event Info Section */}
      <section className="container mx-auto text-center p-6 md:p-12">
        <h3 className="text-2xl md:text-3xl font-semibold mb-4">Why Choose EventMVP?</h3>
        <p className="text-sm md:text-lg max-w-3xl mx-auto text-gray-700">
          EventMVP is a powerful event management system that allows easy attendee registration, QR-based check-ins, 
          and seamless event tracking. Whether you're an organizer or a participant, our system ensures a hassle-free experience.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center p-4 mt-auto text-sm md:text-base">
        <p>&copy; 2025 EventMVP. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
