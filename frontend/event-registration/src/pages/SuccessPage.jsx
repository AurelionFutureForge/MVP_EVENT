import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaClock, FaMapMarkerAlt, FaHome } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoiceTemplate from "./InvoiceTemplate";
import logo from '../assets/stagyn_black.png';
import { Link } from 'react-router-dom';

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
  return contactField ? registrationData[contactField] : "N/A";
}

function SuccessPage() {
  const navigate = useNavigate();
  const { eventID } = useParams();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [event, setEvent] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const transactionID = localStorage.getItem("transactionID");
  const [registeredUser, setRegisteredUser] = useState(null);


  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);

    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/${eventID}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Failed to fetch event:", error);
      }
    };

    const fetchRegisteredUsers = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/users/by-transaction/${transactionID}`
        );
        setRegisteredUser(response.data.user || null);
      } catch (error) {
        console.error("Failed to fetch registered users:", error);
      }
    };

    fetchEvent();
    fetchRegisteredUsers();

    return () => clearTimeout(timer);
  }, [eventID, BASE_URL, transactionID]);

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const sameDate =
    new Date(event.startDate).toLocaleDateString() ===
    new Date(event.endDate).toLocaleDateString();

  const EventName = event.eventName;

  const downloadInvoice = async () => {
    const invoiceElement = document.getElementById("invoice");
    if (!invoiceElement) return;

    const canvas = await html2canvas(invoiceElement);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("invoice.pdf");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black to-gray-800 px-4 py-10 sm:px-6 lg:px-8">
      <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 text-center w-full max-w-md md:max-w-lg transition duration-500 hover:scale-105">
        {/* Success Header */}
        <div className="flex flex-col items-center justify-center mb-6 space-y-2">
          <FaCheckCircle className="text-green-500 text-5xl" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 leading-snug text-center">
            Registration Successful for the event <br />
            <span className="block text-black">{event.eventName}</span>
          </h2>
        </div>

        {/* Event Info */}
        <div className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base">
          <p className="flex items-center justify-center mt-2 text-center">
            <FaClock className="mr-2 text-yellow-500" />
            <span>
              <span className="font-semibold">Date:</span>{" "}
              {sameDate
                ? new Date(event.startDate).toLocaleDateString()
                : `${new Date(event.startDate).toLocaleDateString()} - ${new Date(
                  event.endDate
                ).toLocaleDateString()}`}{" "}
              | {event.time} (IST)
            </span>
          </p>
          <p className="flex items-center justify-center mt-2">
            <FaMapMarkerAlt className="mr-2 text-pink-500" />
            <span className="text-center">{event.place}</span>
          </p>
        </div>

        {/* Registered User Info */}
        {registeredUser && (
          <div className="bg-gray-100 rounded-lg shadow-inner p-4 sm:p-5 md:p-6 text-left space-y-5 text-sm sm:text-base">
            <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-2 text-center">
              Your Registration Details
            </h3>
            <p className="mt-8">
              <strong>Name:</strong> {registeredUser.registrationData.NAME}
            </p>
            <p>
              <strong>Email:</strong> {registeredUser.registrationData.EMAIL}
            </p>
            <p>
              <strong>Contact:</strong>{" "}
              {extractContact(registeredUser.registrationData)}
            </p>
            <p>
              <strong>Role:</strong> {registeredUser.role}
            </p>
            <p className="text-sm sm:text-base break-words max-w-xs md:max-w-full">
              <strong>Transaction ID:</strong> {registeredUser.transactionId}
            </p>
            <p>
              <strong>Total Paid:</strong> ₹{registeredUser.registrationData.amount}
            </p>
            <p>
              <strong>Payment Status:</strong> {registeredUser.paymentStatus}
            </p>
          </div>
        )}

        {/* QR Code */}
        {registeredUser?.qrCode && (
          <div className="my-6 flex flex-col items-center justify-center text-center">
            <p className="font-semibold mb-2">QR Code</p>
            <QRCodeCanvas
              value={registeredUser.qrCode}
              size={160}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
          </div>
        )}

        {registeredUser && (
          <>
            <div
              id="invoice"
              style={{
                position: "absolute",
                left: "-9999px",
                top: "0",
                visibility: "visible",
                opacity: 1,
                zIndex: -9999,
              }}
            >
              <InvoiceTemplate user={registeredUser} />
            </div>

            <button
              onClick={downloadInvoice}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full"
            >
              Download Invoice
            </button>
          </>
        )}

        {/* Register Again Button */}
        <button
          onClick={() => navigate(`/${EventName}/register/${eventID}`)}
          className="mt-6 sm:mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full flex items-center justify-center transition duration-300 w-full"
        >
          <FaHome className="mr-2" />
          Register Again
        </button>
        <div className="mt-14 flex items-center justify-center gap-2">
          <span className="text-gray-600 text-sm mb-2">Powered by</span>
          <Link to="/">
            <img src={logo} alt="Powered by logo" className="h-12 object-contain" />
          </Link>
        </div>
        <div className="mt-4 text-center">
          <Link to="https://www.aurelionfutureforge.com/" target="_blank" rel="noopener noreferrer">
            <p className="text-gray-500 text-sm">@An Aurelion Product</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;
