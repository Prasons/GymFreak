import React, { useState, useMemo } from "react";

const AdminPayments = () => {
  const [payments, setPayments] = useState([
    { id: 1, member: "John Doe", plan: "Monthly", amount: 50, status: "Paid" },
    {
      id: 2,
      member: "Jane Smith",
      plan: "Quarterly",
      amount: 135,
      status: "Pending",
    },
    {
      id: 3,
      member: "Alice Johnson",
      plan: "Yearly",
      amount: 500,
      status: "Paid",
    },
  ]);

  const togglePaymentStatus = (id) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "Paid" ? "Pending" : "Paid" }
          : p
      )
    );
  };

  const report = useMemo(() => {
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = payments.filter((p) => p.status === "Paid").length;
    const totalPending = payments.filter((p) => p.status === "Pending").length;
    const totalPaidAmount = payments
      .filter((p) => p.status === "Paid")
      .reduce((sum, p) => sum + p.amount, 0);
    return { totalAmount, totalPaid, totalPending, totalPaidAmount };
  }, [payments]);

  return (
    <div className="min-h-screen bg-primary text-light p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Manage Payments</h1>

      {/* Payment Report Summary */}
      <div className="bg-secondary p-6 rounded-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Payment Report Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-light text-primary p-4 rounded-md font-medium">
            Total Collected:{" "}
            <span className="font-bold">${report.totalPaidAmount}</span>
          </div>
          <div className="bg-light text-primary p-4 rounded-md font-medium">
            Total Expected:{" "}
            <span className="font-bold">${report.totalAmount}</span>
          </div>
          <div className="bg-light text-primary p-4 rounded-md font-medium">
            Paid Members: <span className="font-bold">{report.totalPaid}</span>
          </div>
          <div className="bg-light text-primary p-4 rounded-md font-medium">
            Pending Members:{" "}
            <span className="font-bold">{report.totalPending}</span>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-secondary rounded-md overflow-hidden text-left">
          <thead className="bg-accent text-light">
            <tr>
              <th className="py-3 px-6">Member</th>
              <th className="py-3 px-6">Plan</th>
              <th className="py-3 px-6">Amount ($)</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t border-gray-700">
                <td className="py-3 px-6">{payment.member}</td>
                <td className="py-3 px-6">{payment.plan}</td>
                <td className="py-3 px-6">{payment.amount}</td>
                <td className="py-3 px-6">
                  <span
                    className={`py-1 px-3 rounded-md font-semibold ${
                      payment.status === "Paid"
                        ? "bg-green-500 text-light"
                        : "bg-yellow-500 text-light"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="py-3 px-6">
                  <button
                    onClick={() => togglePaymentStatus(payment.id)}
                    className="bg-light text-primary py-2 px-4 rounded-md hover:bg-accent hover:text-light transition"
                  >
                    Toggle Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;
