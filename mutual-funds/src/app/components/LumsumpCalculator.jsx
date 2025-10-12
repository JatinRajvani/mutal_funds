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

export default function HybridLumpsumCalculator({ navData = [], returns = 12 }) {
  const [amount, setAmount] = useState(100000);
  const [fromDate, setFromDate] = useState("");
  const [timePeriod, setTimePeriod] = useState(5);
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Convert "dd-MM-yyyy" string to Date
  const parseDate = (str) => {
    const [day, month, year] = str.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Find closest NAV before or on target date
  const findClosestNAV = (navData, targetDate) => {
    const exact = navData.find(
      (d) =>
        d.date ===
        `${targetDate.getDate().toString().padStart(2, "0")}-${(
          targetDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${targetDate.getFullYear()}`
    );
    if (exact) return parseFloat(exact.nav);

    const sorted = navData
      .map((d) => ({ ...d, nav: parseFloat(d.nav), dateObj: parseDate(d.date) }))
      .sort((a, b) => b.dateObj - a.dateObj);

    const nearest = sorted.find((d) => d.dateObj <= targetDate);
    return nearest ? nearest.nav : sorted[0].nav; // fallback latest
  };

  const generateChartData = (navStart, endDate, annualReturnRate) => {
    const data = [];
    const units = amount / navStart;

    let currentNAV = navStart;
    const currentDate = new Date(fromDate);

    for (let i = 0; i <= timePeriod; i++) {
      let navValue;

      // Future or missing NAV: calculate using annualReturnRate
      if (navData.length === 0 || currentDate >= new Date()) {
        navValue = currentNAV * Math.pow(1 + annualReturnRate / 100, i);
      } else {
        const dateCheck = new Date(currentDate);
        dateCheck.setFullYear(currentDate.getFullYear() + i);
        navValue = findClosestNAV(navData, dateCheck);
      }

      data.push({
        year: currentDate.getFullYear() + i,
        value: (units * navValue).toFixed(0),
      });
    }

    return data;
  };

  const handleCalculate = () => {
    if (!fromDate || !amount) return alert("Please fill all fields");

    const startDate = new Date(fromDate);
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + timePeriod);
    const today = new Date();

    const annualReturnRate = parseFloat(returns['1y']) || 12;

    let navStart = navData.length ? findClosestNAV(navData, startDate) : 1;

    if (startDate >= today || navData.length === 0) {
      // Future investment
      const FV = navStart * Math.pow(1 + annualReturnRate / 100, timePeriod);
      const units = amount / navStart;
      const finalValue = units * FV;
      const gain = finalValue - amount;

      setResult({
        type: "future",
        finalValue,
        gain,
        units,
      });
    } else {
      // Past / mixed investment
      const navEnd =
        endDate > today
          ? navStart * Math.pow(
              1 + annualReturnRate / 100,
              timePeriod - (today.getFullYear() - startDate.getFullYear())
            )
          : findClosestNAV(navData, endDate);

      const units = amount / navStart;
      const finalValue = units * navEnd;
      const gain = finalValue - amount;
      const cagr = Math.pow(finalValue / amount, 1 / timePeriod) - 1;

      setResult({
        type: "past",
        units,
        finalValue,
        gain,
        cagr: cagr * 100,
      });
    }

    // Generate chart data
    const chart = generateChartData(navStart, endDate, annualReturnRate);
    setChartData(chart);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-semibold text-blue-800 mb-6">
        Hybrid Lumpsum Calculator
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <input
          type="number"
          placeholder="Investment Amount (₹)"
          className="border p-2 rounded-xl bg-white text-black"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <input
          type="date"
          className="border p-2 rounded-xl bg-white text-black"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Time Period (Years)"
          className="border p-2 rounded-xl bg-white text-black"
          value={timePeriod}
          onChange={(e) => setTimePeriod(Number(e.target.value))}
        />
      </div>

      <button
        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 mb-6"
        onClick={handleCalculate}
      >
        Calculate
      </button>

      {result && (
        <div className="bg-gray-50 p-6 rounded-2xl shadow-md text-black mb-6">
          {result.type === "future" ? (
            <>
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                Future Projection
              </h2>
              <p>Units Purchased: {result.units.toFixed(2)}</p>
              <p>
                Future Value: ₹
                {result.finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p>
                Total Gain: ₹
                {result.gain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                Past / Mixed Investment
              </h2>
              <p>Units Purchased: {result.units.toFixed(2)}</p>
              <p>
                Final Value: ₹
                {result.finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p>
                Total Gain: ₹
                {result.gain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p>CAGR: {result.cagr.toFixed(2)}%</p>
            </>
          )}
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Investment Growth Chart
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
