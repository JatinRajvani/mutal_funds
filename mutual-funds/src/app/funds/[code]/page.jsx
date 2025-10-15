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
import { FaRupeeSign, FaChartLine, FaCoins, FaArrowUp, FaExchangeAlt } from "react-icons/fa";
const calculators = [
  { key: "sip", label: "SIP Calculator", icon: <FaRupeeSign size={24} /> },
  { key: "swp", label: "SWP Calculator", icon: <FaChartLine size={24} /> },
  { key: "lumpsum", label: "Lumpsum Calculator", icon: <FaCoins size={24} /> },
  { key: "stepup", label: "Step-up Calculator", icon: <FaArrowUp size={24} /> },
  { key: "stepup_swp", label: "Step-up SWP", icon: <FaExchangeAlt size={24} /> },
  { key: "rolling", label: "Rolling Returns", icon: <FaExchangeAlt size={24} /> },
];

import { useParams } from 'next/navigation';
import SIPCalculator from '../../components/SipCalculator';
import SWPCalculator from '@/app/components/SWPCalculator';
import HybridLumpsumCalculator from '@/app/components/LumsumpCalculator';
import StepUpCalculator from '@/app/components/stepupCalculator';
import StepUpSWPCalculator from '@/app/components/stepupswpCalculator';
import RollingReturnDashboard from '@/app/components/rollingreturn';
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
  const [activeTab, setActiveTab] = useState("sip");
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

  const parseNavDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Sort NAVs ascending by date (safety)
  const sortedNavs = [...navs].sort((a, b) => parseNavDate(a.date) - parseNavDate(b.date));

  const todayNavObj = sortedNavs[sortedNavs.length - 1];
  const todayNav = parseFloat(todayNavObj.nav);
  const todayDate = parseNavDate(todayNavObj.date);

  const getNavBeforeOrOn = (targetDate) => {
    const pastNavs = sortedNavs.filter(n => parseNavDate(n.date) <= targetDate);
    if (pastNavs.length === 0) return parseFloat(sortedNavs[0].nav);
    return parseFloat(pastNavs[pastNavs.length - 1].nav);
  };

  const periods = {
    '1d': 1,
    '1m': 1,
    '3m': 3,
    '6m': 6,
    '1y': 12
  };

  const returns = {};

  for (const [key, value] of Object.entries(periods)) {
    const targetDate = new Date(todayDate);
    if (key === '1d') {
      targetDate.setDate(todayDate.getDate() - value);
    } else {
      targetDate.setMonth(todayDate.getMonth() - value);
    }

    const pastNav = getNavBeforeOrOn(targetDate);
    const ret = ((todayNav - pastNav) / pastNav) * 100;
    returns[key] = ret.toFixed(2);
  }

  return returns;
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

  // console.log(returns)

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
                { key: '1d', label: '1 Day' },
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
      <div className="flex flex-wrap gap-4 mb-6">
        {calculators.map((calc) => (
          <button
            key={calc.key}
            onClick={() => setActiveTab(calc.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
              activeTab === calc.key
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-blue-100"
            }`}
          >
            {calc.icon}
            {calc.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="border-t border-gray-200 pt-6">
        {activeTab === "sip" && <SIPCalculator navData={navData} />}
        {activeTab === "swp" && <SWPCalculator navData={navData} returns={returns} />}
        {activeTab === "lumpsum" && <HybridLumpsumCalculator navData={navData} returns={returns} />}
        {activeTab === "stepup" && <StepUpCalculator  navData={navData} returns={returns} />}
        {activeTab === "stepup_swp" && <StepUpSWPCalculator navData={navData} returns={returns} />}
        {activeTab === "rolling" && <RollingReturnDashboard navData={navData} />}
      </div>
    </div>
  );
}