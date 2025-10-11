'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function MFDetailPage() {
  const { schemeCode } = useParams();
  console.log(schemeCode);

  const [fund, setFund] = useState(null);
  const [navData, setNavData] = useState([]);
  const [returns, setReturns] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFund = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/scheme/${schemeCode}`);
        const data = await res.json();
        console.log(data);

        setFund(data.metadata);
        // Convert NAV to number for chart and sorting
        const navs = data.navHistory.map((item) => ({
          date: item.date,
          nav: parseFloat(item.nav),
        }));
        setNavData(navs.reverse()); // Oldest first for chart

        // Compute returns
        setReturns(computeReturns(navs));
      } catch (error) {
        console.error('Error fetching fund:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFund();
  }, [schemeCode]);

  // Function to compute simple returns for periods
  const computeReturns = (navs) => {
    if (!navs || navs.length === 0) return {};
    const todayNav = navs[navs.length - 1].nav;

    const getPastNav = (monthsAgo) => {
      const pastIndex = navs.length - 1 - monthsAgo * 20; // approx 20 trading days per month
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!fund) {
    return <p className="text-center mt-20 text-gray-600">Fund not found</p>;
  }

  return (
    <div className="pt-[120px] bg-white min-h-screen px-4 md:px-8 lg:px-16">
      {/* Metadata */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-800">{fund.schemeName}</h1>
        <p className="text-gray-600 mt-2">{fund.fundHouse} | {fund.category}</p>
        <p className="text-gray-500 mt-1">Scheme Type: {fund.schemeType} | ISIN: {fund.isin}</p>
      </header>

      {/* NAV Chart */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">NAV Chart (Last 1 Year)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={navData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" minTickGap={20} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="nav" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Returns Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Pre-computed Returns</h2>
        <table className="w-full text-left border border-gray-200 rounded-lg">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-2 border-b">Period</th>
              <th className="px-4 py-2 border-b">Return (%)</th>
            </tr>
          </thead>
          <tbody>
            {['1m', '3m', '6m', '1y'].map((period) => (
              <tr key={period} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{period}</td>
                <td className="px-4 py-2 border-b">{returns[period] || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
