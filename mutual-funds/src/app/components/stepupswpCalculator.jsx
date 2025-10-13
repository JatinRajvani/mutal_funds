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

export default function StepUpSWPCalculator() {
  const [initialInvestment, setInitialInvestment] = useState("");
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState("");
  const [stepUpPercent, setStepUpPercent] = useState("");
  const [annualReturnRate, setAnnualReturnRate] = useState("");
  const [years, setYears] = useState("");
  const [data, setData] = useState([]);

  const calculateStepUpSWP = () => {
    // 🧮 Validate before calculating
    if (!initialInvestment || !monthlyWithdrawal || !stepUpPercent || !annualReturnRate || !years) {
      alert("Please fill all fields before calculating.");
      return;
    }

    let balance = parseFloat(initialInvestment);
    let withdrawal = parseFloat(monthlyWithdrawal);
    const stepUp = parseFloat(stepUpPercent);
    const annualReturn = parseFloat(annualReturnRate);
    const totalYears = parseFloat(years);

    const monthlyReturn = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
    const chartData = [];

    for (let month = 1; month <= totalYears * 12; month++) {
      if (month % 12 === 0 && month !== 0) {
        withdrawal *= 1 + stepUp / 100;
      }

      balance -= withdrawal;
      balance *= 1 + monthlyReturn;

      chartData.push({
        month,
        balance: balance > 0 ? balance : 0,
        withdrawal: withdrawal.toFixed(0),
      });

      if (balance <= 0) break;
    }

    setData(chartData);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700 text-center">
        Step-Up SWP Calculator
      </h2>

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
          value={annualReturnRate}
          onChange={(e) => setAnnualReturnRate(e.target.value)}
          placeholder="Annual Return %"
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
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Calculate
      </button>

      {data.length > 0 && (
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <p className="mt-4 text-center text-gray-600">
            Final Balance: ₹{data[data.length - 1].balance.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
