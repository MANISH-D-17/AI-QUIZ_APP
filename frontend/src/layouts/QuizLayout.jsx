import React from 'react';
import { Outlet } from 'react-router-dom';

export default function QuizLayout() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-body selection:bg-primary/30 selection:text-white">
      {/* 
        Distraction-free taking viewport.
        No header menu, footer links, or search bars to maximize concentration.
      */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 md:py-8 flex flex-col justify-between animate-page">
        <Outlet />
      </main>
    </div>
  );
}
