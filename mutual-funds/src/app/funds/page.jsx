'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";

export default function MutualFunds() {
  const [funds, setFunds] = useState([]);
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const fundsPerPage = 12;

  useEffect(() => {
    setLoading(true); // Show loader when page loads
    fetchMutualFunds();
  }, []);

  useEffect(() => {
    handleSearch();
    setCurrentPage(1);
  }, [search, funds]);

  const fetchMutualFunds = async () => {
    try {
      const res = await fetch('/api/mf');
      const data = await res.json();
      setFunds(data.data);
      setFilteredFunds(data.data);
    } catch (error) {
      console.error('Error fetching mutual funds:', error);
    } finally {
      // Small delay for smooth loading
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleSearch = () => {
    if (!search.trim()) {
      setFilteredFunds(funds);
      return;
    }
    const lowerSearch = search.toLowerCase();
    setFilteredFunds(
      funds.filter(
        (fund) =>
          fund.schemeName.toLowerCase().includes(lowerSearch) ||
          fund.schemeCode.toString().includes(lowerSearch)
      )
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredFunds.length / fundsPerPage);
  const indexOfLastFund = currentPage * fundsPerPage;
  const indexOfFirstFund = indexOfLastFund - fundsPerPage;
  const currentFunds = filteredFunds.slice(indexOfFirstFund, indexOfLastFund);

  const goToPage = (pageNumber) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-[120px] bg-white min-h-screen px-4 md:px-8 lg:px-16">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-blue-800 mb-3">
          Mutual Funds Explorer
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover and track the best performing mutual funds in India. Use the search
          or browse the pages below to find your ideal investment.
        </p>
      </header>

      {/* Search Bar */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by Scheme Name or Code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        />
      </div>

      {/* Total Funds */}
      <div className="text-center mb-6 font-semibold text-blue-700">
        Total Funds: {filteredFunds.length}
      </div>

      {/* Funds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {currentFunds.length === 0 ? (
    <p className="col-span-full text-center text-gray-500 py-16">
      No mutual funds found.
    </p>
  ) : (
    currentFunds.map((fund) => (
      <Link
        key={fund.schemeCode}
        href={`/funds/${fund.schemeCode}`}
        className="block bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-2 cursor-pointer"
      >
        <h3 className="text-lg font-semibold text-blue-800 truncate">
          {fund.schemeName}
        </h3>
        <p className="text-gray-600 mt-2">Scheme Code: {fund.schemeCode}</p>
      </Link>
    ))
  )}
</div>


      {/* Arrow-style Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 items-center space-x-1 flex-wrap">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          >
            First
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
            )
            .map((page, idx, arr) => (
              <span key={page} className="flex">
                {idx > 0 && page - arr[idx - 1] > 1 && (
                  <span className="px-2 py-1">...</span>
                )}
                <button
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded-md border border-blue-600 hover:bg-blue-100 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-600 bg-white'
                  }`}
                >
                  {page}
                </button>
              </span>
            ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          >
            &gt;
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}
