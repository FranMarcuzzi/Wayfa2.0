import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        setError(resetError.message || 'Failed to send reset email');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <MapPin className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-text-primary">TripPlanner</span>
            </div>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-apple-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-text-primary mb-4">Check Your Email</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              We've sent a password reset link to <strong>{email}</strong>. 
              Click the link in the email to reset your password.
            </p>
            
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full bg-primary hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
                
                <Link
                  to="/login"
                  className="w-full bg-secondary hover:bg-gray-200 text-text-primary font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-center"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <MapPin className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-text-primary">TripPlanner</span>
          </div>
          <h2 className="text-3xl font-bold text-text-primary">Forgot Password?</h2>
          <p className="mt-2 text-text-secondary">
            No worries! Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-2xl shadow-apple-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email address"
                />
              </div>
              <p className="text-xs text-text-secondary mt-2">
                We'll send a password reset link to this email address
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Sending Reset Link...' : 'Send Reset Link'}</span>
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-text-secondary hover:text-primary font-medium transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Additional Help */}
        <div className="bg-white rounded-xl shadow-apple p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>• Make sure to check your spam/junk folder</p>
            <p>• The reset link will expire in 24 hours</p>
            <p>• If you continue having issues, contact support</p>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-text-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-red-600 font-medium transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;