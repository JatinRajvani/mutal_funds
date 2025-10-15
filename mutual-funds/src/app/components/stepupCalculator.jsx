'use client';
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StepUpCalculator({ navData }) {
  const [amount, setAmount] = useState("");
  const [stepUp, setStepUp] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Helper: convert DD-MM-YYYY to YYYY-MM-DD
  const normalizeDate = (d) => {
    const [day, month, year] = d.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Prepare NAV data in normalized form once
  const normalizedNAV = navData?.map((item) => ({
    date: normalizeDate(item.date),
    nav: parseFloat(item.nav),
  }));

  const handleCalculate = () => {
    if (!amount || !stepUp || !startDate || !endDate || !normalizedNAV || normalizedNAV.length === 0) {
      alert("Please fill all fields and ensure NAV data is available");
      return;
    }

    const initialInvestment = parseFloat(amount);
    const stepUpRate = parseFloat(stepUp);
    const investDate = new Date(startDate);
    const end = new Date(endDate);

    if (investDate.getTime() >= end.getTime()) {
      alert("End date must be after Start date");
      return;
    }

    let monthlyInvestment = initialInvestment;
    let totalInvestment = 0;
    let totalUnits = 0;
    let data = [];
    let table = [];

    let currentDate = new Date(investDate);
    let monthIndex = 0;

    while (currentDate < end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const navItem = normalizedNAV.find((n) => n.date === dateStr);

      if (navItem) {
        const unitsBought = monthlyInvestment / navItem.nav;
        totalUnits += unitsBought;
        totalInvestment += monthlyInvestment;

        table.push({
          month: dateStr,
          investment: monthlyInvestment.toFixed(2),
          nav: navItem.nav.toFixed(4),
          units: unitsBought.toFixed(4),
          totalUnits: totalUnits.toFixed(4),
        });

        data.push({
          month: dateStr,
          invested: totalInvestment.toFixed(0),
        });
      }

      // Every 12 months apply step-up
      monthIndex++;
      if (monthIndex % 12 === 0) {
        monthlyInvestment *= 1 + stepUpRate / 100;
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Sell all units on end date
    const endStr = end.toISOString().split("T")[0];
    const endNav = normalizedNAV.find((n) => n.date === endStr)?.nav;
    if (!endNav) {
      alert("No NAV found for end date. Please adjust the date range.");
      return;
    }

    const finalValue = totalUnits * endNav;
    const gain = finalValue - totalInvestment;

    setResult({
      totalInvestment,
      finalValue,
      gain,
      totalUnits,
      endNav,
    });

    setChartData(data);
    setTableData(table);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-semibold text-blue-800 mb-6">
        Step-Up SIP Calculator (NAV Based)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <input
          type="number"
          placeholder="Initial SIP Amount (₹)"
          className="border p-2 rounded-xl bg-white text-black"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="number"
          placeholder="Step-Up Percentage (%)"
          className="border p-2 rounded-xl bg-white text-black"
          value={stepUp}
          onChange={(e) => setStepUp(e.target.value)}
        />
        <input
          type="date"
          placeholder="Start Date"
          className="border p-2 rounded-xl bg-white text-black"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          placeholder="End Date"
          className="border p-2 rounded-xl bg-white text-black"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
          onClick={handleCalculate}
        >
          Calculate
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 p-6 rounded-2xl shadow-md text-black mb-6">
          <p>Total Investment: ₹{result.totalInvestment.toLocaleString()}</p>
          <p>Final Value: ₹{result.finalValue.toLocaleString()}</p>
          <p>Total Gain: ₹{result.gain.toLocaleString()}</p>
          <p>Total Units: {result.totalUnits.toFixed(4)}</p>
          <p>End NAV (₹): {result.endNav.toFixed(4)}</p>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Investment Growth Chart
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="invested"
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {tableData.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-2xl shadow-md overflow-x-auto text-black">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            Monthly Investment Details
          </h2>
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="p-2 border">Month</th>
                <th className="p-2 border">Investment (₹)</th>
                <th className="p-2 border">NAV (₹)</th>
                <th className="p-2 border">Units Bought</th>
                <th className="p-2 border">Total Units</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} className="text-center border-t">
                  <td className="p-2 border">{row.month}</td>
                  <td className="p-2 border">{row.investment}</td>
                  <td className="p-2 border">{row.nav}</td>
                  <td className="p-2 border">{row.units}</td>
                  <td className="p-2 border">{row.totalUnits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
