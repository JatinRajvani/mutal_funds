'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function SipCalculator() {
  const [sipAmount, setSipAmount] = useState('');
  const [years, setYears] = useState('');
  const [returnRate, setReturnRate] = useState('');
  const [result, setResult] = useState(null);

  const calculateSIP = () => {
    if (!sipAmount || !years || !returnRate) return;

    const monthlyRate = returnRate / 12 / 100;
    const months = years * 12;
    const futureValue =
      sipAmount *
      (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const invested = sipAmount * months;
    const returns = futureValue - invested;
    setResult({ futureValue, invested, returns });
  };

  return (
    <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-blue-100 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl text-white">
          <Calculator className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">SIP Calculator</h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Monthly Investment (₹)
          </label>
          <input
            type="number"
            value={sipAmount}
            onChange={(e) => setSipAmount(Number(e.target.value))}
            placeholder="Enter amount"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Time Period (Years)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            placeholder="Enter years"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Expected Return (% p.a.)
          </label>
          <input
            type="number"
            value={returnRate}
            onChange={(e) => setReturnRate(Number(e.target.value))}
            placeholder="Enter return rate"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none transition"
          />
        </div>

        <button
          onClick={calculateSIP}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          Calculate Returns
        </button>

        {result && (
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-2xl border border-blue-200 animate-fadeIn">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Invested Amount</span>
                <span className="text-lg font-bold text-gray-900">
                  ₹{result.invested.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Estimated Returns</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{result.returns.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-3">
                <span className="text-gray-700 font-semibold">Total Value</span>
                <span className="text-xl font-bold text-blue-600">
                  ₹{result.futureValue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
