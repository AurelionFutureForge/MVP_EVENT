import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Html5QrcodeScanner } from "html5-qrcode";

function AdminScanner() {
  const location = useLocation();
  const [scannerInstance, setScannerInstance] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [privileges, setPrivileges] = useState({});
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const startScanner = () => {
    const scannerElement = document.getElementById("qr-reader");
    if (!scannerElement) return;
    scannerElement.innerHTML = ""; // Clear previous scanner view

    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 300, height: 300 },
    });

    scanner.render(
      async (decodedText) => {
        console.log("Scanned QR Code:", decodedText);
        setScanResult(decodedText);
        await verifyQRCode(decodedText);
        scanner.clear(); // Stop scanner after first scan
        setScannerActive(false);
      },
      (error) => {
        if (error.name !== "NotFoundException") console.error(error);
      }
    );

    setScannerInstance(scanner);
    setScannerActive(true);
  };

  useEffect(() => {
    if (location.pathname === "/admin/scanner") {
      startScanner();
    }

    return () => {
      if (scannerInstance) {
        scannerInstance.clear();
      }
    };
  }, [location.pathname]);

  const verifyQRCode = async (qrCode) => {
    try {
      const token = localStorage.getItem("adminToken");
      console.log("admin token:",token)
      const response = await axios.post(
        `${BASE_URL}/scan/verify`,
        { qrCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setVerifiedUser(response.data.user);
        setPrivileges(response.data.privileges); // Set privileges dynamically based on user and event
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Invalid QR Code or already used!");
    }
  };

  const handleClaim = async (type) => {
    if (!scanResult) return toast.error("Scan a QR Code first!");

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `${BASE_URL}/scan/claim-${type}`,
        { qrCode: scanResult },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      setVerifiedUser((prev) => ({
        ...prev,
        [`hasClaimed${type.charAt(0).toUpperCase() + type.slice(1)}`]: true,
      }));
      setPrivileges((prev) => ({
        ...prev,
        [`canClaim${type.charAt(0).toUpperCase() + type.slice(1)}`]: false, // Disable the claim option after it's claimed
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error processing request");
    }
  };

  const handleScanNext = () => {
    setScanResult(null);
    setVerifiedUser(null);
    setPrivileges({}); // Reset privileges
    startScanner(); // Restart scanner
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">QR Code Scanner</h2>
        <div id="qr-reader" className="w-full border rounded-md shadow-md p-4"></div>

        {verifiedUser && (
          <div className="mt-4 bg-gray-200 p-4 rounded-lg shadow-md">
            <div className="mt-2 bg-white p-3 rounded-md shadow">
              <h3 className="text-lg font-bold">
                {verifiedUser.name} ({verifiedUser.role})
              </h3>

              {verifiedUser.role === "Speaker" && (
                <div className="mt-4 space-y-3">
                  {privileges.canClaimLunch && (
                    <button
                      onClick={() => handleClaim("lunch")}
                      className={`w-full px-4 py-2 rounded shadow ${
                        privileges.canClaimLunch
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {verifiedUser.hasClaimedLunch ? "Lunch Claimed" : "Claim Lunch"}
                    </button>
                  )}

                  {privileges.canClaimGift && (
                    <button
                      onClick={() => handleClaim("gift")}
                      className={`w-full px-4 py-2 rounded shadow ${
                        privileges.canClaimGift
                          ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {verifiedUser.hasClaimedGift ? "Gift Claimed" : "Claim Gift"}
                    </button>
                  )}
                </div>
              )}

              {/* Scan Next QR Button */}
              <button
                onClick={handleScanNext}
                className="mt-4 w-full px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white shadow"
              >
                Scan Next QR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminScanner;
