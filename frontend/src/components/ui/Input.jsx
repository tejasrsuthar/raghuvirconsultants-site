import React from 'react';

export const Input = React.forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={`w-full bg-white border border-ink/50 text-ink rounded-pill px-6 py-3 font-[450] focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all placeholder:text-taupe ${
          error ? 'border-signal focus:border-signal focus:ring-signal' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-signal text-sm px-4">{error}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
