import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would call an actual authentication API
      login({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isAdmin: formData.email.endsWith('@ksg.ac.ke')
      });
    } catch (error) {
      console.error('Login failed:', error);
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
            Welcome to KSG
          </h2>
          <div className="text-[#B5955B] text-xl font-semibold mb-2">
            Digital Storytelling Platform
          </div>
          <p className="text-gray-600 leading-relaxed">
            Join Kenya's premier knowledge network and share your transformational stories
          </p>
        </div>

        {/* KSG-Inspired Login Form */}
        <div className="bg-white rounded-lg shadow-md p-8 border-2 border-[#235D4C]/10 hover:border-[#235D4C]/20 transition-all duration-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
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
                <svg className="h-4 w-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                KSG staff emails (@ksg.ac.ke) receive administrative privileges
              </div>
            </div>

            {/* Role Field */}
            <div className="form-ksg-group">
              <label htmlFor="role" className="form-ksg-label">
                Your Role at KSG
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-md border-2 border-[#235D4C]/30 bg-white text-gray-800 focus:border-[#B5955B] focus:ring-1 focus:ring-[#B5955B]/20 focus:outline-none transition-all duration-200 hover:border-[#235D4C]/50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23235D4C%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:1.5em_1.5em] bg-[right_0.5rem_center]"
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
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Access Platform</span>
                </div>
              )}
            </button>
          </form>
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
            KSG's impact on Kenya's development and governance transformation.
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