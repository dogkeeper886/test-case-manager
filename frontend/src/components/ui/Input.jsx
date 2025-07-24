import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({
  label,
  error,
  success,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  // Base classes
  const baseClasses = `
    w-full
    font-sf
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    placeholder:text-apple-gray-4
  `;

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-apple',
    md: 'px-4 py-2 text-base rounded-apple',
    lg: 'px-6 py-3 text-lg rounded-apple-lg',
  };

  // State classes
  const stateClasses = error
    ? `
        border-error
        focus:ring-error/50
        bg-red-50
      `
    : success
    ? `
        border-success
        focus:ring-success/50
        bg-green-50
      `
    : `
        border-apple-gray-3
        focus:border-apple-blue
        focus:ring-apple-blue/50
        bg-white
        hover:border-apple-gray-4
      `;

  // Icon spacing
  const iconSpacing = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

  // Loading spinner
  const LoadingSpinner = () => (
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
      <svg
        className="animate-spin h-4 w-4 text-apple-gray-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  const inputElement = (
    <div className="relative">
      {icon && iconPosition === 'left' && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-apple-gray-4">
          {icon}
        </div>
      )}
      
      <motion.input
        ref={ref}
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${stateClasses}
          ${iconSpacing}
          ${className}
        `}
        disabled={disabled || loading}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.1 }}
        {...props}
      />
      
      {icon && iconPosition === 'right' && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-apple-gray-4">
          {icon}
        </div>
      )}
      
      {loading && <LoadingSpinner />}
    </div>
  );

  if (label) {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-apple-gray-7">
          {label}
        </label>
        {inputElement}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-error"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-success"
          >
            {success}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <>
      {inputElement}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-error mt-1"
        >
          {error}
        </motion.p>
      )}
      {success && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-success mt-1"
        >
          {success}
        </motion.p>
      )}
    </>
  );
});

Input.displayName = 'Input';

export default Input; 