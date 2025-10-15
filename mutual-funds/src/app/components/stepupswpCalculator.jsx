'use client';
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function StepUpSWPCalculator({ navData = [] }) {
  const [investmentDate, setInvestmentDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [initialInvestment, setInitialInvestment] = useState("");
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState("");
  const [stepUpPercent, setStepUpPercent] = useState("");
  const [years, setYears] = useState("");
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [tablePage, setTablePage] = useState(1);
  const rowsPerPage = 10;

  // Normalize date from DD-MM-YYYY to YYYY-MM-DD for JS Date parsing
  const normalizeDate = (d) => {
    const [day, month, year] = d.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Find nearest NAV for given date
  const findNearestNAV = (targetDate) => {
    if (!navData.length) return null;
    const target = new Date(targetDate);
    let nearest = navData[0];
    let minDiff = Math.abs(new Date(normalizeDate(nearest.date)) - target);
    for (const nav of navData) {
      const diff = Math.abs(new Date(normalizeDate(nav.date)) - target);
      if (diff < minDiff) {
        nearest = nav;
        minDiff = diff;
      }
    }
    return nearest;
  };

  const calculateStepUpSWP = () => {
    if (!investmentDate || !startDate || !initialInvestment || !monthlyWithdrawal || !stepUpPercent || !years) {
      alert("Please fill all fields before calculating.");
      return;
    }

    const invest = parseFloat(initialInvestment);
    let withdraw = parseFloat(monthlyWithdrawal);
    const stepUp = parseFloat(stepUpPercent);
    const totalMonths = parseFloat(years) * 12;

    const investNav = findNearestNAV(investmentDate);
    if (!investNav) {
      alert("No NAV data found for investment date.");
      return;
    }

    let units = invest / parseFloat(investNav.nav);
    let balance = invest;
    let totalWithdrawn = 0;
    let monthIndex = 0;
    const chartData = [];
    const tableData = [];

    let currentDate = new Date(startDate);

    for (let i = 0; i < totalMonths; i++) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const nearest = findNearestNAV(dateStr);
      if (!nearest) break;

      const withdrawUnits = withdraw / parseFloat(nearest.nav);
      units -= withdrawUnits;
      if (units < 0) units = 0;

      balance = units * parseFloat(nearest.nav);
      totalWithdrawn += withdraw;

      chartData.push({
        month: i + 1,
        date: nearest.date, // keep DD-MM-YYYY format
        nav: parseFloat(nearest.nav).toFixed(2),
        withdrawal: withdraw.toFixed(2),
        unitsLeft: units.toFixed(4),
        balance: balance.toFixed(2),
      });

      tableData.push({
        month: i + 1,
        date: nearest.date,
        nav: parseFloat(nearest.nav).toFixed(2),
        withdrawal: withdraw.toFixed(2),
        unitsLeft: units.toFixed(4),
        balance: balance.toFixed(2),
      });

      monthIndex++;
      if (monthIndex % 12 === 0) withdraw *= 1 + stepUp / 100;
      if (balance <= 0) break;

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const profitLoss = totalWithdrawn + balance - invest;
    const finishedEarly = balance <= 0;

    setData(tableData);
    setSummary({
      investDate: investmentDate,
      investNav: parseFloat(investNav.nav),
      totalWithdrawn,
      finalBalance: balance,
      profitLoss,
      unitsLeft: units,
      finishedEarly,
    });
  };

  // Pagination
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const currentPageData = data.slice((tablePage - 1) * rowsPerPage, tablePage * rowsPerPage);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-6xl mx-auto">
      <h2 className="text-3xl font-semibold text-center text-blue-700 mb-6">
        Step-Up SWP Calculator (Investment & Withdrawal Date Fixed)
      </h2>

      {/* Inputs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-black">
        <input
          type="date"
          value={investmentDate}
          onChange={(e) => setInvestmentDate(e.target.value)}
          className="p-2 border rounded-lg"
          placeholder="Investment Date (DD-MM-YYYY)"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded-lg"
          placeholder="Withdrawal Start Date (DD-MM-YYYY)"
        />
        <input
          type="number"
          value={initialInvestment}
          onChange={(e) => setInitialInvestment(e.target.value)}
          placeholder="Initial Investment (₹)"
          className="p-2 border rounded-lg"
        />
        <input
          type="number"
          value={monthlyWithdrawal}
          onChange={(e) => setMonthlyWithdrawal(e.target.value)}
          placeholder="Monthly Withdrawal (₹)"
          className="p-2 border rounded-lg"
        />
        <input
          type="number"
          value={stepUpPercent}
          onChange={(e) => setStepUpPercent(e.target.value)}
          placeholder="Step-Up % / Year"
          className="p-2 border rounded-lg"
        />
        <input
          type="number"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          placeholder="Duration (Years)"
          className="p-2 border rounded-lg"
        />
      </div>

      <button
        onClick={calculateStepUpSWP}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
      >
        Calculate
      </button>

      {/* Chart */}
      {data.length > 0 && (
        <>
          <div className="mt-8 w-full h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} name="Balance (₹)" />
                <Line yAxisId="right" type="monotone" dataKey="unitsLeft" stroke="#10b981" strokeWidth={2} name="Units Left" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          {summary && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-inner text-center text-black">
              <p>Investment Date: {summary.investDate}</p>
              <p>Buy NAV: ₹{summary.investNav.toFixed(4)}</p>
              <p>Total Withdrawn: ₹{summary.totalWithdrawn.toFixed(2)}</p>
              <p>Final Balance: ₹{summary.finalBalance.toFixed(2)}</p>
              <p>Units Left: {summary.unitsLeft.toFixed(4)}</p>
              <p className={`font-semibold ${summary.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {summary.profitLoss >= 0
                  ? `Profit: ₹${summary.profitLoss.toFixed(2)}`
                  : `Loss: ₹${Math.abs(summary.profitLoss).toFixed(2)}`}
              </p>
            </div>
          )}

          {/* Table */}
          <div className="mt-6 bg-gray-50 p-4 rounded-xl shadow-inner overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">Monthly Details</h3>
            <table className="min-w-full border text-sm text-black">
              <thead className="bg-blue-100 text-blue-900">
                <tr>
                  <th className="p-2 border">Month</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">NAV (₹)</th>
                  <th className="p-2 border">Withdrawal (₹)</th>
                  <th className="p-2 border">Units Left</th>
                  <th className="p-2 border">Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((row, idx) => (
                  <tr key={idx} className="text-center hover:bg-gray-100">
                    <td className="p-2 border">{row.month}</td>
                    <td className="p-2 border">{row.date}</td>
                    <td className="p-2 border">{row.nav}</td>
                    <td className="p-2 border">{row.withdrawal}</td>
                    <td className="p-2 border">{row.unitsLeft}</td>
                    <td className="p-2 border">{row.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                disabled={tablePage === 1}
              >
                Prev
              </button>
              <span>
                Page {tablePage} of {totalPages}
              </span>
              <button
                onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                disabled={tablePage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
