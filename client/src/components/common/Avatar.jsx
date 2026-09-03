// FleetHub – Avatar Component
import { getInitials, stringToColor } from '@/utils/helpers';

const SIZES = {
  xs: 'w-6 h-6 text-2xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const Avatar = ({
  src,
  name = '',
  size = 'md',
  className = '',
}) => {
  const initials = getInitials(name);
  const bgColor = stringToColor(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${SIZES[size]} rounded-xl object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${SIZES[size]}
        rounded-xl flex items-center justify-center
        font-bold text-white flex-shrink-0
        ${className}
      `}
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
