import React from "react";

const InvoiceTemplate = ({ user }) => {
  const {
    registrationData: { NAME, EMAIL, amount },
    role,
    transactionId,
    paymentStatus,
  } = user;

  const contact =
    Object.entries(user.registrationData).find(([k]) =>
      /contact|phone|mobile|number/i.test(k)
    )?.[1] || "N/A";

  const GST_NO = "29AACCF1132H2ZX";

  const platformFee = (amount * 2.5) / 100;
  const ticketPrice = amount - platformFee;
  const total = ticketPrice + platformFee;

  return (
    <div
      id="invoice"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#fff",
        color: "#333",
        width: "600px",
        padding: "40px 50px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "1px solid #e0e0e0",
      }}
    >
      <div
        style={{
          textAlign: "right",
          fontSize: "34px",
          fontWeight: "700",
          letterSpacing: "2px",
          color: "#2c3e50",
          marginBottom: "30px",
        }}
      >
        INVOICE
      </div>

      <div style={{ marginBottom: "30px", lineHeight: 1.5 }}>
        <div style={{ marginBottom: "20px" }}>
          <strong
            style={{ fontSize: "14px", color: "#555", letterSpacing: "0.5px" }}
          >
            ISSUED TO:
          </strong>
          <p style={{ margin: "5px 0", fontWeight: "600", fontSize: "16px" }}>
            {NAME}
          </p>
          <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>{EMAIL}</p>
        </div>

        <div>
          <strong
            style={{ fontSize: "14px", color: "#555", letterSpacing: "0.5px" }}
          >
            PAY TO:
          </strong>
          <p
            style={{
              margin: "5px 0",
              fontWeight: "600",
              fontSize: "15px",
              color: "#2c3e50",
            }}
          >
            Account Name: AurelionFutureForge
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "14px",
          color: "#555",
          borderTop: "1px solid #ddd",
          borderBottom: "1px solid #ddd",
          padding: "15px 0",
          marginBottom: "30px",
        }}
      >
        <div>
          <p style={{ margin: "2px 0" }}>
            <strong style={{ fontWeight: "600", color: "#333" }}>
              INVOICE NO:
            </strong>{" "}
            INV-{transactionId.slice(-6)}
          </p>
          <p style={{ margin: "2px 0" }}>
            <strong style={{ fontWeight: "600", color: "#333" }}>DATE:</strong>{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: "2px 0" }}>
            <strong style={{ fontWeight: "600", color: "#333" }}>GST No:</strong>{" "}
            {GST_NO}
          </p>
          <p style={{ margin: "2px 0" }}>
            <strong style={{ fontWeight: "600", color: "#333" }}>Contact:</strong>{" "}
            {contact}
          </p>
          <p style={{ margin: "2px 0" }}>
            <strong style={{ fontWeight: "600", color: "#333" }}>Role:</strong>{" "}
            {role}
          </p>
        </div>
      </div>

      <table
        style={{
          width: "100%",
          marginBottom: "30px",
          borderCollapse: "collapse",
          fontSize: "14px",
          color: "#444",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f9f9f9",
              borderBottom: "2px solid #ddd",
              textTransform: "uppercase",
              fontSize: "13px",
              letterSpacing: "1px",
              color: "#555",
            }}
          >
            <th
              style={{
                textAlign: "left",
                paddingLeft: 35,
                paddingBottom: "12px",
                width: "40%",
              }}
            >
              Description
            </th>
            <th style={{ textAlign: "center", paddingBottom: "12px" }}>
              Role Price
            </th>
            <th style={{ textAlign: "center", paddingBottom: "12px" }}>Qty</th>
            <th style={{ textAlign: "right", paddingRight: 10, paddingBottom: "12px" }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            style={{
              borderBottom: "1px solid #eee",
              fontWeight: "600",
            }}
          >
            <td style={{ textAlign: "left", paddingLeft: 35, paddingTop: 12, paddingBottom: 12 }}>
              {role}
            </td>
            <td style={{ textAlign: "center", paddingTop: 12, paddingBottom: 12 }}>
              ₹{amount.toFixed(2)}
            </td>
            <td style={{ textAlign: "center", paddingTop: 12, paddingBottom: 12 }}>1</td>
            <td style={{ textAlign: "right", paddingRight: 10, paddingTop: 12, paddingBottom: 12 }}>
              ₹{amount.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          marginBottom: "30px",
          textAlign: "right",
          fontSize: "16px",
          fontWeight: "700",
          color: "#2c3e50",
          letterSpacing: "0.5px",
          borderTop: "2px solid #ddd",
          paddingTop: "15px",
        }}
      >
        <p>
          Ticket Price: <span style={{ fontWeight: "600" }}>₹{ticketPrice.toFixed(2)}</span>
        </p>
        <p>
          Platform Fee (2.5%): <span style={{ fontWeight: "600" }}>₹{platformFee.toFixed(2)}</span>
        </p>
        <p style={{ fontSize: "18px", fontWeight: "800", marginTop: "10px" }}>
          Total: ₹{total.toFixed(2)}
        </p>
      </div>

      <div
        style={{
          fontSize: "14px",
          color: "#555",
          borderTop: "1px solid #eee",
          paddingTop: "20px",
          marginBottom: "40px",
        }}
      >
        <p style={{ margin: "6px 0" }}>
          <strong>Transaction ID:</strong> {transactionId}
        </p>
        <p style={{ margin: "6px 0" }}>
          <strong>Payment Status:</strong> {paymentStatus}
        </p>
      </div>

      <div style={{ textAlign: "right" }}>
        <p style={{ fontFamily: "cursive", fontSize: "18px", color: "#888" }}>
          Stagyn.io
        </p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
