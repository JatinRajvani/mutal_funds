export default function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin absolute top-0 left-0" 
             style={{ animationDirection: 'reverse', animationDuration: '1s' }}>
        </div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">Loading funds...</p>
    </div>
  );
}