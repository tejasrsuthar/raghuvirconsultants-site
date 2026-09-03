import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-sans focus:outline-none transition-all duration-200";
  
  const variants = {
    primary: "bg-ink text-canvas rounded-button px-6 py-1.5 border-[1.5px] border-ink font-medium tracking-tightest hover:bg-ink/90 active:scale-95",
    secondary: "bg-white text-ink rounded-button px-6 py-1.5 border-[1.5px] border-ink font-[450] hover:bg-bone active:scale-95",
    consent: "bg-signal text-white rounded-consent px-[30px] py-[1px] border-0 text-[13px] tracking-[0.13px] font-normal hover:bg-signal/90",
    satellite: "bg-white text-ink rounded-full w-14 h-14 shadow-float flex items-center justify-center text-xl hover:scale-105 active:scale-95",
    icon: "bg-transparent text-ink border border-ink rounded-full w-10 h-10 flex items-center justify-center hover:bg-ink hover:text-white"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
