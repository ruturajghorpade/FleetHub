// FleetHub – Full-Page Loader Component
const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-[#090909]/90 backdrop-blur-sm">
      {/* Animated logo */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center p-2.5 bg-[#111111] border border-[#2E2E2E] shadow-xl shadow-black/40">
          <img
            src="/assets/fleethub-logo-mark.png"
            alt="FleetHub"
            className="w-11 h-11 object-contain animate-pulse-soft"
          />
        </div>
        {/* Orbiting ring */}
        <div
          className="absolute -inset-2 rounded-2xl border-2 border-amber-500/20 border-t-amber-500 animate-spin-slow"
        />
      </div>

      {/* Loading text */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Fleet<span className="text-amber-500">Hub</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 animate-pulse-soft">
          {message}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-amber-500"
            style={{
              animation: `pulseSoft 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loader;
