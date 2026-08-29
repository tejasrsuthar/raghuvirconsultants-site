import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function RowActionMenu({ items = [], align = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all focus:outline-none ${
          isOpen ? 'bg-gray-100 text-gray-900 shadow-xs' : ''
        }`}
        title="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-48 rounded-2xl bg-white border border-gray-100 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return <div key={idx} className="my-1 border-t border-gray-100" />;
            }

            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (item.onClick) item.onClick();
                }}
                className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed text-gray-400'
                    : item.isDestructive
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${item.isDestructive ? 'text-red-600' : 'text-gray-500'}`} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
