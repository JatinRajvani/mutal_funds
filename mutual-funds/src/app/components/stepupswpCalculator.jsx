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
  Legend,
} from "recharts";

export default function StepUpSWPCalculator({ navData = [], returns = 8 }) {
  const [initialInvestment, setInitialInvestment] = useState("");
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState("");
  const [stepUpPercent, setStepUpPercent] = useState("");
  const [years, setYears] = useState("");
  const [startDate, setStartDate] = useState("");
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);

  const calculateStepUpSWP = () => {
    if (!initialInvestment || !monthlyWithdrawal || !stepUpPercent || !years || !startDate) {
      alert("Please fill all fields before calculating.");
      return;
    }

    const stepUp = parseFloat(stepUpPercent);
    const totalYears = parseFloat(years);
    const start = new Date(startDate);
    const current = new Date();
    const isPastMode = start < current;
    const chartData = [];

    let totalWithdrawn = 0;
    let monthsCompleted = 0;
    let balance = 0;
    let units = 0;

    // pick the return rate (for future projection)
    let annualReturnRate = parseFloat(returns?.["1y"] || returns || 8);

    if (isPastMode && navData.length > 0) {
      // 🧮 PAST MODE - Using actual NAV data
      let investment = parseFloat(initialInvestment);
      let withdrawal = parseFloat(monthlyWithdrawal);

      const startNavEntry = navData.find(
        (n) =>
          new Date(n.date).getMonth() === start.getMonth() &&
          new Date(n.date).getFullYear() === start.getFullYear()
      );

      if (!startNavEntry) {
        alert("No NAV data found for the selected start month.");
        return;
      }

      let startNav = parseFloat(startNavEntry.nav);
      units = investment / startNav;

      for (let month = 0; month < totalYears * 12; month++) {
        const navEntry = navData[month];
        if (!navEntry) break;

        const currentNAV = parseFloat(navEntry.nav);
        const withdrawUnits = withdrawal / currentNAV;
        units -= withdrawUnits;

        if (units < 0) units = 0;
        balance = units * currentNAV;
        totalWithdrawn += withdrawal;
        monthsCompleted = month + 1;

        chartData.push({
          month: month + 1,
          nav: currentNAV.toFixed(2),
          balance: parseFloat(balance.toFixed(2)),
          withdrawal: parseFloat(withdrawal.toFixed(2)),
          units: parseFloat(units.toFixed(2)),
        });

        // Step-up each year
        if ((month + 1) % 12 === 0) withdrawal *= 1 + stepUp / 100;
        if (units <= 0) break;
      }
    } else {
      // 🧮 FUTURE MODE - Using Assumed Annual Return %
      balance = parseFloat(initialInvestment);
      let withdrawal = parseFloat(monthlyWithdrawal);
      const monthlyReturn = Math.pow(1 + annualReturnRate / 100, 1 / 12) - 1;

      // Assume NAV starts at 10 for unit calculation (for visualization)
      let nav = 10;
      units = balance / nav;

      for (let month = 1; month <= totalYears * 12; month++) {
        if (month % 12 === 0 && month !== 0) withdrawal *= 1 + stepUp / 100;

        // NAV grows monthly with assumed return
        nav *= 1 + monthlyReturn;

        const withdrawUnits = withdrawal / nav;
        units -= withdrawUnits;
        if (units < 0) units = 0;

        balance = units * nav;
        totalWithdrawn += withdrawal;
        monthsCompleted = month;

        chartData.push({
          month,
          nav: parseFloat(nav.toFixed(2)),
          balance: balance > 0 ? parseFloat(balance.toFixed(2)) : 0,
          withdrawal: parseFloat(withdrawal.toFixed(2)),
          units: parseFloat(units.toFixed(2)),
        });

        if (balance <= 0) break;
      }
    }

    // 📊 Summary
    const finalBalance = balance > 0 ? balance : 0;
    const profitLoss = totalWithdrawn + finalBalance - parseFloat(initialInvestment);
    const finishedEarly = finalBalance <= 0 && monthsCompleted < totalYears * 12;

    setSummary({
      totalWithdrawn,
      finalBalance,
      profitLoss,
      monthsCompleted,
      finishedEarly,
      totalMonths: totalYears * 12,
      unitsLeft: units,
    });

    setData(chartData);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700 text-center">
        Step-Up SWP Calculator
      </h2>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-black">
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
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded-lg col-span-2"
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
          <div className="mt-8">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" label={{ value: "₹", angle: -90, position: "insideLeft" }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: "Units", angle: 90, position: "insideRight" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                  formatter={(value, name) => {
                    if (name === "balance") return [`₹${value}`, "Balance"];
                    if (name === "withdrawal") return [`₹${value}`, "Withdrawal"];
                    if (name === "nav") return [`₹${value}`, "NAV"];
                    if (name === "units") return [`${value}`, "Units Remaining"];
                    return value;
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} name="Balance (₹)" />
                <Line yAxisId="right" type="monotone" dataKey="units" stroke="#10b981" strokeWidth={2} name="Units Remaining" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          {summary && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-inner text-center">
              {summary.finishedEarly ? (
                <p className="text-red-600 font-semibold">
                  ⚠️ Your balance became zero after {summary.monthsCompleted} months — before your planned {summary.totalMonths} months.
                </p>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-800">
                    💰 Final Balance: ₹{summary.finalBalance.toFixed(2)}
                  </p>
                  <p className="text-gray-700">
                    Total Withdrawn: ₹{summary.totalWithdrawn.toFixed(2)}
                  </p>
                  <p className="text-gray-700">
                    Units Remaining: {summary.unitsLeft.toFixed(2)}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      summary.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {summary.profitLoss >= 0
                      ? `📈 Profit: ₹${summary.profitLoss.toFixed(2)}`
                      : `📉 Loss: ₹${Math.abs(summary.profitLoss).toFixed(2)}`}
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
