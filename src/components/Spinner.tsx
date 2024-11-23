const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="relative flex items-center justify-center">
      {/* Outer Ring */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      
      {/* Inner Ring */}
      <div className="absolute animate-spin-reverse rounded-full h-10 w-10 border-t-4 border-b-4 border-green-400"></div>
      
      {/* Center Dot */}
      <div className="absolute h-4 w-4 bg-blue-500 rounded-full"></div>
    </div>
  </div>
);

export default Spinner;
