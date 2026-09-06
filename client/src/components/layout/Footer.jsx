// FleetHub – Footer Component
import APP_CONFIG from '@/config/appConfig';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex-shrink-0 px-4 md:px-6 py-3 border-t border-[#E5E5E5] dark:border-[#2E2E2E] bg-white dark:bg-[#111111]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#A3A3A3]">
        <p>
          © {currentYear}{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {APP_CONFIG.name}
          </span>
          . Fleet & Food Logistics Management Platform.
        </p>
        <p>
          v{APP_CONFIG.version} · {APP_CONFIG.region}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
