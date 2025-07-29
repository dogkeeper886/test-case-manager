import React from 'react';

const Select = React.forwardRef(({ 
  className = '', 
  error, 
  children,
  ...props 
}, ref) => {
  const baseClasses = `
    w-full px-3 py-2 
    border border-apple-gray-3 
    rounded-apple-md 
    bg-white 
    text-apple-gray-7 
    font-sf 
    text-sm
    focus:outline-none 
    focus:ring-2 
    focus:ring-apple-blue/50 
    focus:border-apple-blue
    disabled:bg-apple-gray-1 
    disabled:text-apple-gray-4
    disabled:cursor-not-allowed
    transition-all 
    duration-200
    appearance-none
    bg-[url('data:image/svg+xml;charset=US-ASCII,<svg width="12" height="8" xmlns="http://www.w3.org/2000/svg"><path d="M1.41.59 6 5.17 10.59.59 12 2 6 8 0 2z" fill="%23636366"/></svg>')]
    bg-no-repeat
    bg-[right_12px_center]
    pr-10
  `;

  const errorClasses = error ? 'border-error focus:border-error focus:ring-error/50' : '';
  const combinedClasses = `${baseClasses} ${errorClasses} ${className}`.trim();

  return (
    <select
      ref={ref}
      className={combinedClasses}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

export default Select; 