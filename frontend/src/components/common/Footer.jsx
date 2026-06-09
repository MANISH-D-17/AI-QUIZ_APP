import React from 'react';
import { Flame } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg border-t border-border py-8 text-center text-sm mt-auto transition-all">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 text-text-muted">
        {/* Brand Copyright */}
        <div className="flex items-center space-x-2">
          <Flame className="h-4 w-4 text-primary fill-primary" />
          <span>&copy; {currentYear} SmartPrep. Engineered for high performance.</span>
        </div>

        {/* Links */}
        <div className="flex space-x-6">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
