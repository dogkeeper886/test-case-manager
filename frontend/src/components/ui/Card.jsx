import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  elevation = 'md',
  hover = true,
  className = '',
  onClick,
  padding = 'md',
  ...props
}) => {
  // Base classes
  const baseClasses = `
    bg-white
    font-sf
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-apple-blue/50
  `;

  // Elevation classes
  const elevationClasses = {
    none: '',
    sm: 'shadow-apple-sm',
    md: 'shadow-apple',
    lg: 'shadow-apple-md',
    xl: 'shadow-apple-lg',
  };

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Hover effects
  const hoverClasses = hover ? `
    hover:shadow-apple-md
    hover:-translate-y-1
    cursor-pointer
  ` : '';

  // Border radius
  const borderRadius = 'rounded-apple-lg';

  const cardContent = (
    <div
      className={`
        ${baseClasses}
        ${elevationClasses[elevation]}
        ${paddingClasses[padding]}
        ${borderRadius}
        ${hoverClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );

  if (onClick) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={hover ? { scale: 1.02 } : {}}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

// Card sub-components for better organization
Card.Header = ({ children, className = '', ...props }) => (
  <div
    className={`border-b border-apple-gray-2 pb-3 mb-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

Card.Body = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div
    className={`border-t border-apple-gray-2 pt-3 mt-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card; 