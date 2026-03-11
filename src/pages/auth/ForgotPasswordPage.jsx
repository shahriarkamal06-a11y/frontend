import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call delay for effect
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success('Reset link sent to your email!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">

          {/* Decorative background element */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full blur-2xl"></div>

          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              {isSubmitted ? (
                <CheckCircle2 className="w-8 h-8 text-green-500 animate-scale-in" />
              ) : (
                <Mail className="w-8 h-8 text-red-500" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              {isSubmitted ? "Check your mail" : "Forgot Password?"}
            </h2>
            <p className="text-gray-500 leading-relaxed">
              {isSubmitted
                ? "We have sent a password recover instructions to your email."
                : "No worries, we'll send you reset instructions. Please enter your email address."}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
                    placeholder="Enter your exact email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Reset password'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 relative z-10">
              <button
                onClick={() => window.open('https://mail.google.com', '_blank')}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
              >
                Open email app
              </button>

              <div className="text-center text-sm text-gray-500">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-red-500 font-semibold hover:text-red-600 transition-colors"
                >
                  Click to resend
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center relative z-10">
            <Link
              to="/login"
              className="inline-flex items-center text-gray-500 hover:text-gray-800 font-medium transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;