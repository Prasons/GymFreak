import React, { useState, useMemo } from "react";
import { FaSearch, FaFilter, FaDownload, FaSort } from "react-icons/fa";
import { saveAs } from "file-saver";

const AdminPayments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [payments, setPayments] = useState([
    { 
      id: 1, 
      member: "John Doe", 
      plan: "Monthly", 
      amount: 50, 
      status: "Paid",
      date: "2023-05-01",
      paymentMethod: "Credit Card" 
    },
    {
      id: 2,
      member: "Jane Smith",
      plan: "Quarterly",
      amount: 135,
      status: "Pending",
      date: "2023-05-15",
      paymentMethod: "Bank Transfer"
    },
    {
      id: 3,
      member: "Alice Johnson",
      plan: "Yearly",
      amount: 500,
      status: "Paid",
      date: "2023-05-20",
      paymentMethod: "PayPal"
    },
  ]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return { key, direction: prevConfig.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const downloadCSV = () => {
    const headers = ["ID", "Member", "Plan", "Amount", "Status", "Date", "Payment Method"];
    const csvData = filteredPayments.map(p => [
      p.id,
      p.member,
      p.plan,
      p.amount,
      p.status,
      p.date,
      p.paymentMethod
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `payments_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const togglePaymentStatus = (id) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "Paid" ? "Pending" : "Paid" }
          : p
      )
    );
  };

  const filteredPayments = useMemo(() => {
    return payments
      .filter(payment => {
        const matchesSearch = payment.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            payment.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            payment.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || payment.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesDate = (!dateRange.start || payment.date >= dateRange.start) &&
                           (!dateRange.end || payment.date <= dateRange.end);
        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const direction = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.key === "amount") {
          return (a[sortConfig.key] - b[sortConfig.key]) * direction;
        }
        return a[sortConfig.key].localeCompare(b[sortConfig.key]) * direction;
      });
  }, [payments, searchQuery, statusFilter, dateRange, sortConfig]);

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
    <div className="h-full bg-gray-900 text-white p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
          <p className="text-gray-400">Track and manage all payment transactions</p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search member, plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Payment Report Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Collected</p>
          <h3 className="text-2xl font-bold">${report.totalPaidAmount}</h3>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Expected</p>
          <h3 className="text-2xl font-bold">${report.totalAmount}</h3>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <p className="text-sm font-medium text-gray-400 mb-1">Paid Members</p>
          <h3 className="text-2xl font-bold">{report.totalPaid}</h3>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl">
          <p className="text-sm font-medium text-gray-400 mb-1">Pending Members</p>
          <h3 className="text-2xl font-bold">{report.totalPending}</h3>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-4 px-6 text-left cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort("member")}>
                  <div className="flex items-center gap-2">
                    Member
                    {sortConfig.key === "member" && <FaSort />}
                  </div>
                </th>
                <th className="py-4 px-6 text-left cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort("plan")}>
                  <div className="flex items-center gap-2">
                    Plan
                    {sortConfig.key === "plan" && <FaSort />}
                  </div>
                </th>
                <th className="py-4 px-6 text-left cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort("amount")}>
                  <div className="flex items-center gap-2">
                    Amount ($)
                    {sortConfig.key === "amount" && <FaSort />}
                  </div>
                </th>
                <th className="py-4 px-6 text-left cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-2">
                    Status
                    {sortConfig.key === "status" && <FaSort />}
                  </div>
                </th>
                <th className="py-4 px-6 text-left cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-2">
                    Date
                    {sortConfig.key === "date" && <FaSort />}
                  </div>
                </th>
                <th className="py-4 px-6 text-left cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort("paymentMethod")}>
                  <div className="flex items-center gap-2">
                    Payment Method
                    {sortConfig.key === "paymentMethod" && <FaSort />}
                  </div>
                </th>
                <th className="py-4 px-6 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-6">{payment.member}</td>
                  <td className="py-4 px-6">{payment.plan}</td>
                  <td className="py-4 px-6">${payment.amount.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${payment.status === "Paid" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">{payment.date}</td>
                  <td className="py-4 px-6">{payment.paymentMethod}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => togglePaymentStatus(payment.id)}
                      className={`px-3 py-1 rounded-full text-sm ${payment.status === "Paid" ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"} transition-colors`}
                    >
                      {payment.status === "Paid" ? "Mark Pending" : "Mark Paid"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
