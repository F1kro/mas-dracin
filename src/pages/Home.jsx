import React, { useState, useEffect } from 'react';
import DramaCard from '../components/DramaCard';
import SearchBar from '../components/SearchBar';
import { dramaAPI } from '../services/api';
import { fallbackDramas } from '../data/fallbackData';

const Home = () => {
  const [forYou, setForYou] = useState([]);
  const [newDramas, setNewDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [stats, setStats] = useState({ forYouCount: 0, newCount: 0 });

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Fetching home data...');
      
      const [foryouData, newData] = await Promise.all([
        dramaAPI.getForYou(1),
        dramaAPI.getNewDramas(1, 12)
      ]);
      
      console.log('✅ Received API data:', {
        foryouCount: foryouData.length,
        newCount: newData.length,
        foryouSample: foryouData[0],
        newSample: newData[0]
      });
      
      // Update stats
      setStats({
        forYouCount: foryouData.length,
        newCount: newData.length
      });
      
      // Gunakan data dari API
      setForYou(foryouData);
      setNewDramas(newData);
      
      // Tandai jika menggunakan fallback (jika kedua data kosong)
      setUseFallback(foryouData.length === 0 && newData.length === 0);
      
    } catch (error) {
      console.error('❌ Error in fetchHomeData:', error);
      
      // Gunakan fallback hanya jika error
      setForYou(fallbackDramas);
      setNewDramas(fallbackDramas.slice(0, 12));
      setUseFallback(true);
      setStats({
        forYouCount: fallbackDramas.length,
        newCount: 12
      });
    } finally {
      setLoading(false);
    }
  };

  // Render loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Memuat Drama China</h2>
          <p className="text-gray-600">Menyiapkan tayangan terbaik untuk Anda...</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Mengambil data dari server...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎬 <span className="text-red-600">Drama</span>China
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nonton drama China terbaru dengan subtitle Indonesia. Gratis dan lengkap!
          </p>
          
          {/* Stats */}
          <div className="mt-6 flex justify-center gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-red-600">{stats.forYouCount}</div>
              <div className="text-sm text-gray-600">Drama Untuk Kamu</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.newCount}</div>
              <div className="text-sm text-gray-600">Drama Baru</div>
            </div>
          </div>
          
          {useFallback && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
              <p className="text-yellow-800">
                ⚠️ Sedang menggunakan data contoh. API mungkin sedang tidak tersedia.
              </p>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <SearchBar />
        </div>

        {/* Untuk Kamu Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Untuk Kamu</h2>
              <p className="text-gray-600">Rekomendasi drama berdasarkan minat Anda</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {forYou.length} drama
              </span>
              <button 
                onClick={fetchHomeData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all hover:scale-105 flex items-center gap-2"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          
          {forYou.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {forYou.slice(0, 12).map((drama, index) => (
                <DramaCard key={`foryou-${drama.bookId || index}`} drama={drama} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Belum Ada Rekomendasi</h3>
              <p className="text-gray-600 mb-6">Silakan refresh atau coba lagi nanti</p>
            </div>
          )}
        </section>

        {/* Drama Baru Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Drama Baru</h2>
              <p className="text-gray-600">Rilisan terbaru yang baru saja tayang</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {newDramas.length} drama baru
              </span>
              <a 
                href={`/search/new`}
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                Lihat Semua →
              </a>
            </div>
          </div>
          
          {newDramas.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {newDramas.map((drama, index) => (
                  <DramaCard key={`new-${drama.bookId || index}`} drama={drama} />
                ))}
              </div>
              
              {/* New Drama Badges */}
              <div className="mt-8 flex flex-wrap gap-2 justify-center">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  🔥 Trending
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  🆕 Baru Rilis
                </span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  ⭐ Rating Tinggi
                </span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  🎬 Episode Lengkap
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-4">📺</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Drama Baru</h3>
              <p className="text-gray-600">Cek kembali nanti untuk update terbaru</p>
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Kategori Populer
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Romance', icon: '💖', color: 'bg-pink-100 text-pink-700' },
              { name: 'Historical', icon: '🏰', color: 'bg-amber-100 text-amber-700' },
              { name: 'Fantasy', icon: '🧚', color: 'bg-purple-100 text-purple-700' },
              { name: 'Modern', icon: '🏙️', color: 'bg-blue-100 text-blue-700' },
              { name: 'Action', icon: '💥', color: 'bg-red-100 text-red-700' },
              { name: 'Comedy', icon: '😂', color: 'bg-yellow-100 text-yellow-700' },
              { name: 'Mystery', icon: '🔍', color: 'bg-gray-100 text-gray-700' },
              { name: 'Drama', icon: '🎭', color: 'bg-indigo-100 text-indigo-700' }
            ].map((category) => (
              <a
                key={category.name}
                href={`/search/${category.name.toLowerCase()}`}
                className={`${category.color} px-6 py-4 rounded-xl hover:scale-105 transition-all text-center font-medium flex flex-col items-center gap-2`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span>{category.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* API Status Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Status Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 mb-1">Untuk Kamu</div>
              <div className="text-2xl font-bold">{forYou.length} drama</div>
              <div className="text-xs text-green-500">
                {useFallback ? 'Data contoh' : 'Data langsung dari API'}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Drama Baru</div>
              <div className="text-2xl font-bold">{newDramas.length} drama</div>
              <div className="text-xs text-blue-500">
                {useFallback ? 'Data contoh' : 'Data langsung dari API'}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 mb-1">Total</div>
              <div className="text-2xl font-bold">{forYou.length + newDramas.length} drama</div>
              <div className="text-xs text-purple-500">
                Tersedia untuk ditonton
              </div>
            </div>
          </div>
          
          {!useFallback && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
              ✅ Berhasil terhubung ke API. Data drama ditampilkan langsung dari server.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;