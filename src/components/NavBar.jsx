import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Discover' },
    { path: '/pathways', label: 'Learn' },
    { path: '/pulse', label: 'Pulse' },
    { path: '/submit', label: 'Share Story' },
  ];

  return (
    <header className="bg-[#235D4C] fixed top-0 left-0 right-0 z-[100] shadow-lg w-full h-16">
      <div className="max-w-7xl mx-auto h-full">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-5">
              <img src="/assets/logo.png" alt="Logo" className="h-16 w-auto" />
              <div className="hidden sm:block">
                <div className="text-xl font-bold text-white">
                  KSG Storytelling
                </div>
                <div className="text-xs text-white/80 -mt-1">
                  Digital Narratives Platform
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActiveLink(link.path) ? 'text-[#B5955B] border-b-2 border-[#B5955B]' : 'text-white hover:text-[#B5955B] hover:border-b-2 hover:border-[#B5955B]'} px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out hover:-translate-y-[1px]`}
              >
                {link.label}
              </Link>
            ))}
            
            {user?.isAdmin && (
              <Link
                to="/admin"
                className={`nav-link ${isActiveLink('/admin') ? 'active text-blue-600' : ''}`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Menu */}
          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-[#B5955B] hover:bg-[#B5955B] hover:text-white border border-[#B5955B] rounded-md transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105"
                >
                  Logout
                </button>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-[#B5955B] hover:bg-[#B5955B] hover:text-white border border-[#B5955B] rounded-md transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-md border-2 border-[#B5955B] text-[#B5955B] hover:bg-[#B5955B] hover:text-white transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#B5955B] hover:text-white focus:outline-none transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white fixed top-16 left-0 right-0 shadow-lg z-[90]">
            <div className="px-4 py-3 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveLink(link.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveLink('/admin')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}

              <div className="pt-3 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center px-3 py-2">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        {user.isAdmin && (
                          <div className="text-xs text-blue-600">Admin</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;