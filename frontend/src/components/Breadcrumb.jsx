import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs font-semibold text-textmuted mb-6">
      <Link 
        to="/" 
        className="flex items-center gap-1.5 hover:text-forest transition-colors py-0.5"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-textmuted/40 shrink-0" />
            {isLast || !item.to ? (
              <span className="text-forest font-bold py-0.5 truncate max-w-[260px] sm:max-w-none" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link 
                to={item.to} 
                className="hover:text-forest transition-colors py-0.5 truncate max-w-[180px] sm:max-w-none"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
