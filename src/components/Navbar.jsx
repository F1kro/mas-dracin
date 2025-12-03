import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="text-white shadow-md bg-gradient-to-r from-red-600 to-red-700 backdrop-blur-lg">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        
        {/* Logo */}
        <Link to="/" className="flex items-center text-3xl font-semibold tracking-wider transition-transform hover:scale-105">
          <span className="mr-2">🎬</span>
          <span className="hidden sm:inline">Mas-Dracin</span>
          <span className="sm:hidden">Dracin</span>
        </Link>

        {/* Desktop Menu */}
        <div className="items-center hidden space-x-8 font-medium md:flex">
          <Link to="/" className="transition-colors hover:text-yellow-300 focus:text-yellow-400">Beranda</Link>
          <Link to="/search/new" className="transition-colors hover:text-yellow-300 focus:text-yellow-400">Baru</Link>
          <Link to="/search/trending" className="transition-colors hover:text-yellow-300 focus:text-yellow-400">Trending</Link>
          <Link to="/search/romance" className="transition-colors hover:text-yellow-300 focus:text-yellow-400">Romance</Link>
          <Link to="/search/historical" className="transition-colors hover:text-yellow-300 focus:text-yellow-400">Historical</Link>
        </div>

        {/* Mobile Button */}
        <button
          className="p-2 transition-colors rounded-md md:hidden hover:bg-red-800 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-red-700 to-red-800 rounded-lg shadow-lg p-6 animate-[fadeIn_0.2s]">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block px-4 py-3 text-lg font-semibold transition-colors border-b border-red-800 hover:bg-red-800"
          >
            🏠 Beranda
          </Link>
          <Link
            to="/search/new"
            onClick={() => setIsMenuOpen(false)}
            className="block px-4 py-3 text-lg font-semibold transition-colors border-b border-red-800 hover:bg-red-800"
          >
            🆕 Drama Baru
          </Link>
          <Link
            to="/search/trending"
            onClick={() => setIsMenuOpen(false)}
            className="block px-4 py-3 text-lg font-semibold transition-colors border-b border-red-800 hover:bg-red-800"
          >
            🔥 Trending
          </Link>
          <Link
            to="/search/romance"
            onClick={() => setIsMenuOpen(false)}
            className="block px-4 py-3 text-lg font-semibold transition-colors border-b border-red-800 hover:bg-red-800"
          >
            💖 Romance
          </Link>
          <Link
            to="/search/historical"
            onClick={() => setIsMenuOpen(false)}
            className="block px-4 py-3 text-lg font-semibold transition-colors hover:bg-red-800"
          >
            🏰 Historical
          </Link>

          {/* Quick Categories */}
          <div className="pt-4 border-t border-red-800">
            <h3 className="mb-2 text-xl font-semibold text-yellow-300">Kategori Cepat</h3>
            <div className="flex flex-wrap gap-2">
              {['Action', 'Comedy', 'Modern', 'Fantasy', 'Mystery'].map(cat => (
                <Link
                  key={cat}
                  to={`/search/${cat.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-sm transition-colors bg-red-800 rounded-full hover:bg-red-900"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
