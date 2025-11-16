import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const roles = [
    'Faculty Member',
    'KSG Staff',
    'Alumni',
    'Partner Organization',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegistering) {
        // Register new user
        const result = await register({
          email: formData.email,
          username: formData.email.split('@')[0], // Generate username from email
          password: formData.password,
          full_name: formData.name,
          role: 'user',
          organization: 'Kenya School of Government',
          county: 'Nairobi' // Default, can be updated in profile
        });

        if (!result.success) {
          setError(result.error);
        }
      } else {
        // Login existing user
        const result = await login(formData.email, formData.password);
        
        if (!result.success) {
          setError(result.error);
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center section-ksg-padding">
      <div className="max-w-md w-full mx-auto">
        {/* KSG-Inspired Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-[#235D4C] to-[#B5955B] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {isRegistering ? 'Join KSG Platform' : 'Welcome to KSG'}
          </h2>
          <div className="text-[#B5955B] text-xl font-semibold mb-2">
            Digital Storytelling Platform
          </div>
          <p className="text-gray-600 leading-relaxed">
            {isRegistering 
              ? 'Create an account to share your transformational stories'
              : 'Join Kenya\'s premier knowledge network'}
          </p>
        </div>

        {/* KSG-Inspired Login/Register Form */}
        <div className="bg-white rounded-lg shadow-md p-8 border-2 border-[#235D4C]/10 hover:border-[#235D4C]/20 transition-all duration-200">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field - Only for registration */}
            {isRegistering && (
              <div className="form-ksg-group">
                <label htmlFor="name" className="form-ksg-label">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="form-ksg-group">
              <label htmlFor="email" className="form-ksg-label">
                Official Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50"
                placeholder="name@organization.go.ke"
              />
              <div className="mt-2 text-sm text-[#235D4C]/70 flex items-center">
                <svg className="h-4 w-4 text-blue-500 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                KSG staff emails (@ksg.ac.ke) receive administrative privileges
              </div>
            </div>

            {/* Password Field */}
            <div className="form-ksg-group">
              <label htmlFor="password" className="form-ksg-label">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 placeholder-gray-400 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50"
                placeholder={isRegistering ? "Create a strong password" : "Enter your password"}
              />
              {isRegistering && (
                <div className="mt-2 text-sm text-[#235D4C]/70">
                  Password must be at least 8 characters
                </div>
              )}
            </div>

            {/* Role Field - Only for registration */}
            {isRegistering && (
              <div className="form-ksg-group">
                <label htmlFor="role" className="form-ksg-label">
                  Your Role at KSG
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50"
                >
                  <option value="">Select your role (optional)</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <div className="mt-2 text-sm text-[#235D4C]/70">
                  This helps us customize your platform experience
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-4 px-6 border-2 border-transparent rounded-lg shadow-md text-base font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#B5955B] hover:bg-[#B5955B]/90 hover:border-[#235D4C]/50 focus:ring-[#B5955B]/20'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{isRegistering ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>{isRegistering ? 'Create Account' : 'Access Platform'}</span>
                </div>
              )}
            </button>

            {/* Toggle between Login/Register */}
            <div className="text-center pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="text-[#235D4C] hover:text-[#B5955B] font-medium transition-colors"
              >
                {isRegistering 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Register"}
              </button>
            </div>
          </form>

          {/* Test Credentials - Only show in login mode */}
          {!isRegistering && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-2">Test Credentials</p>
                    <div className="text-xs text-blue-800 space-y-1">
                      <p><strong>Email:</strong> test@ksg.ac.ke</p>
                      <p><strong>Password:</strong> password123</p>
                      <p className="mt-2 text-blue-600">This account has admin privileges</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* KSG Platform Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-[#235D4C]/10">
          <div className="text-center">
            <h3 className="font-semibold text-[#235D4C] mb-4 flex items-center justify-center">
              <svg className="h-5 w-5 text-[#B5955B] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Platform Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <svg className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Share multimedia impact stories</span>
              </div>
              <div className="flex items-start space-x-2">
                <svg className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Connect across 47 counties</span>
              </div>
              <div className="flex items-start space-x-2">
                <svg className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Discover transformational narratives</span>
              </div>
              <div className="flex items-start space-x-2">
                <svg className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Contribute to knowledge development</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security and Trust Indicators */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            By accessing this platform, you agree to contribute meaningful stories that showcase 
            KSG&apos;s impact on Kenya&apos;s development and governance transformation.
          </p>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-[#235D4C] rounded-full animate-pulse"></div>
              <span className="text-xs text-[#235D4C]/70 font-medium">Secure Platform</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-500 font-medium">Government Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-gray-500 font-medium">Impact Focused</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;