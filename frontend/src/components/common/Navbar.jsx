import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Trophy, Compass, LayoutDashboard, User, Menu, X, BarChart3 } from 'lucide-react';
import { getStats, getProfile } from '../../services/storage';

export default function Navbar() {
  const location = useLocation();
  const [stats, setStats] = useState({ currentStreak: 4 });
  const [profile, setProfile] = useState({ name: 'Alex', avatarInitials: 'AL' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load latest streak & user profile on mount, route changes, and custom storage updates
  useEffect(() => {
    const handleSync = () => {
      setStats(getStats() || { currentStreak: 0 });
      setProfile(getProfile() || { name: 'Alex', avatarInitials: 'AL' });
    };

    handleSync();

    window.addEventListener('profile-updated', handleSync);
    return () => window.removeEventListener('profile-updated', handleSync);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Quizzes', path: '/quizzes', icon: Compass },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Branding */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-tr from-primary to-accent p-2 rounded-xl text-white shadow-lg group-hover:scale-110 transition-all duration-300">
                <Flame className="h-6 w-6 animate-pulse" />
              </div>
              <span className="font-headings font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
                Smart<span className="text-accent font-light">Prep</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-surface-2 text-primary border border-border/80 shadow-inner'
                      : 'text-text-muted hover:text-text hover:bg-surface-2/40'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-primary' : 'text-text-muted'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Section (Streak and Profile Avatar) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Streak Badge */}
            <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 text-secondary px-3 py-1.5 rounded-full text-sm font-bold shadow-md hover:scale-105 transition-all duration-200 cursor-default">
              <Flame className="h-4 w-4 fill-secondary animate-bounce" />
              <span>{stats.currentStreak} Day Streak</span>
            </div>

            {/* Profile Avatar */}
            <Link to="/profile" className="flex items-center space-x-3 group focus:outline-none">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-accent to-primary p-[2px] shadow-md group-hover:rotate-12 transition-all duration-300">
                <div className="h-full w-full rounded-full bg-surface-2 flex items-center justify-center border border-border">
                  <span className="text-sm font-bold text-white tracking-wider">
                    {profile.avatarInitials || 'AL'}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Streak Badge (Mobile) */}
            <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/20 text-secondary px-2.5 py-1 rounded-full text-xs font-bold">
              <Flame className="h-3.5 w-3.5 fill-secondary animate-pulse" />
              <span>{stats.currentStreak}d</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-text-muted hover:text-text p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-2 pt-2 pb-4 space-y-1 shadow-2xl animate-page">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-surface-2 text-primary border border-border/80'
                    : 'text-text-muted hover:text-text hover:bg-surface-2/40'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-text-muted'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="border-t border-border mt-4 pt-4 px-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-accent to-primary p-[2px]">
                <div className="h-full w-full rounded-full bg-surface-2 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{profile.avatarInitials}</span>
                </div>
              </div>
              <span className="font-semibold text-text">{profile.name}</span>
            </div>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="text-primary text-sm font-semibold hover:underline"
            >
              View Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
