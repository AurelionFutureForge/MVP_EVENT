import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Html5QrcodeScanner } from "html5-qrcode";

function AdminScanner() {
  const location = useLocation();
  const [scannerInstance, setScannerInstance] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [lastScanned, setLastScanned] = useState({ text: "", timestamp: 0 });

  const isProcessingRef = useRef(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const startScanner = () => {
    const scannerElement = document.getElementById("qr-reader");
    if (!scannerElement) return;

    scannerElement.innerHTML = "";

    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 300, height: 300 },
    });

    scanner.render(
      async (decodedText) => {
        const now = Date.now();

        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        if (decodedText === lastScanned.text && now - lastScanned.timestamp < 3000) {
          console.log("Duplicate scan ignored:", decodedText);
          isProcessingRef.current = false;
          return;
        }

        console.log("Scanned QR Code:", decodedText);
        setLastScanned({ text: decodedText, timestamp: now });
        setScanResult(decodedText);

        await scanner.clear();
        await verifyQRCode(decodedText);

        isProcessingRef.current = false;
      },
      (error) => {
        if (error.name !== "NotFoundException") console.error("QR Scanner error:", error);
      }
    );

    setScannerInstance(scanner);
  };

  useEffect(() => {
    if (location.pathname === "/admin/scanner") {
      startScanner();
    }

    return () => {
      if (scannerInstance) {
        scannerInstance.clear().catch((err) => console.error("Scanner cleanup failed:", err));
      }
    };
  }, [location.pathname]);

  const verifyQRCode = async (qrCode) => {
    try {
      const token = localStorage.getItem("privilegeToken");
      const privilegeName = localStorage.getItem("privilegeName");

      if (!token || !privilegeName) {
        toast.error("Missing privilege credentials. Please log in again.");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/scan/verify`,
        { qrCode, privilegeName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setVerifiedUser(response.data.user);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Invalid QR Code or already claimed!");
    }
  };

  const handleScanNext = () => {
    setScanResult(null);
    setVerifiedUser(null);
    setLastScanned({ text: "", timestamp: 0 });
    isProcessingRef.current = false;
    startScanner();
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
              <div className="mt-4 text-green-700 font-semibold">
                Privilege Claimed Successfully!
              </div>
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
