import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dramaAPI } from '../services/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
      setSuggestions([]);
    }
  };

  const handleInputChange = async (value) => {
    setQuery(value);
    
    if (value.trim().length > 1) {
      setLoading(true);
      try {
        const results = await dramaAPI.getSuggestions(value.trim());
        
        // Ambil hanya 5 item pertama
        const limitedResults = Array.isArray(results) 
          ? results.slice(0, 5).map(item => 
              typeof item === 'string' ? item : item.title || item.name || 'Suggestion'
            )
          : [];
        
        setSuggestions(limitedResults);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Cari drama, genre, atau aktor..."
          className="w-full p-4 pl-12 pr-12 text-lg border-2 border-red-300 rounded-full shadow-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-md"
          title="Cari"
        >
          🔍
        </button>
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400">
          ⌕
        </div>
      </form>
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
        </div>
      )}
      
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full text-left p-4 hover:bg-red-50 transition-colors border-b last:border-b-0"
              onClick={() => {
                setQuery(suggestion);
                navigate(`/search/${encodeURIComponent(suggestion)}`);
                setSuggestions([]);
              }}
            >
              <div className="flex items-center">
                <span className="text-red-500 mr-3">🔍</span>
                <span className="text-gray-800">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;