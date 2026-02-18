import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Discover' },
    { path: '/pathways', label: 'Learn' },
    { path: '/pulse', label: 'Pulse' },
    { path: '/submit', label: 'Share Story' },
  ];

  return (
    <header className="bg-[#7F622C] fixed top-0 left-0 right-0 z-[100] shadow-lg w-full h-20">
      <div className="h-full w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Logo - Far Left */}
          <div className="flex-shrink-0 bg-white rounded-lg p-2 shadow-md">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/assets/logo.png" 
                alt="KSG Logo" 
                className="h-14 w-auto" 
                onError={(e) => e.target.style.display = 'none'} 
              />
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-[#7F622C]">
                  KSG Storytelling
                </div>
                <div className="text-xs text-gray-600 -mt-0.5">
                  Digital Narratives
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center flex-grow justify-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? 'text-[#7F622C] bg-[#CBD300]'
                    : 'text-white hover:text-black hover:bg-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isActiveLink('/admin')
                    ? 'text-[#7F622C] bg-[#CBD300]'
                    : 'text-white hover:text-black hover:bg-white'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User Menu - Far Right */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                >
                  <div className="h-8 w-8 bg-[#CBD300] rounded-full flex items-center justify-center">
                    <span className="text-[#7F622C] font-semibold text-xs">
                      {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white text-xs font-medium hidden lg:inline-block max-w-[100px] truncate">
                    {user?.full_name || user?.username}
                  </span>
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.full_name || user?.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/submit"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Submit Story
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 rounded-md border-2 border-[#CBD300] text-[#7F622C] bg-[#CBD300] hover:bg-[#CBD300]/90 transition-all duration-200 text-sm font-semibold"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex-shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-[#CBD300] focus:outline-none transition-colors"
            >
              <svg
                className="h-5 w-5"
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
          <div className="md:hidden border-t border-white/20 bg-[#7F622C] fixed top-20 left-0 right-0 shadow-lg z-[90] max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveLink(link.path)
                      ? 'text-[#7F622C] bg-[#CBD300]'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveLink('/admin')
                      ? 'text-[#7F622C] bg-[#CBD300]'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}

              <div className="pt-3 mt-3 border-t border-white/20">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center px-3 py-2">
                      <div className="h-10 w-10 bg-[#CBD300] rounded-full flex items-center justify-center mr-3">
                        <span className="text-[#7F622C] font-semibold">
                          {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user?.full_name || user?.username}
                        </div>
                        <div className="text-xs text-white/70">{user?.email}</div>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-[#CBD300] text-[#7F622C] rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:text-red-200 hover:bg-red-900/20 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-center text-[#7F622C] bg-[#CBD300] hover:bg-[#CBD300]/90 transition-colors"
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