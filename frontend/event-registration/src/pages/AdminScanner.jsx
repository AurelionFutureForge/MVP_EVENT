import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-hot-toast";
import axios from "axios";

function AdminScanner() {
  const location = useLocation();
  const [scannerInstance, setScannerInstance] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (location.pathname !== "/admin/scanner") return;

    const scannerElement = document.getElementById("qr-reader");
    if (!scannerElement || scannerInstance) return;
    scannerElement.innerHTML = ""; // Clear previous scanner

    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 300, height: 300 },
    });

    setScannerInstance(scanner);

    scanner.render(
      async (decodedText) => {
        console.log("Scanned QR Code:", decodedText);
        setScanResult(decodedText);
        await verifyQRCode(decodedText);
      },
      (error) => {
        if (error.name !== "NotFoundException") console.error(error);
      }
    );

    return () => {
      scanner.clear();
    };
  }, [location.pathname]);

  const verifyQRCode = async (qrCode) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `${BASE_URL}/scan/verify`,
        { qrCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        setVerifiedUser(response.data.user);
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

              <div className="mt-4 space-y-3">
                {/* Entry Button - Common for All */}
                <button
                  onClick={() => handleClaim("entry")}
                  disabled={verifiedUser.hasEntered}
                  className={`w-full px-4 py-2 rounded shadow ${
                    verifiedUser.hasEntered
                      ? "bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {verifiedUser.hasEntered ? "Entry Claimed" : "Claim Entry"}
                </button>

                {/* Speaker-specific options */}
                {(verifiedUser.role === "Speaker" || verifiedUser.role === "Delegate") && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminScanner;
