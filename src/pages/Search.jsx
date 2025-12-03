import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import DramaCard from '../components/DramaCard';
import { dramaAPI } from '../services/api';
import { fallbackDramas } from '../data/fallbackData';

const Search = () => {
  const { query } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk search normal
  const searchDramas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Searching for: "${query}"`);
      const searchResults = await dramaAPI.search(query, 1);
      
      console.log('Search results:', {
        count: searchResults.length,
        firstItem: searchResults[0]
      });
      
      if (searchResults.length === 0) {
        setError(`Tidak ditemukan hasil untuk "${query}"`);
        // Gunakan fallback dengan filter
        const filteredFallback = fallbackDramas.filter(drama => 
          drama.title.toLowerCase().includes(query.toLowerCase()) ||
          drama.description.toLowerCase().includes(query.toLowerCase()) ||
          drama.genre.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filteredFallback.slice(0, 12));
      } else {
        setResults(searchResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Terjadi kesalahan saat mencari');
      // Gunakan fallback dengan filter
      const filteredFallback = fallbackDramas.filter(drama => 
        drama.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 12);
      setResults(filteredFallback);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Fungsi untuk search "new" khusus
  const searchNewDramas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Searching for new dramas');
      const newDramas = await dramaAPI.getNewDramas(1, 24);
      
      if (newDramas.length === 0) {
        setError('Tidak ada drama baru ditemukan');
        setResults(fallbackDramas.slice(0, 24));
      } else {
        setResults(newDramas);
      }
    } catch (error) {
      console.error('Error searching new dramas:', error);
      setError('Gagal memuat drama baru');
      setResults(fallbackDramas.slice(0, 24));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query) {
      // Jika query adalah "new", gunakan getNewDramas
      if (query.toLowerCase() === 'new') {
        searchNewDramas();
      } else {
        searchDramas();
      }
    }
  }, [query, searchDramas, searchNewDramas]);

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-gray-900 to-black">
      <div className="container px-4 py-8 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-100">
            Hasil Pencarian: <span className="text-red-600">"{decodeURIComponent(query)}"</span>
          </h1>
          <p className="text-gray-400">
            {results.length > 0 
              ? `Ditemukan ${results.length} drama` 
              : loading ? 'Mencari drama...' : 'Tidak ada hasil'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 border border-yellow-700 rounded-lg bg-yellow-900/30">
            <p className="text-yellow-300">{error}</p>
            {error.includes('contoh') && (
              <p className="mt-1 text-sm text-yellow-200">
                Menampilkan contoh drama terkait
              </p>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-t-4 border-b-4 border-red-600 rounded-full animate-spin"></div>
              <p className="text-gray-400">Mencari drama...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {results.map((drama, index) => {
              // Normalisasi data drama
              const normalizedDrama = {
                bookId: drama.bookId || drama.id || `search-${index}`,
                title: drama.title || drama.name || `Drama ${index + 1}`,
                cover: drama.cover || drama.image || drama.poster || 
                       `https://picsum.photos/300/200?random=${index + 200}`,
                description: drama.description || drama.summary || 
                            `Hasil pencarian untuk "${decodeURIComponent(query)}"`,
                genre: drama.genre || drama.category || 'Search Result',
                rating: drama.rating || drama.score || (7.5 + Math.random()).toFixed(1)
              };
              
              return <DramaCard key={index} drama={normalizedDrama} />;
            })}
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && !error && (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-2xl font-bold text-gray-100">
              Tidak ditemukan hasil
            </h3>
            <p className="mb-6 text-gray-400">
              Coba gunakan kata kunci yang berbeda
            </p>
            <div className="max-w-md mx-auto">
              <h4 className="mb-3 font-bold">Saran pencarian:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {['Romance', 'CEO', 'Historical', 'Fantasy', 'Modern', 'Cinta'].map((keyword) => (
                  <a
                    key={keyword}
                    href={`/search/${keyword}`}
                    className="px-4 py-2 text-red-700 transition-colors bg-red-100 rounded-full hover:bg-red-200"
                  >
                    {keyword}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Try Fallback Dramas */}
        {!loading && results.length === 0 && error && (
          <div className="mt-12">
            <h3 className="mb-6 text-2xl font-bold">Drama Populer Lainnya</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {fallbackDramas.slice(0, 12).map((drama, index) => (
                <DramaCard key={index} drama={drama} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
