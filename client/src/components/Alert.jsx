import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

const iconMap = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: ExclamationCircleIcon,
};

const baseClasses = 'flex items-start p-4 rounded border-l-4 mb-4';
const styleMap = {
  info: {
    light: 'bg-blue-100 border-blue-500 text-blue-700',
    dark: 'bg-blue-900 border-blue-400 text-blue-100',
  },
  success: {
    light: 'bg-green-100 border-green-500 text-green-700',
    dark: 'bg-green-900 border-green-400 text-green-100',
  },
  warning: {
    light: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    dark: 'bg-yellow-900 border-yellow-400 text-yellow-100',
  },
  error: {
    light: 'bg-red-100 border-red-500 text-red-700',
    dark: 'bg-red-900 border-red-400 text-red-100',
  },
};

function Alert({ type = 'info', message }) {
  const Icon = iconMap[type];
  const style = styleMap[type];

  return (
    <div
      className={`${baseClasses} ${style.light} dark:${style.dark}`}
      role="alert"
    >
      <Icon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default Alert;
