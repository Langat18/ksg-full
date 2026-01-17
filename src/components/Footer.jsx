import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Discover' },
    { path: '/pathways', label: 'Learn' },
    { path: '/pulse', label: 'Pulse' },
  ];

  return (
    <footer className="bg-[#7F622C] text-white mt-16 w-full">
      {/* Main Footer Content */}
      <div className="w-full px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src="/assets/logo.png" 
                alt="KSG Logo" 
                className="h-16 w-auto" 
                onError={(e) => e.target.style.display = 'none'} 
              />
              <div>
                <h3 className="text-2xl font-bold">KSG Storytelling</h3>
                <p className="text-sm text-white/80">Digital Narratives Platform</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              Empowering the Public Service through storytelling and shared experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[#CBD300] mb-6 text-lg">Navigation</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-white/80 hover:text-[#CBD300] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-[#CBD300] mb-6 text-lg">Information</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-white/80 hover:text-[#CBD300] transition-colors"
                >
                  About KSG
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-white/80 hover:text-[#CBD300] transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-white/80 hover:text-[#CBD300] transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Support */}
          <div>
            <h4 className="font-semibold text-[#CBD300] mb-6 text-lg">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-white/80 hover:text-[#CBD300] transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-white/80 hover:text-[#CBD300] transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-white/80 hover:text-[#CBD300] transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-12"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-white/70">
            © {currentYear} Kenya School of Government. All rights reserved.
          </p>
          <div className="flex space-x-8">
            <a 
              href="#" 
              className="text-white/70 hover:text-[#CBD300] transition-colors text-sm"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-white/70 hover:text-[#CBD300] transition-colors text-sm"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-white/70 hover:text-[#CBD300] transition-colors text-sm"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
