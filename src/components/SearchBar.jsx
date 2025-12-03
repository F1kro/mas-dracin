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
          className="w-full p-4 pl-12 pr-12 text-lg text-gray-900 transition-all border-2 border-red-300 rounded-full shadow-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
        />
        <button
          type="submit"
          className="absolute p-3 text-white transition-colors transform -translate-y-1/2 bg-red-600 rounded-full shadow-md right-3 top-1/2 hover:bg-red-700"
          title="Cari"
        >
          🔍
        </button>
        <div className="absolute text-red-400 transform -translate-y-1/2 left-4 top-1/2">
          ⌕
        </div>
      </form>
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute transform -translate-y-1/2 right-16 top-1/2">
          <div className="w-6 h-6 border-b-2 border-red-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden bg-white border border-gray-200 shadow-2xl top-full rounded-2xl">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full p-4 text-left transition-colors border-b hover:bg-red-50 last:border-b-0"
              onClick={() => {
                setQuery(suggestion);
                navigate(`/search/${encodeURIComponent(suggestion)}`);
                setSuggestions([]);
              }}
            >
              <div className="flex items-center">
                <span className="mr-3 text-red-500">🔍</span>
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
