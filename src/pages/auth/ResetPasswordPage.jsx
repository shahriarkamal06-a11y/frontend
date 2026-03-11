import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, formData.password);
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
          <Link
            to="/forgot-password"
            className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successful!</h2>
          <p className="text-gray-600 mb-6">Your password has been reset successfully. You can now login with your new password.</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-red-500 hover:text-red-600 font-medium">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;