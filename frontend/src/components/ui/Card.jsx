import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  elevation = 'md',
  hover = true,
  hoverVariant = 'subtle', // New prop for different hover styles
  className = '',
  onClick,
  padding = 'md',
  ...props
}) => {
  // Base classes
  const baseClasses = `
    bg-white
    font-sf
    transition-[box-shadow,transform,background-color,border-color] duration-200 ease-out
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

  // Hover effect variants
  const getHoverClasses = () => {
    if (!hover) return '';
    
    switch (hoverVariant) {
      case 'lift':
        return `
          hover:shadow-apple-md
          hover:-translate-y-1
          cursor-pointer
        `;
      case 'border':
        return `
          hover:border-2
          hover:border-apple-blue/30
          hover:shadow-apple-sm
          cursor-pointer
          border border-transparent
        `;
      case 'background':
        return `
          hover:bg-apple-gray-1/50
          hover:shadow-apple-sm
          cursor-pointer
        `;
      case 'glow':
        return `
          hover:shadow-apple-md
          hover:shadow-apple-blue/20
          cursor-pointer
        `;
      case 'subtle':
      default:
        return `
          hover:shadow-apple-sm
          hover:bg-apple-gray-1/30
          cursor-pointer
        `;
    }
  };

  // Border radius
  const borderRadius = 'rounded-apple-lg';

  const cardContent = (
    <div
      className={`
        ${baseClasses}
        ${elevationClasses[elevation]}
        ${paddingClasses[padding]}
        ${borderRadius}
        ${getHoverClasses()}
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
        whileHover={hover && hoverVariant === 'lift' ? { scale: 1.02 } : {}}
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