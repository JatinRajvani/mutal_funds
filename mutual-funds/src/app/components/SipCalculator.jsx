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

export default function SIPCalculator({ navData }) {
  const [sipAmount, setSipAmount] = useState(5000);
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);

  const calculateSIPReturns = () => {
    if (!startDate || !endDate || !navData || navData.length === 0) {
      alert("Please fill all fields and ensure NAV data is available");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      alert("End date must be after start date");
      return;
    }

    const filteredNavData = navData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });

    if (filteredNavData.length === 0) {
      alert("No NAV data available for selected date range");
      return;
    }

    let totalInvested = 0;
    let units = 0;
    const investmentSchedule = [];
    let currentDate = new Date(start);

    const frequencyDays =
      frequency === "monthly" ? 30 : frequency === "quarterly" ? 90 : 365;

    while (currentDate <= end) {
      const closestNav = findClosestNav(filteredNavData, currentDate);

      if (closestNav) {
        const unitsAdded = sipAmount / closestNav.nav;
        units += unitsAdded;
        totalInvested += sipAmount;

        investmentSchedule.push({
          date: currentDate.toISOString().split("T")[0],
          invested: totalInvested,
          nav: closestNav.nav,
          units: units,
          value: units * closestNav.nav,
        });
      }

      currentDate = new Date(
        currentDate.setDate(currentDate.getDate() + frequencyDays)
      );
    }

    const lastNav = filteredNavData[filteredNavData.length - 1];
    const currentValue = units * lastNav.nav;
    const absoluteReturn = ((currentValue - totalInvested) / totalInvested) * 100;

    const years = (end - start) / (365.25 * 24 * 60 * 60 * 1000);
    const annualizedReturn = (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100;

    setResults({
      totalInvested: totalInvested.toFixed(2),
      currentValue: currentValue.toFixed(2),
      absoluteReturn: absoluteReturn.toFixed(2),
      annualizedReturn: annualizedReturn.toFixed(2),
    });

    const chartPoints = investmentSchedule.map((item) => ({
      date: item.date,
      invested: parseFloat(item.invested.toFixed(2)),
      value: parseFloat(item.value.toFixed(2)),
    }));

    setChartData(chartPoints);
  };

  const findClosestNav = (navArray, targetDate) => {
    let closest = null;
    let minDiff = Infinity;

    for (const nav of navArray) {
      const navDate = new Date(nav.date);
      const diff = Math.abs(navDate - targetDate);

      if (diff < minDiff) {
        minDiff = diff;
        closest = nav;
      }
    }

    return closest;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 text-blue-800">SIP Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* SIP Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SIP Amount (₹)
          </label>
          <input
            type="number"
            value={sipAmount}
            onChange={(e) => setSipAmount(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="500"
          />
        </div>

        {/* Frequency */}
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

        {/* Start Date */}
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

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={calculateSIPReturns}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Calculate Returns
      </button>

      {results && (
        <div className="mt-8">
          {/* Result Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-blue-800">
                ₹{parseFloat(results.totalInvested).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-green-700">
                ₹{parseFloat(results.currentValue).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Absolute Return</p>
              <p
                className={`text-2xl font-bold ${
                  parseFloat(results.absoluteReturn) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {results.absoluteReturn}%
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Annualized Return</p>
              <p
                className={`text-2xl font-bold ${
                  parseFloat(results.annualizedReturn) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {results.annualizedReturn}%
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Investment Growth
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
                  dataKey="invested"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Invested"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Current Value"
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
