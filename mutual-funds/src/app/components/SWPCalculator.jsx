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
  const [startDate, setStartDate] = useState("");
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);

  const parseNavDate = (dateStr) => {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const getLatestNav = () => parseFloat(navData[navData.length - 1].nav);

  const calculateSWP = () => {
    if (!startDate || !navData || navData.length === 0) {
      alert("Please fill all fields and ensure NAV data is available");
      return;
    }

    const start = new Date(startDate);
    let remainingUnits = initialAmount / getLatestNav();
    let totalWithdrawn = 0;
    const schedule = [];
    let currentDate = new Date(start);

    const annualReturn = parseFloat(returns['1y']) / 100;
    const monthlyGrowth = Math.pow(1 + annualReturn, 1 / 12);

    const frequencyMonths =
      frequency === "monthly" ? 1 : frequency === "quarterly" ? 3 : 12;

    const sortedNavs = [...navData].sort(
      (a, b) => parseNavDate(a.date) - parseNavDate(b.date)
    );
    const latestNavDate = parseNavDate(sortedNavs[sortedNavs.length - 1].date);

    const getNavForDate = (date, step) => {
      if (date <= latestNavDate) {
        const pastNavs = sortedNavs.filter((n) => parseNavDate(n.date) <= date);
        return parseFloat(pastNavs[pastNavs.length - 1].nav);
      } else {
        return getLatestNav() * Math.pow(monthlyGrowth, step);
      }
    };

    let step = 0;

    while (remainingUnits > 0) {
      const currentNav = getNavForDate(currentDate, step);
      const portfolioValue = remainingUnits * currentNav;

      const withdrawal = Math.min(withdrawAmount, portfolioValue);
      const unitsWithdrawn = withdrawal / currentNav;

      remainingUnits -= unitsWithdrawn;
      totalWithdrawn += withdrawal;

      const impact = (remainingUnits * currentNav) + totalWithdrawn - initialAmount;

      schedule.push({
        date: currentDate.toISOString().split("T")[0],
        remainingValue: remainingUnits * currentNav,
        withdrawn: totalWithdrawn,
        impact: impact.toFixed(2),
      });

      if (remainingUnits <= 0) break;

      currentDate.setMonth(currentDate.getMonth() + frequencyMonths);
      step++;
    }

    const finalValue = remainingUnits * getLatestNav();
    const impact = finalValue + totalWithdrawn - initialAmount;

    setResults({
      totalWithdrawn: totalWithdrawn.toFixed(2),
      remainingValue: finalValue.toFixed(2),
      periodsTaken: schedule.length,
      impact: impact.toFixed(2),
    });

    setChartData(schedule);
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
            Start Date
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

            <div className={`rounded-lg p-4 ${results.impact < 0 ? "bg-red-50" : "bg-green-50"}`}>
              <p className="text-sm text-gray-600 mb-1">Portfolio Impact</p>
              <p
                className={`text-2xl font-bold ${
                  results.impact < 0 ? "text-red-700" : "text-green-700"
                }`}
              >
                {results.impact < 0 ? "Loss: " : "Gain: "}₹
                {Math.abs(parseFloat(results.impact)).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Withdrawal & Portfolio Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={30} />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    `₹${parseFloat(value).toLocaleString("en-IN")}`
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="withdrawn"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Withdrawn"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="remainingValue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Remaining Value"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="impact"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Portfolio Impact"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
