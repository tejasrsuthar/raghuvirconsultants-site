import React from 'react';

export const PortraitCard = ({ image, eyebrow, title, onAction, className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center w-[260px] md:w-[340px] group ${className}`}>
      {/* Circle Image container */}
      <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-float">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Satellite CTA */}
        {onAction && (
          <button 
            onClick={onAction}
            className="absolute bottom-4 right-4 bg-white text-ink rounded-full w-14 h-14 shadow-lift flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all z-10 translate-x-1/4 translate-y-1/4"
            aria-label={`Action for ${title}`}
          >
            &#8594;
          </button>
        )}
      </div>

      <div className="mt-8 text-center px-4 w-full">
        {eyebrow && (
          <div className="text-[14px] font-bold tracking-eyebrow uppercase flex items-center justify-center gap-2 mb-3 text-slate">
            <span className="w-1.5 h-1.5 bg-signal rounded-full"></span>
            {eyebrow}
          </div>
        )}
        <h3 className="text-2xl font-medium tracking-tightest leading-[1.2] text-ink">
          {title}
        </h3>
      </div>
    </div>
  );
};

export const HeroMediaFrame = ({ children, className = '' }) => {
  return (
    <div className={`w-[calc(100%-48px)] mx-auto overflow-hidden rounded-stadium bg-[#2B2B2B] ${className}`}>
      {children}
    </div>
  );
};
