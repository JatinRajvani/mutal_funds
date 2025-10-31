'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";
import Loading from './loading';

export default function MutualFunds() {
  const [mounted, setMounted] = useState(false);
  const [funds, setFunds] = useState([]);
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search); // ✅ added
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const fundsPerPage = 16;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Debounce search value
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 1000);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (mounted) {
      setLoading(true);
      fetchMutualFunds();
    }
  }, [filterType, mounted]);

  // ✅ Use debounced search instead of direct search
  useEffect(() => {
    if (mounted) {
      handleSearch(debouncedSearch);
      setCurrentPage(1);
    }
  }, [debouncedSearch, funds, mounted]);

  const fetchMutualFunds = async () => {
    try {
      const endpoint = filterType === 'active'
        ? '/api/activeusers'
        : '/api/mf';
      const res = await fetch(endpoint);
      const data = await res.json();

      const fundData = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setFunds(fundData);
      setFilteredFunds(fundData);
    } catch (error) {
      console.error('Error fetching mutual funds:', error);
      setFunds([]);
      setFilteredFunds([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleSearch = (searchValue = '') => {
    if (!searchValue.trim()) {
      setFilteredFunds(funds);
      return;
    }
    const lowerSearch = searchValue.toLowerCase();
    setFilteredFunds(
      funds.filter(
        (fund) =>
          fund.schemeName.toLowerCase().includes(lowerSearch) ||
          fund.schemeCode.toString().includes(lowerSearch)
      )
    );
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  const totalPages = Math.ceil(filteredFunds.length / fundsPerPage);
  const indexOfLastFund = currentPage * fundsPerPage;
  const indexOfFirstFund = indexOfLastFund - fundsPerPage;
  const currentFunds = filteredFunds.slice(indexOfFirstFund, indexOfLastFund);

  return (
    <div className="pt-[120px] bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen px-4 md:px-8 lg:px-16 pb-12">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Mutual Funds Explorer
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover and track the best performing mutual funds in India. Use the search
          or browse the pages below to find your ideal investment.
        </p>
      </header>

      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by Scheme Name or Code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 text-black transition-all"
              />
            </div>

            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All MF
              </button>
              <button
                onClick={() => setFilterType('active')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filterType === 'active'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Active MF
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="bg-white rounded-full px-6 py-2 shadow-md border border-gray-100">
            <span className="text-gray-600">Total Funds: </span>
            <span className="font-bold text-blue-600">{filteredFunds.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {currentFunds.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No mutual funds found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          currentFunds.map((fund) => (
            <Link
              key={fund.schemeCode}
              href={`/funds/${fund.schemeCode}`}
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300"></div>

              <div className="relative p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {fund.schemeName}
                </h3>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Scheme Code</span>
                  <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    {fund.schemeCode}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center space-x-2 flex-wrap justify-center gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
              >
                First
              </button>

              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-lg font-bold bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
              >
                ‹
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, idx, arr) => (
                    <span key={page} className="flex items-center">
                      {idx > 0 && page - arr[idx - 1] > 1 && (
                        <span className="px-2 text-gray-400">···</span>
                      )}
                      <button
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-110'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-lg font-bold bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
              >
                ›
              </button>

              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
              >
                Last
              </button>
            </div>

            <div className="mt-3 text-center text-sm text-gray-600">
              Page <span className="font-semibold text-blue-600">{currentPage}</span> of{' '}
              <span className="font-semibold text-blue-600">{totalPages}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
