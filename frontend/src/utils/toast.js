import { toast } from 'react-toastify';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

// Apple Design System Colors
const APPLE_COLORS = {
  success: {
    bg: 'bg-apple-green/10',
    border: 'border-apple-green/20',
    text: 'text-apple-green',
    icon: 'text-apple-green'
  },
  error: {
    bg: 'bg-apple-red/10',
    border: 'border-apple-red/20',
    text: 'text-apple-red',
    icon: 'text-apple-red'
  },
  warning: {
    bg: 'bg-apple-orange/10',
    border: 'border-apple-orange/20',
    text: 'text-apple-orange',
    icon: 'text-apple-orange'
  },
  info: {
    bg: 'bg-apple-blue/10',
    border: 'border-apple-blue/20',
    text: 'text-apple-blue',
    icon: 'text-apple-blue'
  }
};

// Apple Design System Icons
const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

// Custom Toast Component following Apple Design Guidelines
const ToastContent = ({ type, message, closeToast }) => {
  const colors = APPLE_COLORS[type];
  const Icon = ICONS[type];

  return (
    <div className={`flex items-center justify-between p-4 rounded-apple border ${colors.bg} ${colors.border} min-w-[320px] max-w-[480px] shadow-lg backdrop-blur-sm`}>
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0`} />
        <span className={`text-sm font-sf font-medium ${colors.text}`}>
          {message}
        </span>
      </div>
      <button
        onClick={closeToast}
        className={`ml-3 p-1 rounded-full hover:bg-black/5 transition-colors ${colors.text}`}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Configuration following Apple Design Guidelines
const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: false, // We'll set this per type
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: false,
  closeButton: false, // We'll use our custom close button
  className: '!p-0 !bg-transparent !shadow-none', // Override default styles
  bodyClassName: '!p-0',
  toastClassName: '!p-0'
};

// Toast Functions following Apple Design Guidelines
export const showSuccess = (message, options = {}) => {
  return toast(
    ({ closeToast }) => <ToastContent type="success" message={message} closeToast={closeToast} />,
    {
      ...TOAST_CONFIG,
      autoClose: 4000, // 4 seconds - Apple guideline
      ...options
    }
  );
};

export const showError = (message, options = {}) => {
  return toast(
    ({ closeToast }) => <ToastContent type="error" message={message} closeToast={closeToast} />,
    {
      ...TOAST_CONFIG,
      autoClose: false, // Errors require user dismissal - Apple guideline
      ...options
    }
  );
};

export const showWarning = (message, options = {}) => {
  return toast(
    ({ closeToast }) => <ToastContent type="warning" message={message} closeToast={closeToast} />,
    {
      ...TOAST_CONFIG,
      autoClose: 6000, // 6 seconds - Apple guideline
      ...options
    }
  );
};

export const showInfo = (message, options = {}) => {
  return toast(
    ({ closeToast }) => <ToastContent type="info" message={message} closeToast={closeToast} />,
    {
      ...TOAST_CONFIG,
      autoClose: 5000, // 5 seconds - Apple guideline
      ...options
    }
  );
};

// Progress toast for loading states
export const showProgress = (message, options = {}) => {
  return toast(
    ({ closeToast }) => (
      <div className="flex items-center justify-between p-4 rounded-apple border bg-apple-blue/10 border-apple-blue/20 min-w-[320px] max-w-[480px] shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-apple-blue border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-sm font-sf font-medium text-apple-blue">
            {message}
          </span>
        </div>
      </div>
    ),
    {
      ...TOAST_CONFIG,
      autoClose: false,
      ...options
    }
  );
};

// Utility to dismiss a specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Utility to dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Export default configuration for ToastContainer
export const TOAST_CONTAINER_CONFIG = {
  position: 'top-right',
  autoClose: false,
  hideProgressBar: true,
  newestOnTop: true,
  closeOnClick: false,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: false,
  pauseOnHover: true,
  limit: 5, // Maximum 5 toasts at once - Apple guideline
  style: {
    zIndex: 9999 // Ensure toasts appear above all content
  }
}; 