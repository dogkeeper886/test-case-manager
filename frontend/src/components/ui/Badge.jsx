import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = `
    inline-flex items-center justify-center
    font-sf font-medium
    rounded-full
    transition-all duration-200 ease-out
    select-none
  `;

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // Variant classes
  const variantClasses = {
    default: `
      bg-apple-gray-2 text-apple-gray-7
    `,
    primary: `
      bg-apple-blue text-white
    `,
    success: `
      bg-success text-white
    `,
    warning: `
      bg-warning text-white
    `,
    error: `
      bg-error text-white
    `,
    info: `
      bg-apple-blue/10 text-apple-blue
    `,
    // Test case specific variants
    passed: `
      bg-success text-white
    `,
    failed: `
      bg-error text-white
    `,
    blocked: `
      bg-warning text-white
    `,
    skipped: `
      bg-apple-gray-4 text-white
    `,
    // Importance levels
    high: `
      bg-error text-white
    `,
    medium: `
      bg-warning text-white
    `,
    low: `
      bg-success text-white
    `,
    // Execution types
    manual: `
      bg-apple-gray-3 text-apple-gray-7
    `,
    automated: `
      bg-success text-white
    `,
  };

  return (
    <span
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge; 