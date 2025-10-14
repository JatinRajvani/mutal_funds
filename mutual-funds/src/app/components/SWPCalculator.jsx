'use client';

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function SWPCalculator({ navData, returns }) {
  const [initialAmount, setInitialAmount] = useState(100000);
  const [withdrawAmount, setWithdrawAmount] = useState(5000);
  const [frequency, setFrequency] = useState("monthly");
  const [investmentDate, setInvestmentDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [investmentTable, setInvestmentTable] = useState([]);

  // ---------- Utility: parse dd-mm-yyyy to Date ----------
  const parseNavDate = (dateStr) => {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const addInterval = (date, freq) => {
    const newDate = new Date(date.getTime());
    if (freq === "monthly") newDate.setMonth(newDate.getMonth() + 1);
    else if (freq === "quarterly") newDate.setMonth(newDate.getMonth() + 3);
    else if (freq === "yearly") newDate.setFullYear(newDate.getFullYear() + 1);
    return newDate;
  };

  // ---------- Find nearest past NAV ----------
  const getNavForDate = (date) => {
    const sorted = [...navData].sort((a, b) => parseNavDate(a.date) - parseNavDate(b.date));
    const pastNavs = sorted.filter((n) => parseNavDate(n.date) <= date);
    return pastNavs.length > 0 ? parseFloat(pastNavs[pastNavs.length - 1].nav) : parseFloat(sorted[0].nav);
  };

  const calculateSWP = () => {
    if (!investmentDate || !startDate || !navData || navData.length === 0) {
      alert("Please fill all fields and ensure NAV data is available");
      return;
    }

    const investDate = new Date(investmentDate);
    const start = new Date(startDate);

    if (investDate.getTime() >= start.getTime()) {
      alert("Start date must be after Investment date");
      return;
    }

    // 1. Buy units on investment date
    const initialNAV = getNavForDate(investDate);
    let totalUnits = initialAmount / initialNAV;
    let remainingUnits = totalUnits;
    let totalWithdrawn = 0;

    const schedule = [];

    // Add investment row to table
    schedule.push({
      date: investDate.toISOString().split("T")[0],
      type: "Investment",
      nav: initialNAV,
      units: totalUnits,
      withdrawn: totalWithdrawn,
      remainingUnits: totalUnits,
      portfolioValue: totalUnits * initialNAV,
    });

    // 2. Withdrawals start from start date
    let currentDate = new Date(start);
    const frequencyMonths = frequency === "monthly" ? 1 : frequency === "quarterly" ? 3 : 12;

    while (remainingUnits > 0) {
      const currentNAV = getNavForDate(currentDate);
      const portfolioValue = remainingUnits * currentNAV;
      const withdrawal = Math.min(withdrawAmount, portfolioValue);
      const unitsWithdrawn = withdrawal / currentNAV;

      remainingUnits -= unitsWithdrawn;
      totalWithdrawn += withdrawal;

      schedule.push({
        date: currentDate.toISOString().split("T")[0],
        type: "Withdrawal",
        nav: currentNAV,
        units: unitsWithdrawn,
        withdrawn: totalWithdrawn,
        remainingUnits: remainingUnits,
        portfolioValue: remainingUnits * currentNAV,
      });

      if (remainingUnits <= 0) break;

      currentDate = addInterval(currentDate, frequency);
    }

    const finalValue = remainingUnits * getNavForDate(currentDate);

    setResults({
      totalWithdrawn: totalWithdrawn.toFixed(2),
      remainingValue: finalValue.toFixed(2),
      periodsTaken: schedule.length - 1, // exclude initial investment
    });

    setInvestmentTable(schedule);

    // Chart data
    setChartData(schedule.map((it) => ({
      date: it.date,
      withdrawn: it.withdrawn,
      value: it.portfolioValue,
    })));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 text-blue-800">SWP Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial Investment (₹)
          </label>
          <input
            type="number"
            value={initialAmount}
            onChange={(e) => setInitialAmount(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Amount (₹)
          </label>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Date
          </label>
          <input
            type="date"
            value={investmentDate}
            onChange={(e) => setInvestmentDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date (Withdrawals)
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={calculateSWP}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Calculate SWP
      </button>

      {results && (
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
              <p className="text-2xl font-bold text-blue-800">
                ₹{parseFloat(results.totalWithdrawn).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Remaining Value</p>
              <p className="text-2xl font-bold text-green-700">
                ₹{parseFloat(results.remainingValue).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Withdrawal Periods</p>
              <p className="text-2xl font-bold text-purple-700">
                {results.periodsTaken}{" "}
                {frequency === "monthly"
                  ? "Months"
                  : frequency === "quarterly"
                  ? "Quarters"
                  : "Years"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Withdrawal & Portfolio Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={30} />
                <YAxis />
                <Tooltip formatter={(value) => `₹${parseFloat(value).toLocaleString("en-IN")}`} />
                <Legend />
                <Line type="monotone" dataKey="withdrawn" stroke="#3b82f6" strokeWidth={2} name="Total Withdrawn" dot={false} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="Remaining Value" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="mt-8 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">SWP Details</h3>
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">NAV (₹)</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Units</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Withdrawn (₹)</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Remaining Units</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Portfolio Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                {investmentTable.map((item, i) => (
                  <tr key={i} className="border-t text-sm text-black">
                    <td className="px-4 py-2">{item.date}</td>
                    <td className="px-4 py-2">{item.type}</td>
                    <td className="px-4 py-2">₹{item.nav.toFixed(2)}</td>
                    <td className="px-4 py-2">{item.units.toFixed(6)}</td>
                    <td className="px-4 py-2">₹{item.withdrawn.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2">{item.remainingUnits.toFixed(6)}</td>
                    <td className="px-4 py-2">₹{item.portfolioValue.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
