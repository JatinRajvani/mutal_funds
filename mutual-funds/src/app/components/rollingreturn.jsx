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

export default function RollingReturnGraphHover({ navData = [] }) {
  const [periodMonths, setPeriodMonths] = useState(12); // default 1 year
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState("overall"); // last1year, last5year, overall

  const periodOptions = [
    { label: "1 Week", months: 1 / 4 },
    { label: "1 Month", months: 1 },
    { label: "3 Months", months: 3 },
    { label: "6 Months", months: 6 },
    { label: "1 Year", months: 12 },
    { label: "3 Years", months: 36 },
    { label: "5 Years", months: 60 },
  ];

  const parseNavData = navData.map(d => ({
    date: d.date,
    nav: parseFloat(d.nav)
  }));

  const calculateRollingReturns = (period) => {
    const rollingReturns = [];
    for (let i = 0; i <= parseNavData.length - period; i++) {
      const start = parseNavData[i];
      const end = parseNavData[i + period - 1];
      const totalReturn = (end.nav / start.nav) - 1;
      const annualizedReturn = Math.pow(end.nav / start.nav, 12 / period) - 1;

      rollingReturns.push({
        fromDate: start.date,
        toDate: end.date,
        fromNAV: start.nav,
        toNAV: end.nav,
        durationMonths: period,
        totalReturn: totalReturn * 100,
        annualizedReturn: annualizedReturn * 100,
        periodIndex: i + 1,
      });
    }
    return rollingReturns;
  };

  const handleCalculate = () => {
    const rolling = calculateRollingReturns(periodMonths);
    setData(rolling);

    // Summary calculation
    if (rolling.length > 0) {
      const overallReturn = rolling[rolling.length - 1].toNAV - rolling[0].fromNAV;
      setSummary({
        totalRolling: rolling.length,
        overallProfit: overallReturn >= 0,
        overallReturn: overallReturn.toFixed(2),
      });
    }
  };

  const filterData = () => {
    if (!data.length) return [];
    const totalPoints = data.length;
    if (filter === "last1year") return data.slice(-12);
    if (filter === "last5year") return data.slice(-60);
    return data; // overall
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const r = payload[0].payload;
      return (
        <div className="bg-white border p-4 rounded-xl shadow-lg text-black">
          <p className="font-semibold">Period Ending: {r.toDate}</p>
          <p>Duration: {r.durationMonths} months</p>
          <p>From NAV: ₹{r.fromNAV}</p>
          <p>To NAV: ₹{r.toNAV}</p>
          <p>Total Return: {r.totalReturn.toFixed(2)}%</p>
          <p>Annualized Return: {r.annualizedReturn.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700 text-center">
        Rolling Return Graph
      </h2>

      {/* Period selection */}
      <div className="flex gap-2 flex-wrap mb-4 justify-center">
        {periodOptions.map((p) => (
          <button
            key={p.label}
            className={`px-4 py-2 rounded-lg font-medium ${
              periodMonths === p.months ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => setPeriodMonths(p.months)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="text-center mb-4">
        <button
          onClick={handleCalculate}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Calculate Rolling Returns
        </button>
      </div>

      {/* Summary Card */}
      {summary && (
        <div className="bg-gray-50 p-4 rounded-xl shadow-inner text-center mb-4">
          <p className="text-lg font-semibold text-black">
            Total Rolling Returns: {summary.totalRolling}
          </p>
          <p className={`text-lg font-bold ${summary.overallProfit ? "text-green-600" : "text-red-600"}`}>
            Overall {summary.overallProfit ? "Profit" : "Loss"}: ₹{summary.overallReturn}
          </p>
        </div>
      )}

      {/* Filter dropdown */}
      {data.length > 0 && (
        <div className="flex justify-end mb-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="last1year">Last 1 Year</option>
            <option value="last5year">Last 5 Years</option>
            <option value="overall">Overall</option>
          </select>
        </div>
      )}

      {/* Graph */}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filterData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodIndex" />
            <YAxis tickFormatter={(val) => val.toFixed(1) + "%"} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="annualizedReturn" stroke="#2563eb" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
