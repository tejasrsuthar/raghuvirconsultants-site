import React from 'react';
import { Link } from 'react-router-dom';

export default function FloatingNav() {
  return (
    <nav className="floating-nav flex items-center justify-between gap-12">
      <Link to="/" className="flex items-center">
        {/* Simple text placeholder for logo */}
        <span className="font-bold text-xl tracking-tight">Raghuvir<span className="text-arc">.</span></span>
      </Link>

      <div className="hidden lg:flex items-center gap-12">
        <Link to="/about" className="font-medium hover:text-arc transition-colors">For you</Link>
        <Link to="/services" className="font-medium hover:text-arc transition-colors">For business</Link>
        <Link to="/smallcase" className="font-medium hover:text-arc transition-colors">For innovators</Link>
        <Link to="/news" className="font-medium hover:text-arc transition-colors">News and trends</Link>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-12 h-12 rounded-full border border-ink/20 flex items-center justify-center hover:bg-ink hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <Link to="/portal/login" className="btn-primary hidden md:inline-flex">
          Sign In
        </Link>
      </div>
    </nav>
  );
}
