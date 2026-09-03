// FleetHub – 404 Not Found Page
import { useNavigate } from 'react-router-dom';
import { HiOutlineMapPin, HiOutlineHome, HiOutlineArrowLeft } from 'react-icons/hi2';
import Button from '@/components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="text-center max-w-md animate-fade-in">
        {/* Illustration */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200/50 dark:border-primary-800/40 flex items-center justify-center mb-6">
          <HiOutlineMapPin className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>

        {/* Error code */}
        <p className="text-7xl font-black text-gradient mb-4 tracking-tight">404</p>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-sm">
          The requested route does not exist or has been relocated.
          Please return to the main dashboard.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            icon={HiOutlineArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            icon={HiOutlineHome}
            onClick={() => navigate('/')}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
