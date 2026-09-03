// FleetHub – Footer Component
import APP_CONFIG from '@/config/appConfig';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex-shrink-0 px-4 md:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
        <p>
          © {currentYear}{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {APP_CONFIG.name}
          </span>
          . Enterprise Fleet & Logistics Platform.
        </p>
        <p>
          v{APP_CONFIG.version} · {APP_CONFIG.region}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
