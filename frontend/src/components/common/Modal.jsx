import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal wrapper with accessibility and transitions
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card with slide-in animation */}
      <div 
        className={`bg-surface border border-border w-full ${maxWidth} rounded-2xl shadow-2xl p-6 relative z-10 overflow-hidden transform transition-all duration-300 scale-100 animate-page max-h-[90vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-border/80">
          <h3 className="text-lg font-headings font-bold text-text tracking-wide">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text hover:bg-surface-2 p-1.5 rounded-xl transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pt-4 text-text leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
