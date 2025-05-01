import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-hot-toast";
import axios from "axios";

function AdminScanner() {
  const location = useLocation();
  const [scanResult, setScanResult] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [scannerInstance, setScannerInstance] = useState(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Initialize scanner
  useEffect(() => {
    if (location.pathname !== "/admin/scanner") return;

    const scannerElement = document.getElementById("qr-reader");
    if (!scannerElement) return;

    // Clear any previous scanner
    if (scannerInstance) {
      scannerInstance.clear().then(() => setScannerInstance(null));
    }

    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 300, height: 300 },
    });

    scanner.render(
      async (decodedText) => {
        console.log("Scanned QR Code:", decodedText);

        // Prevent multiple scans
        scanner.clear().then(() => setScannerInstance(null));

        setScanResult(decodedText);
        await verifyAndClaimEntry(decodedText);
      },
      (error) => {
        if (error.name !== "NotFoundException") console.error(error);
      }
    );

    setScannerInstance(scanner);

    return () => {
      scanner.clear().then(() => setScannerInstance(null));
    };
  }, [location.pathname]);

  const verifyAndClaimEntry = async (qrCode) => {
    try {
      const token = localStorage.getItem("adminToken");

      // Verify QR Code
      const verifyResponse = await axios.post(
        `${BASE_URL}/scan/verify`,
        { qrCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (verifyResponse.data.status === "success") {
        setVerifiedUser(verifyResponse.data.user);

        // Immediately claim entry
        const claimResponse = await axios.post(
          `${BASE_URL}/scan/claim-entry`,
          { qrCode },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`Entry Claimed for ${verifyResponse.data.user.name}`);
      } else {
        toast.error(verifyResponse.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid QR Code or already used!");
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Error processing request");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">QR Code Scanner</h2>
        <div id="qr-reader" className="w-full border rounded-md shadow-md p-4"></div>

        {scanResult && verifiedUser && (
          <div className="mt-4 bg-gray-200 p-4 rounded-lg shadow-md">
            <p className="text-green-700 font-semibold">Scanned: {scanResult}</p>
            <div className="mt-2 bg-white p-3 rounded-md shadow">
              <h3 className="text-lg font-bold">
                {verifiedUser.name} ({verifiedUser.role})
              </h3>

              { (verifiedUser.role === "Speaker" || verifiedUser.role === "Delegate") && (
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => handleClaim("lunch")}
                    disabled={verifiedUser.hasClaimedLunch}
                    className={`w-full px-4 py-2 rounded shadow ${
                      verifiedUser.hasClaimedLunch
                        ? "bg-gray-400"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {verifiedUser.hasClaimedLunch ? "Lunch Claimed" : "Claim Lunch"}
                  </button>

                  <button
                    onClick={() => handleClaim("gift")}
                    disabled={verifiedUser.hasClaimedGift}
                    className={`w-full px-4 py-2 rounded shadow ${
                      verifiedUser.hasClaimedGift
                        ? "bg-gray-400"
                        : "bg-yellow-600 hover:bg-yellow-700 text-white"
                    }`}
                  >
                    {verifiedUser.hasClaimedGift ? "Gift Claimed" : "Claim Gift"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminScanner;
