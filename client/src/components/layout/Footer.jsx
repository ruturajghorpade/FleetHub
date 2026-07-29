// FleetHub – Footer Component
import APP_CONFIG from '@/config/appConfig';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex-shrink-0 px-4 md:px-6 py-3 border-t border-gray-200/60 dark:border-dark-700/60 bg-white/50 dark:bg-dark-900/50 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-dark-400 dark:text-dark-500">
        <p>
          © {currentYear}{' '}
          <span className="font-semibold text-dark-600 dark:text-dark-300">
            {APP_CONFIG.name}
          </span>
          . All rights reserved.
        </p>
        <p>
          v{APP_CONFIG.version} · Built for{' '}
          <span className="text-primary-600 dark:text-primary-400">{APP_CONFIG.region}</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
