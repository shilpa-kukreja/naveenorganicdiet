export const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-opacity-70 z-[9999]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#00a63d] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-lg font-medium animate-pulse">trackorder is loading...</p>
      </div>
    </div>
  );
};
