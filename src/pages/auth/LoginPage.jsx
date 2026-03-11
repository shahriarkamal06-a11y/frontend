import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Facebook, Mail } from 'lucide-react';
import { useAuthStore, useStoreSettingsStore } from '../../store';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const storeName = useStoreSettingsStore((state) => state.store.name) || 'Store';
  const loadSettings = useStoreSettingsStore((state) => state.loadSettings);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSignInChange = (e) => {
    setSignInData({
      ...signInData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignUpChange = (e) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    const result = await login(signInData);

    if (result.success) {
      toast.success('Login successful!');
      // Redirect based on user role
      const { user } = useAuthStore.getState();
      if (user?.role === 'SUPER_ADMIN') {
        navigate('/super-admin/stores');
      } else if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    const password = signUpData.password;
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(password)) {
      toast.error('Password must contain at least one lowercase letter');
      return;
    }
    if (!/\d/.test(password)) {
      toast.error('Password must contain at least one number');
      return;
    }

    const { register } = useAuthStore.getState();
    
    const result = await register({
      email: signUpData.email,
      password: signUpData.password,
      firstName: signUpData.firstName,
      lastName: signUpData.lastName,
      phone: signUpData.phone,
    });

    if (result.success) {
      toast.success('Account created successfully! Please check your email to verify your account.');
      // Switch to sign in form instead of redirecting
      setIsSignUp(false);
      // Clear the signup form
      setSignUpData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: ''
      });
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  const containerClass = `auth-container ${isSignUp ? 'right-panel-active' : ''}`;

  return (
    <div className="min-h-screen bg-gray-100 flex items-start md:items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Welcome to {storeName}
        </h2>

        <div className={containerClass} id="auth-container">

          {/* Sign Up Form */}
          <div className="auth-form-container auth-sign-up-container">
            <form onSubmit={handleSignUpSubmit}>
              <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Create Account</h1>

              <div className="flex space-x-4 mb-6">
                <button type="button" className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Facebook className="w-5 h-5 text-blue-600" />
                </button>
                <button type="button" className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Mail className="w-5 h-5 text-red-500" />
                </button>
              </div>

              <span className="text-sm text-gray-600 mb-6 block">or use your email for registration</span>

              <div className="w-full max-w-sm space-y-4">
                <input
                  type="text"
                  name="firstName"
                  value={signUpData.firstName}
                  onChange={handleSignUpChange}
                  placeholder="First Name"
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={signUpData.lastName}
                  onChange={handleSignUpChange}
                  placeholder="Last Name"
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={signUpData.phone}
                  onChange={handleSignUpChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <p className="text-xs text-gray-500 text-left">
                  Use 8+ characters with uppercase, lowercase, and a number.
                </p>
              </div>

              <button
                type="submit"
                className="mt-6 px-12 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-sm uppercase tracking-wider rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Sign Up
              </button>
            </form>
          </div>

          {/* Sign In Form */}
          <div className="auth-form-container auth-sign-in-container">
            <form onSubmit={handleSignInSubmit}>
              <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Sign In</h1>

              <div className="flex space-x-4 mb-6">
                <button type="button" className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Facebook className="w-5 h-5 text-blue-600" />
                </button>
                <button type="button" className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Mail className="w-5 h-5 text-red-500" />
                </button>
              </div>

              <span className="text-sm text-gray-600 mb-6 block">or use your account</span>

              <div className="w-full max-w-sm space-y-4">
                <input
                  type="email"
                  name="email"
                  value={signInData.email}
                  onChange={handleSignInChange}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={signInData.password}
                    onChange={handleSignInChange}
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-red-500 mt-4 block">
                Forgot your password?
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 px-12 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-sm uppercase tracking-wider rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Overlay Container */}
          <div className="auth-overlay-container">
            <div className="auth-overlay">
              <div className="auth-overlay-panel auth-overlay-left">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">Welcome Back!</h1>
                <p className="text-sm md:text-base mb-6 leading-relaxed px-4">
                  To keep connected with us please login with your personal info
                </p>
                <button
                  className="auth-ghost-btn"
                  onClick={() => setIsSignUp(false)}
                >
                  Sign In
                </button>
              </div>
              <div className="auth-overlay-panel auth-overlay-right">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">Hello, Friend!</h1>
                <p className="text-sm md:text-base mb-6 leading-relaxed px-4">
                  Enter your personal details and start your journey with us
                </p>
                <button
                  className="auth-ghost-btn"
                  onClick={() => setIsSignUp(true)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Toggle Buttons */}
        <div className="md:hidden flex justify-center space-x-4 mt-6">
          <button
            onClick={() => setIsSignUp(false)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isSignUp
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isSignUp
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
          >
            Sign Up
          </button>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-red-500 hover:text-red-600 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
