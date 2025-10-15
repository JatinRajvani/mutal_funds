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
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Convert DD-MM-YYYY → YYYY-MM-DD
  const normalizeDate = (d) => {
    const [day, month, year] = d.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Normalize NAV data
  const normalizedNAV = navData
    ?.map((item) => ({
      date: normalizeDate(item.date),
      nav: parseFloat(item.nav),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Helper: find nearest available NAV date
  const findNearestNAV = (targetDate) => {
    if (!normalizedNAV || normalizedNAV.length === 0) return null;
    const target = new Date(targetDate);
    let nearest = normalizedNAV[0];
    let minDiff = Math.abs(new Date(nearest.date) - target);

    for (const nav of normalizedNAV) {
      const diff = Math.abs(new Date(nav.date) - target);
      if (diff < minDiff) {
        nearest = nav;
        minDiff = diff;
      }
    }
    return nearest;
  };

  // Helper: XIRR Calculation using Newton-Raphson
  const calculateXIRR = (cashFlows) => {
    const npv = (rate) =>
      cashFlows.reduce((acc, { amount, date }) => {
        const diffYears =
          (new Date(date) - new Date(cashFlows[0].date)) /
          (1000 * 60 * 60 * 24 * 365);
        return acc + amount / Math.pow(1 + rate, diffYears);
      }, 0);

    let rate = 0.1;
    let tol = 1e-6;
    let maxIter = 100;

    for (let i = 0; i < maxIter; i++) {
      const f = npv(rate);
      const f1 = (npv(rate + tol) - f) / tol;
      const newRate = rate - f / f1;
      if (Math.abs(newRate - rate) < tol) return newRate * 100;
      rate = newRate;
    }
    return rate * 100;
  };

  // Helper: CAGR
  const calculateCAGR = (startDate, endDate, finalValue, totalInvestment) => {
    const years =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 365);
    if (years <= 0) return 0;
    return (Math.pow(finalValue / totalInvestment, 1 / years) - 1) * 100;
  };

  const handleCalculate = () => {
    if (!amount || !stepUp || !startDate || !endDate || !normalizedNAV?.length) {
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
    let cashFlows = [];

    let currentDate = new Date(investDate);
    let monthIndex = 0;

    while (currentDate < end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const nearestNAV = findNearestNAV(dateStr);

      if (nearestNAV) {
        const unitsBought = monthlyInvestment / nearestNAV.nav;
        totalUnits += unitsBought;
        totalInvestment += monthlyInvestment;

        table.push({
          buyDate: dateStr,
          navDate: nearestNAV.date,
          investment: monthlyInvestment.toFixed(2),
          nav: nearestNAV.nav.toFixed(4),
          units: unitsBought.toFixed(4),
          totalUnits: totalUnits.toFixed(4),
        });

        data.push({
          month: dateStr,
          invested: totalInvestment.toFixed(0),
        });

        cashFlows.push({
          amount: -monthlyInvestment,
          date: nearestNAV.date,
        });
      }

      monthIndex++;
      if (monthIndex % 12 === 0) {
        monthlyInvestment *= 1 + stepUpRate / 100;
      }

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const endStr = end.toISOString().split("T")[0];
    const endNAV = findNearestNAV(endStr);
    if (!endNAV) {
      alert("No NAV found near end date. Please adjust date range.");
      return;
    }

    const finalValue = totalUnits * endNAV.nav;
    const gain = finalValue - totalInvestment;

    cashFlows.push({
      amount: finalValue,
      date: endNAV.date,
    });

    const absoluteReturn = (gain / totalInvestment) * 100;
    const xirr = calculateXIRR(cashFlows);
    const cagr = calculateCAGR(startDate, endDate, finalValue, totalInvestment);

    setResult({
      totalInvestment,
      finalValue,
      gain,
      totalUnits,
      endNav: endNAV.nav,
      sellDate: endStr,
      sellNavDate: endNAV.date,
      absoluteReturn,
      xirr,
      cagr,
    });

    setChartData(data);
    setTableData(table);
    setCurrentPage(1);
  };

  // Pagination Logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-semibold text-blue-800 mb-6">
        Step-Up SIP Calculator (Nearest NAV + XIRR + Pagination)
      </h1>

      {/* Input Fields */}
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

      {/* Result Box */}
      {result && (
        <div className="bg-gray-50 p-6 rounded-2xl shadow-md text-black mb-6 space-y-1">
          <p>Total Investment: ₹{result.totalInvestment.toLocaleString()}</p>
          <p>Final Value: ₹{result.finalValue.toLocaleString()}</p>
          <p>Total Gain: ₹{result.gain.toLocaleString()}</p>
          <p>Total Units: {result.totalUnits.toFixed(4)}</p>
          <p>
            Sold on: {result.sellDate} (Used NAV Date: {result.sellNavDate})
          </p>
          <p>End NAV (₹): {result.endNav.toFixed(4)}</p>
          <p className="text-green-600 font-semibold">
            Absolute Return: {result.absoluteReturn.toFixed(2)}%
          </p>
          <p className="text-green-700 font-semibold">
            Annualized Return (CAGR): {result.cagr.toFixed(2)}%
          </p>
          <p className="text-blue-700 font-semibold">
            Annualized Return (XIRR): {result.xirr.toFixed(2)}%
          </p>
        </div>
      )}

      {/* Chart */}
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

      {/* Table */}
      {tableData.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-2xl shadow-md overflow-x-auto text-black">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            Monthly Investment Details
          </h2>
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="p-2 border">Buy Date</th>
                <th className="p-2 border">NAV Date Used</th>
                <th className="p-2 border">Investment (₹)</th>
                <th className="p-2 border">NAV (₹)</th>
                <th className="p-2 border">Units Bought</th>
                <th className="p-2 border">Total Units</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, i) => (
                <tr key={i} className="text-center border-t hover:bg-gray-100">
                  <td className="p-2 border">
                    {row.buyDate.split("-").reverse().join("-")}
                  </td>
                  <td className="p-2 border">
                    {row.navDate.split("-").reverse().join("-")}
                  </td>
                  <td className="p-2 border">{row.investment}</td>
                  <td className="p-2 border">{row.nav}</td>
                  <td className="p-2 border">{row.units}</td>
                  <td className="p-2 border">{row.totalUnits}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-1 bg-blue-200 rounded-lg hover:bg-blue-300"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              className="px-4 py-1 bg-blue-200 rounded-lg hover:bg-blue-300"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
