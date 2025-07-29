import React from 'react';

const Textarea = React.forwardRef(({ 
  className = '', 
  error, 
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
    placeholder:text-apple-gray-4
    focus:outline-none 
    focus:ring-2 
    focus:ring-apple-blue/50 
    focus:border-apple-blue
    disabled:bg-apple-gray-1 
    disabled:text-apple-gray-4
    disabled:cursor-not-allowed
    transition-all 
    duration-200
    resize-vertical
  `;

  const errorClasses = error ? 'border-error focus:border-error focus:ring-error/50' : '';
  const combinedClasses = `${baseClasses} ${errorClasses} ${className}`.trim();

  return (
    <textarea
      ref={ref}
      className={combinedClasses}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea; 