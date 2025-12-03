import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="text-white bg-red-600 shadow-lg">
      <div className="container px-4 mx-auto">
        {/* Mobile & Desktop Header */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center text-2xl font-bold">
            <span className="mr-2">🎬</span>
            <span className="hidden sm:inline">Mas-Dracin</span>
            <span className="sm:hidden">Dracin</span>
          </Link>

          {/* Desktop Navigation (hidden on mobile) */}
          <div className="items-center hidden space-x-6 md:flex">
            <Link to="/" className="transition-colors hover:text-yellow-300">
              Beranda
            </Link>
            <Link to="/search/new" className="transition-colors hover:text-yellow-300">
              Baru
            </Link>
            <Link to="/search/romance" className="transition-colors hover:text-yellow-300">
              Romance
            </Link>
            <Link to="/search/historical" className="transition-colors hover:text-yellow-300">
              Historical
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 transition-colors rounded-md md:hidden hover:bg-red-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Search Bar (Desktop - below header) */}
        <div className="hidden py-4 md:block">
          <div className="max-w-xl mx-auto">
            <SearchBar />
          </div>
        </div>

        {/* Mobile Menu (dropdown) */}
        {isMenuOpen && (
          <div className="mt-2 mb-4 bg-red-700 rounded-lg shadow-lg md:hidden">
            {/* Mobile Search Bar */}
            <div className="p-4 border-b border-red-800">
              <SearchBar />
            </div>
            
            {/* Mobile Navigation Links */}
            <div className="py-2">
              <Link
                to="/"
                className="block px-4 py-3 transition-colors border-b border-red-800 hover:bg-red-800"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Beranda
              </Link>
              <Link
                to="/search/new"
                className="block px-4 py-3 transition-colors border-b border-red-800 hover:bg-red-800"
                onClick={() => setIsMenuOpen(false)}
              >
                🆕 Drama Baru
              </Link>
              <Link
                to="/search/romance"
                className="block px-4 py-3 transition-colors border-b border-red-800 hover:bg-red-800"
                onClick={() => setIsMenuOpen(false)}
              >
                💖 Romance
              </Link>
              <Link
                to="/search/historical"
                className="block px-4 py-3 transition-colors border-b border-red-800 hover:bg-red-800"
                onClick={() => setIsMenuOpen(false)}
              >
                🏰 Historical
              </Link>
              <Link
                to="/search/fantasy"
                className="block px-4 py-3 transition-colors border-b border-red-800 hover:bg-red-800"
                onClick={() => setIsMenuOpen(false)}
              >
                🧚 Fantasy
              </Link>
              <Link
                to="/search/action"
                className="block px-4 py-3 transition-colors hover:bg-red-800"
                onClick={() => setIsMenuOpen(false)}
              >
                💥 Action
              </Link>
            </div>

            {/* Quick Categories */}
            <div className="p-4 border-t border-red-800">
              <h3 className="mb-2 font-bold text-yellow-300">Kategori Cepat</h3>
              <div className="flex flex-wrap gap-2">
                {['CEO', 'Cinta', 'Modern', 'Drama', 'Comedy', 'Mystery'].map((cat) => (
                  <Link
                    key={cat}
                    to={`/search/${cat.toLowerCase()}`}
                    className="px-3 py-1 text-sm transition-colors bg-red-800 rounded-full hover:bg-red-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;