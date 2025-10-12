'use client';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useParams } from 'next/navigation';
// SIP Calculator Component (embedded)
function SIPCalculator({ navData }) {
  const [sipAmount, setSipAmount] = useState(5000);
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);

  const calculateSIPReturns = () => {
    if (!startDate || !endDate || !navData || navData.length === 0) {
      alert('Please fill all fields and ensure NAV data is available');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      alert('End date must be after start date');
      return;
    }

    const filteredNavData = navData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });

    if (filteredNavData.length === 0) {
      alert('No NAV data available for selected date range');
      return;
    }

    let totalInvested = 0;
    let units = 0;
    const investmentSchedule = [];
    let currentDate = new Date(start);

    const frequencyDays = frequency === 'monthly' ? 30 : frequency === 'quarterly' ? 90 : 365;

    while (currentDate <= end) {
      const closestNav = findClosestNav(filteredNavData, currentDate);
      
      if (closestNav) {
        const unitsAdded = sipAmount / closestNav.nav;
        units += unitsAdded;
        totalInvested += sipAmount;

        investmentSchedule.push({
          date: currentDate.toISOString().split('T')[0],
          invested: totalInvested,
          nav: closestNav.nav,
          units: units,
          value: units * closestNav.nav,
        });
      }

      currentDate = new Date(currentDate.setDate(currentDate.getDate() + frequencyDays));
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-blue-800">₹{parseFloat(results.totalInvested).toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-green-700">₹{parseFloat(results.currentValue).toLocaleString('en-IN')}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Absolute Return</p>
              <p className={`text-2xl font-bold ${parseFloat(results.absoluteReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {results.absoluteReturn}%
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Annualized Return</p>
              <p className={`text-2xl font-bold ${parseFloat(results.annualizedReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {results.annualizedReturn}%
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Investment Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={30} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `₹${parseFloat(value).toLocaleString('en-IN')}`}
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

// New Fund Details Card Component
const FundDetailsCard = ({ fund, schemeCode, fundDetails }) => {
  const isActive = fundDetails?.isActive;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      {/* 🔹 Header Section */}
      <div className="border-b pb-6 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-3">
          {fund.schemeName}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="px-3 py-1 bg-blue-50 rounded-full">
            Scheme Code: {schemeCode}
          </span>
          <span className="px-3 py-1 bg-green-50 rounded-full">
            {fund.category}
          </span>
          <span className="px-3 py-1 bg-purple-50 rounded-full">
            {fund.schemeType}
          </span>
        </div>
      </div>

      {/* 🔹 About Section */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          About this Fund
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {fund.description ||
            `${fund.schemeName} is a ${fund.category.toLowerCase()} mutual fund scheme 
          managed by ${fund.fundHouse}. It focuses on generating long-term capital growth 
          through diversified investments in ${fund.category.toLowerCase()} instruments.`}
        </p>
      </div>

      {/* 🔹 Fund Overview (Merged Info + Performance) */}
      {fundDetails && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Fund Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Fund House */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Fund House</h3>
              <p className="text-lg font-semibold text-gray-800">
                {fund.fundHouse}
              </p>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
              <p className="text-lg font-semibold text-gray-800">
                {fundDetails.startDate}
              </p>
            </div>

            {/* Start Price */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Start Price</h3>
              <p className="text-lg font-semibold text-gray-800">
                ₹{fundDetails.startPrice}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Highest NAV</h3>
              <p className="text-lg font-semibold text-gray-800">
                ₹{fundDetails.highestNav ? fundDetails.highestNav.toFixed(2) : 'N/A'}
              </p>
            </div>


            {/* Conditional Section for Active/Inactive Funds */}
            {isActive ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Latest NAV
                  </h3>
                  <p className="text-lg font-semibold text-gray-800">
                    ₹{parseFloat(fundDetails.endPrice).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Updated On
                  </h3>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(fundDetails.endDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                  <p className="text-lg font-semibold text-gray-800">
                    {fundDetails.endDate}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    End Price
                  </h3>
                  <p className="text-lg font-semibold text-gray-800">
                    ₹{fundDetails.endPrice}
                  </p>
                </div>
              </>
            )}

            {/* Fund Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p
                className={`text-lg font-semibold ${
                  isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </p>
            </div>

                <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Lowest NAV</h3>
              <p className="text-lg font-semibold text-gray-800">
                ₹{fundDetails.lowestNav ? fundDetails.lowestNav.toFixed(2) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



// Main MF Detail Page Component
export default function MFDetailPage() {
  const [schemeCode, setSchemeCode] = useState('');
  const [fund, setFund] = useState(null);
  const [navData, setNavData] = useState([]);
  const [returns, setReturns] = useState({});
  const [loading, setLoading] = useState(true);
  const [fundDetails, setFundDetails] = useState({});
  const [chartDuration, setChartDuration] = useState('1y'); // '1y', '5y', 'all'

  const { code } = useParams();
  useEffect(() => {
    // Extract scheme code from URL (for demonstration, using a default value)
    // In your actual app, you'd get this from the router

    setSchemeCode(code);
  }, []);


useEffect(() => {
  if (!schemeCode) return;

  const fetchFund = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scheme/${schemeCode}`);
      const data = await res.json();
      console.log(data);

      setFund(data.metadata);

      // 🧩 Process NAV history
      const navs = data.navHistory.map((item) => ({
        date: item.date,
        nav: parseFloat(item.nav),
      }));
      setNavData(navs.reverse());

      // 🧮 Compute returns
      setReturns(computeReturns(navs));

      // ✅ Helper to fix date format (DD-MM-YYYY → YYYY-MM-DD)
      const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("-");
        return `${year}-${month}-${day}`;
      };

      // 🧩 Basic details
      const latestNav = navs[navs.length - 1];
      const firstNav = navs[0];
      const formattedDate = formatDate(latestNav.date);
      const latestNavDate = new Date(formattedDate);
      const currentDate = new Date();
      const diffDays = Math.floor(
        (currentDate - latestNavDate) / (1000 * 60 * 60 * 24)
      );

      let isActive, statusDate;
      if (diffDays > 30) {
        isActive = false;
        statusDate = latestNav.date;
      } else {
        isActive = true;
        statusDate = latestNav.date;
      }

      // 🧮 Find highest & lowest NAV
      const highest = navs.reduce((a, b) => (a.nav > b.nav ? a : b));
      const lowest = navs.reduce((a, b) => (a.nav < b.nav ? a : b));

      // 🧩 Combine all details in one object
      const details = {
        startDate: firstNav.date,
        endDate: latestNav.date,
        startPrice: firstNav.nav,
        endPrice: latestNav.nav,
        fundName: data.metadata.schemeName,
        fundCode: schemeCode,
        isActive,
        statusDate,
        highestNav: highest.nav,
        highestNavDate: highest.date,
        lowestNav: lowest.nav,
        lowestNavDate: lowest.date,
      };

      setFundDetails(details);
    } catch (error) {
      console.error("Error fetching fund:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchFund();
}, [schemeCode]);


  const computeReturns = (navs) => {
    if (!navs || navs.length === 0) return {};
    const todayNav = navs[navs.length - 1].nav;

    const getPastNav = (monthsAgo) => {
      const pastIndex = navs.length - 1 - monthsAgo * 20;
      if (pastIndex < 0) return navs[0].nav;
      return navs[pastIndex].nav;
    };

    return {
      '1m': (((todayNav - getPastNav(1)) / getPastNav(1)) * 100).toFixed(2),
      '3m': (((todayNav - getPastNav(3)) / getPastNav(3)) * 100).toFixed(2),
      '6m': (((todayNav - getPastNav(6)) / getPastNav(6)) * 100).toFixed(2),
      '1y': (((todayNav - getPastNav(12)) / getPastNav(12)) * 100).toFixed(2),
    };
  };

  useEffect(() => {
    if (fundDetails && !fundDetails.isActive) {
      setChartDuration('all');
    }
  }, [fundDetails]);

  const getFilteredNavData = () => {
    if (!navData.length) return [];
    
    // If fund is inactive, always return all data
    if (!fundDetails.isActive) {
      return navData;
    }
    
    const lastDate = new Date(navData[navData.length - 1].date);
    
    switch (chartDuration) {
      case '1y':
        const oneYearAgo = new Date(lastDate);
        oneYearAgo.setFullYear(lastDate.getFullYear() - 1);
        return navData.filter(item => new Date(item.date) >= oneYearAgo);
      
      case '5y':
        const fiveYearsAgo = new Date(lastDate);
        fiveYearsAgo.setFullYear(lastDate.getFullYear() - 5);
        return navData.filter(item => new Date(item.date) >= fiveYearsAgo);
      
      case 'all':
      default:
        return navData;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="pt-[120px] min-h-screen bg-gray-50 px-4">
        <p className="text-center mt-20 text-gray-600">Fund not found</p>
      </div>
    );
  }

  return (
    <div className="pt-[120px] bg-gray-50 min-h-screen px-4 md:px-8 lg:px-16 pb-12">
      <FundDetailsCard fund={fund} schemeCode={schemeCode} fundDetails={fundDetails} />

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            NAV Chart History
          </h2>
          
          {/* Only show duration selector for active funds */}
          {fundDetails.isActive ? (
            <select
              value={chartDuration}
              onChange={(e) => setChartDuration(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1y">Last 1 Year</option>
              <option value="5y">Last 5 Years</option>
              <option value="all">All Time</option>
            </select>
          ) : (
            <div className="text-sm text-red-600 font-medium">
              Inactive Fund - Showing Complete History
            </div>
          )}
        </div>

        {/* Add warning message for inactive funds */}
        {!fundDetails.isActive && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            This fund is inactive. Last NAV updated on {fundDetails.statusDate}. 
            Displaying complete historical data.
          </div>
        )}

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={getFilteredNavData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              minTickGap={30}
              tick={{ fontSize: 12 }}
              tickFormatter={(dateStr) => {
                // Handle date formatting with error checking
                try {
                  // Check if date is in DD-MM-YYYY format
                  if (dateStr.includes('-')) {
                    const [day, month, year] = dateStr.split('-');
                    const date = new Date(`${year}-${month}-${day}`);
                    if (isNaN(date.getTime())) throw new Error('Invalid date');
                    return date.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit'
                    });
                  }
                  // If date is already in ISO format
                  const date = new Date(dateStr);
                  if (isNaN(date.getTime())) throw new Error('Invalid date');
                  return date.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: '2-digit'
                  });
                } catch (error) {
                  console.error('Date parsing error:', dateStr);
                  return 'Invalid Date';
                }
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value) => [`₹${value}`, 'NAV']}
              labelFormatter={(dateStr) => {
                try {
                  // Check if date is in DD-MM-YYYY format
                  if (dateStr.includes('-')) {
                    const [day, month, year] = dateStr.split('-');
                    const date = new Date(`${year}-${month}-${day}`);
                    if (isNaN(date.getTime())) throw new Error('Invalid date');
                    return date.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    });
                  }
                  // If date is already in ISO format
                  const date = new Date(dateStr);
                  if (isNaN(date.getTime())) throw new Error('Invalid date');
                  return date.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  });
                } catch (error) {
                  console.error('Tooltip date parsing error:', dateStr);
                  return 'Invalid Date';
                }
              }}
            />
            <Line 
              type="monotone" 
              dataKey="nav" 
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={false}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Historical Returns
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 border-b">
                  Period
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700 border-b">
                  Return (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: '1m', label: '1 Month' },
                { key: '3m', label: '3 Months' },
                { key: '6m', label: '6 Months' },
                { key: '1y', label: '1 Year' },
              ].map((period) => (
                <tr key={period.key} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 border-b text-gray-700">
                    {period.label}
                  </td>
                  <td className={`px-6 py-4 border-b font-semibold ${
                    parseFloat(returns[period.key]) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {returns[period.key] ? `${returns[period.key]}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SIPCalculator navData={navData} />
    </div>
  );
}