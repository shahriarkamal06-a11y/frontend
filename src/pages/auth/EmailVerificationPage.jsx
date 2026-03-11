import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const token = searchParams.get('token');

  const getErrorMessage = (error, fallback) => {
    const errors = error?.response?.data?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      return errors.map(err => err.message || err.field).join(', ');
    }
    return error?.response?.data?.message || fallback;
  };

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await authAPI.verifyEmail({ token });
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        toast.success('Email verified successfully!');
      } catch (error) {
        setStatus('error');
        const errorMessage = getErrorMessage(error, 'Email verification failed');
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [token]);

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const response = await authAPI.resendVerification({ email });
      toast.success('Verification email sent! Please check your inbox.');
      setEmail('');
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to send verification email');
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Continue to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {/* Resend verification form */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-800">Resend Verification Email</h3>
              </div>
              <form onSubmit={handleResendVerification} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </form>
            </div>
            
            <div className="space-y-3">
              <Link
                to="/login"
                className="block px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Back to Login
              </Link>
              <Link
                to="/"
                className="block px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;