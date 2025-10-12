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

export default function StepUpCalculator() {
  const [amount, setAmount] = useState(""); // Keep empty to show placeholder
  const [timePeriod, setTimePeriod] = useState(""); 
  const [stepUp, setStepUp] = useState(""); 
  const [annualReturn, setAnnualReturn] = useState(""); 
  const [monthly, setMonthly] = useState(true); // For monthly investments
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);

  const handleCalculate = () => {
    if (!amount || !timePeriod || stepUp === "" || annualReturn === "") {
      return alert("Please fill all fields correctly");
    }

    const principal = parseFloat(amount);
    const years = parseInt(timePeriod);
    const stepUpRate = parseFloat(stepUp);
    const annualRate = parseFloat(annualReturn);

    let totalFV = 0;
    let totalInvestment = 0;
    const data = [];

    for (let i = 0; i < years; i++) {
      const yearlyInvestment = principal * Math.pow(1 + stepUpRate / 100, i);
      totalInvestment += yearlyInvestment * (monthly ? 12 : 1);

      // FV for this year's monthly contributions
      const months = monthly ? 12 : 1;
      let fvThisYear = 0;
      for (let m = 0; m < months; m++) {
        const monthsRemaining = (years - i) * 12 - m; // Remaining months till end
        fvThisYear += yearlyInvestment * Math.pow(1 + annualRate / 100, monthsRemaining / 12);
      }
      totalFV += fvThisYear;

      data.push({
        year: i + 1,
        investedAmount: (yearlyInvestment * months).toFixed(0),
        totalValue: totalFV.toFixed(0),
      });
    }

    setResult({
      totalInvestment,
      finalValue: totalFV,
      gain: totalFV - totalInvestment,
    });

    setChartData(data);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-semibold text-blue-800 mb-6">Step-Up SIP Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <input
          type="number"
          placeholder="Initial Investment (₹)"
          className="border p-2 rounded-xl bg-white text-black"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="number"
          placeholder="Time Period (Years)"
          className="border p-2 rounded-xl bg-white text-black"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
        />
        <input
          type="number"
          placeholder="Step-Up (%)"
          className="border p-2 rounded-xl bg-white text-black"
          value={stepUp}
          onChange={(e) => setStepUp(e.target.value)}
        />
        <input
          type="number"
          placeholder="Annual Return (%)"
          className="border p-2 rounded-xl bg-white text-black"
          value={annualReturn}
          onChange={(e) => setAnnualReturn(e.target.value)}
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
          <p>Total Invested: ₹{result.totalInvestment.toLocaleString()}</p>
          <p>Final Value: ₹{result.finalValue.toLocaleString()}</p>
          <p>Total Gain: ₹{result.gain.toLocaleString()}</p>
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
                dataKey="totalValue"
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
