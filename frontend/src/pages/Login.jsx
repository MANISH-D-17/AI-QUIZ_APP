import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser, registerUser } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let res;
      if (isLogin) {
        res = await loginUser({ email: formData.email, password: formData.password });
        toast.success(`Welcome back, ${res.data.name}!`);
      } else {
        res = await registerUser(formData);
        toast.success('Account created successfully!');
      }
      
      // Save token and profile data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('profile', JSON.stringify({
        name: res.data.name,
        email: res.data.email,
        avatarInitials: res.data.name.substring(0, 2).toUpperCase()
      }));
      
      // Dispatch profile update event for Navbar
      window.dispatchEvent(new Event('profile-updated'));

      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-8 animate-page">
      <div className="w-full max-w-6xl bg-surface rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <span className="font-headings font-bold text-2xl text-text">SmartPrep</span>
          </div>

          <h1 className="font-headings font-bold text-3xl sm:text-4xl text-text mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-text-muted mb-8">
            {isLogin 
              ? 'Enter your details to access your personalized learning dashboard.' 
              : 'Join thousands of learners accelerating their careers today.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-text-muted/50" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-text"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted/50" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-text"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-text-muted">Password</label>
                {isLogin && (
                  <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted/50" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-text"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all active:scale-[0.98] mt-2 shadow-lg shadow-primary/25"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-text-muted">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-primary hover:underline transition-all"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block w-1/2 bg-surface-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 z-10 mix-blend-overlay"></div>
          <img 
            src="/login_hero.png" 
            alt="Abstract educational 3D shapes" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        
      </div>
    </div>
  );
}
