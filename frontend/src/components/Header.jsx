import React from 'react';
import FloatingNav from './FloatingNav';

export default function Header() {
  return (
    <header className="w-full relative z-50">
      <FloatingNav />
    </header>
  );
}
