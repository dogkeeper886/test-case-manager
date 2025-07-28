import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Base classes
  const baseClasses = `
    inline-flex items-center justify-center
    font-sf font-medium
    transition-[background-color,box-shadow,transform,border-color] duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    select-none
  `;

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-apple',
    md: 'px-4 py-2 text-base rounded-apple',
    lg: 'px-6 py-3 text-lg rounded-apple-lg',
    xl: 'px-8 py-4 text-xl rounded-apple-lg',
  };

  // Variant classes
  const variantClasses = {
    primary: `
      bg-apple-blue text-white
      hover:bg-blue-600
      focus:ring-apple-blue/50
      shadow-apple-sm hover:shadow-apple
      active:scale-95
    `,
    secondary: `
      bg-apple-gray-2 text-apple-gray-7
      hover:bg-apple-gray-3
      focus:ring-apple-gray-4/50
      border border-apple-gray-3
      active:scale-95
    `,
    ghost: `
      bg-transparent text-apple-blue
      hover:bg-apple-blue/10
      focus:ring-apple-blue/50
      active:scale-95
    `,
    danger: `
      bg-error text-white
      hover:bg-red-600
      focus:ring-error/50
      shadow-apple-sm hover:shadow-apple
      active:scale-95
    `,
    success: `
      bg-success text-white
      hover:bg-green-600
      focus:ring-success/50
      shadow-apple-sm hover:shadow-apple
      active:scale-95
    `,
  };

  // Icon spacing
  const iconSpacing = icon ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : '';

  // Loading spinner
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
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
  );

  // Content with icon
  const content = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </>
  );

  return (
    <motion.button
      type={type}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${iconSpacing}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {content}
    </motion.button>
  );
};

export default Button; 