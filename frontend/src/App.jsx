import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout wrappers
import MainLayout from './layouts/MainLayout';
import QuizLayout from './layouts/QuizLayout';

// Page modules
import Home from './pages/Home';
import QuizList from './pages/QuizList';
import QuizTake from './pages/QuizTake';
import QuizResult from './pages/QuizResult';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      {/* react-hot-toast notifications container */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            border: '1px solid #334155'
          }
        }} 
      />

      <Routes>
        {/* A. STANDALONE PAGES */}
        <Route path="/" element={<Login />} />
        
        {/* B. PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          {/* 1. EXPLORATION ROUTES (using standard Navbar/Footer Layout) */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/result/:id" element={<QuizResult />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          {/* 2. DISTRACTION-FREE ACTIVE QUIZ ROUTE (no headers/footers) */}
          <Route element={<QuizLayout />}>
            <Route path="/quiz/:id" element={<QuizTake />} />
          </Route>
        </Route>

        {/* C. WILDCARD FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
