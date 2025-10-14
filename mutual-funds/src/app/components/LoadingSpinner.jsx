export default function InvestmentLoader() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Loader Container */}
      <div className="relative w-32 h-32 flex items-end justify-center gap-2">
        {/* Bars representing investment growth */}
        {[1, 2, 3, 4, 5].map((bar, idx) => (
          <div
            key={idx}
            className="w-4 bg-blue-500 rounded-sm animate-bounce"
            style={{
              animationDuration: `${0.6 + idx * 0.2}s`,
              animationDelay: `${idx * 0.1}s`,
              height: `${20 + idx * 15}px`,
            }}
          ></div>
        ))}

        {/* Rupee Symbol floating above */}
        <span className="absolute -top-10 text-4xl font-bold text-green-600 animate-bounce">
          ₹
        </span>
      </div>
      <p className="mt-6 text-gray-600 font-medium text-lg">
        Tracking your investments...
      </p>
    </div>
  );
}
