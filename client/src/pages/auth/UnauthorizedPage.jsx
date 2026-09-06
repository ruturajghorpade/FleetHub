// FleetHub – Unauthorized Page (403)
import { useNavigate } from 'react-router-dom';
import { HiOutlineShieldExclamation, HiOutlineHome, HiOutlineArrowLeft } from 'react-icons/hi2';
import Button from '@/components/common/Button';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-[#090909] p-6">
      <div className="text-center max-w-md animate-fade-in">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 flex items-center justify-center mb-6">
          <HiOutlineShieldExclamation className="w-8 h-8 text-amber-500" />
        </div>

        {/* Error code */}
        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">
          403 · Access Denied
        </p>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
          Unauthorized Access
        </h1>

        {/* Description */}
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-sm">
          You do not have the required permissions to access this view.
          Contact your organization administrator if you require elevated privileges.
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

export default UnauthorizedPage;
