// FleetHub – Full-Page Loader Component
const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm">
      {/* Animated logo */}
      <div className="relative mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-soft shadow-lg shadow-primary-900/20"
          style={{ background: 'linear-gradient(135deg, #0F6B7A, #14B8A6)' }}
        >
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        {/* Orbiting ring */}
        <div
          className="absolute -inset-2 rounded-2xl border-2 border-primary-200 dark:border-primary-900/40 animate-spin-slow"
          style={{ borderTopColor: '#0F6B7A' }}
        />
      </div>

      {/* Loading text */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Fleet<span className="text-secondary-500">Hub</span>
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
            className="w-2 h-2 rounded-full bg-primary-600"
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
