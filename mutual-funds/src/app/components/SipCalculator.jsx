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
  const [investmentTable, setInvestmentTable] = useState([]);

  // ---------- Utility: parse dd-mm-yyyy to Date at UTC midnight ----------
  const parseDDMMYYYYToDate = (ddmmYYYY) => {
    // expected format "13-10-2024" or "13/10/2024"
    const s = ddmmYYYY.replace(/\//g, "-").trim();
    const [d, m, y] = s.split("-");
    if (!d || !m || !y) return null;
    // use Date.UTC to avoid timezone shifts
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0));
  };

  // ---------- Date arithmetic that preserves day ----------
  const addMonthsPreserveDay = (date, months) => {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const targetMonth = month + months;
    // create new date in UTC
    const res = new Date(Date.UTC(year, targetMonth, day));
    // if the day overflowed (e.g., Feb 30), JS will roll into next month — fix by setting to last day of prev month
    if (res.getUTCDate() !== day) {
      // set to last day of previous month for the target month
      const lastDay = new Date(Date.UTC(year, targetMonth + 1, 0)).getUTCDate();
      return new Date(Date.UTC(year, targetMonth, lastDay));
    }
    return res;
  };

  const addInterval = (date, freq) => {
    if (freq === "monthly") return addMonthsPreserveDay(date, 1);
    if (freq === "quarterly") return addMonthsPreserveDay(date, 3);
    if (freq === "yearly") return addMonthsPreserveDay(date, 12);
    return addMonthsPreserveDay(date, 1);
  };

  // ---------- Prepare nav array with parsed dates (and sort ascending) ----------
  const prepareNavArray = (rawNavArray) => {
    return rawNavArray
      .map((n) => {
        const parsedDate = parseDDMMYYYYToDate(n.date);
        return {
          rawDate: n.date,
          dateObj: parsedDate,
          time: parsedDate ? parsedDate.getTime() : NaN,
          nav: Number(n.nav),
        };
      })
      .filter((x) => x.dateObj && !Number.isNaN(x.nav))
      .sort((a, b) => a.time - b.time);
  };

  // ---------- Find the closest NAV entry (by absolute time difference) ----------
  const findClosestNav = (navArray, targetDateObj) => {
    if (!targetDateObj) return null;
    let closest = null;
    let minDiff = Infinity;
    const targetTime = targetDateObj.getTime();
    for (const nav of navArray) {
      const diff = Math.abs(nav.time - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = nav;
      }
    }
    return closest; // returns object with rawDate, dateObj, time, nav
  };

  // ---------- Find last NAV on or before target (for selling) ----------
  const findLastNavOnOrBefore = (navArray, targetDateObj) => {
    const targetTime = targetDateObj.getTime();
    let last = null;
    for (const nav of navArray) {
      if (nav.time <= targetTime) last = nav;
      else break;
    }
    return last;
  };

  // ---------- Main calculation ----------
  const calculateSIPReturns = () => {
    if (!startDate || !endDate || !navData || navData.length === 0) {
      alert("Please fill all fields and ensure NAV data is available");
      return;
    }

    // parse start and end from input (these are ISO yyyy-mm-dd from the date input)
    // convert them into UTC midnight for consistent comparison
    const startParts = startDate.split("-");
    const endParts = endDate.split("-");
    const start = new Date(Date.UTC(Number(startParts[0]), Number(startParts[1]) - 1, Number(startParts[2])));
    const end = new Date(Date.UTC(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2])));

    if (start.getTime() >= end.getTime()) {
      alert("End date must be after start date");
      return;
    }

    const navArray = prepareNavArray(navData);
    if (navArray.length === 0) {
      alert("NAV data couldn't be parsed. Ensure API returns dd-mm-yyyy and numeric nav.");
      return;
    }

    let totalInvested = 0;
    let totalUnits = 0;
    const schedule = [];
    let currentSipDate = new Date(start.getTime()); // UTC-preserved

    // buy on each SIP date while SIP date < end
    while (currentSipDate.getTime() < end.getTime()) {
      // find the closest NAV to the intended SIP date (could be same day, previous or next)
      const usedNav = findClosestNav(navArray, currentSipDate);

      if (!usedNav) break; // defensive

      const unitsBought = sipAmount / usedNav.nav;
      totalUnits += unitsBought;
      totalInvested += sipAmount;

      schedule.push({
        sipDateISO: `${currentSipDate.getUTCFullYear()}-${String(currentSipDate.getUTCMonth() + 1).padStart(2, "0")}-${String(currentSipDate.getUTCDate()).padStart(2, "0")}`,
        intendedSipDateRaw: `${String(currentSipDate.getUTCDate()).padStart(2, "0")}-${String(currentSipDate.getUTCMonth() + 1).padStart(2, "0")}-${currentSipDate.getUTCFullYear()}`,
        usedNavRawDate: usedNav.rawDate, // original dd-mm-yyyy from API
        usedNavISO: `${usedNav.dateObj.getUTCFullYear()}-${String(usedNav.dateObj.getUTCMonth() + 1).padStart(2, "0")}-${String(usedNav.dateObj.getUTCDate()).padStart(2, "0")}`,
        nav: usedNav.nav,
        unitsBought,
        totalUnits: totalUnits,
        investedSoFar: totalInvested,
        valueAtUsedNav: totalUnits * usedNav.nav,
      });

      // increment SIP date by interval (preserve day)
      currentSipDate = addInterval(currentSipDate, frequency);
    }

    // SELL: prefer last NAV on or before end date. If none (very odd), pick closest overall.
    let sellNav = findLastNavOnOrBefore(navArray, end);
    if (!sellNav) sellNav = findClosestNav(navArray, end);

    const currentValue = totalUnits * sellNav.nav;
    const absoluteReturn = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
    const years = (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const annualizedReturn = totalInvested > 0 && years > 0 ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100 : 0;

    setResults({
      totalInvested: totalInvested.toFixed(2),
      currentValue: currentValue.toFixed(2),
      absoluteReturn: absoluteReturn.toFixed(2),
      annualizedReturn: annualizedReturn.toFixed(2),
      soldAtRawDate: sellNav.rawDate,
      soldAtISO: `${sellNav.dateObj.getUTCFullYear()}-${String(sellNav.dateObj.getUTCMonth() + 1).padStart(2, "0")}-${String(sellNav.dateObj.getUTCDate()).padStart(2, "0")}`,
      soldNav: sellNav.nav,
      totalUnits: totalUnits,
    });

    // chart points: record each purchase and then an explicit sell point
    const chartPoints = schedule.map((it) => ({
      date: it.usedNavISO,
      invested: parseFloat(it.investedSoFar.toFixed(2)),
      value: parseFloat(it.valueAtUsedNav.toFixed(2)),
    }));

    // push sell point (on sell NAV date)
    chartPoints.push({
      date: `${sellNav.dateObj.getUTCFullYear()}-${String(sellNav.dateObj.getUTCMonth() + 1).padStart(2, "0")}-${String(sellNav.dateObj.getUTCDate()).padStart(2, "0")}`,
      invested: parseFloat(totalInvested.toFixed(2)),
      value: parseFloat(currentValue.toFixed(2)),
    });

    setChartData(chartPoints);
    setInvestmentTable(schedule);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 text-blue-800">SIP Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* SIP Amount */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">SIP Amount (₹)</label>
          <input
            type="number"
            value={sipAmount}
            onChange={(e) => setSipAmount(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">Frequency</label>
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
          <label className="block text-sm font-medium text-black mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">End Date</label>
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
              <p className="text-sm text-black mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-blue-800">₹{parseFloat(results.totalInvested).toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-black mb-1">Current Value</p>
              <p className="text-2xl font-bold text-green-700">₹{parseFloat(results.currentValue).toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-black mb-1">Absolute Return</p>
              <p className={`text-2xl font-bold ${parseFloat(results.absoluteReturn) >= 0 ? "text-green-600" : "text-red-600"}`}>{results.absoluteReturn}%</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-black mb-1">Annualized Return</p>
              <p className={`text-2xl font-bold ${parseFloat(results.annualizedReturn) >= 0 ? "text-green-600" : "text-red-600"}`}>{results.annualizedReturn}%</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Investment Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={30} />
                <YAxis />
                <Tooltip formatter={(value) => `₹${parseFloat(value).toLocaleString("en-IN")}`} />
                <Legend />
                <Line type="monotone" dataKey="invested" stroke="#3b82f6" strokeWidth={2} name="Invested" dot={false} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="Value" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2">
              Sold on <b>{results.soldAtRawDate}</b> (ISO: {results.soldAtISO}) at NAV ₹{results.soldNav}
            </p>
          </div>

          {/* Investment Table */}
          <div className="mt-8 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Investment Details</h3>
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">SIP Date (intended)</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">NAV Date (used)</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">NAV (₹)</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Units Bought</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Total Units</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Total Invested (₹)</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-black">Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                {investmentTable.map((item, i) => (
                  <tr key={i} className="border-t text-sm text-black">
                    <td className="px-4 py-2">{item.sipDateISO}</td>
                    <td className="px-4 py-2">{item.usedNavRawDate} (ISO: {item.usedNavISO})</td>
                    <td className="px-4 py-2">₹{item.nav.toFixed(2)}</td>
                    <td className="px-4 py-2">{item.unitsBought.toFixed(6)}</td>
                    <td className="px-4 py-2">{item.totalUnits.toFixed(6)}</td>
                    <td className="px-4 py-2">₹{item.investedSoFar.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2">₹{item.valueAtUsedNav.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
