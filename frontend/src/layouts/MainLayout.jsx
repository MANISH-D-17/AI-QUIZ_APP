import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-body selection:bg-accent/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar />
      
      {/* Centered Main Page Content with Fade-in Page Animation */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 animate-page">
        <Outlet />
      </main>
      
      {/* Elegant minimal Footer */}
      <Footer />
    </div>
  );
}
