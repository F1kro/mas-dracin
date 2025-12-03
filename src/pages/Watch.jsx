import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { dramaAPI } from "../services/api";

// Helper functions
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const formatDuration = (durationStr) => {
  if (!durationStr) return "--:--";
  if (durationStr.includes(":")) return durationStr;

  const seconds = parseInt(durationStr);
  if (!isNaN(seconds)) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return durationStr;
};

const Watch = () => {
  const { bookId, chapterIndex = 0 } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [videoData, setVideoData] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(parseInt(chapterIndex));
  const [dramaInfo, setDramaInfo] = useState(null);
  const [totalChapters, setTotalChapters] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 🔧 PINDHKAN fetchVideoData KE ATAS useEffect
  const fetchVideoData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsVideoReady(false);
    
    try {
      console.log(`🎬 Loading drama ${bookId}, episode ${currentChapter + 1}`);
      
      // Fetch video data
      const watchData = await dramaAPI.getWatch(bookId, currentChapter);
      
      console.log('Video data check:', {
        success: watchData.success,
        isVideoValid: watchData.isVideoValid,
        hasUrl: !!watchData.url,
        error: watchData.error
      });
      
      // Cek jika video valid
      if (!watchData.success || !watchData.isVideoValid) {
        let errorMessage = 'Video tidak tersedia';
        let errorType = 'VIDEO_UNAVAILABLE';
        
        if (watchData.error === 'NOT_FOUND') {
          errorMessage = 'Episode ini tidak ditemukan di server';
          errorType = 'NOT_FOUND';
        } else if (watchData.error === 'NETWORK_ERROR') {
          errorMessage = 'Gagal terhubung ke server video. Periksa koneksi internet Anda.';
          errorType = 'NETWORK_ERROR';
        } else if (watchData.error === 'CORS_ERROR') {
          errorMessage = 'Terjadi masalah teknis dengan server video.';
          errorType = 'CORS_ERROR';
        } else if (watchData.error === 'TIMEOUT') {
          errorMessage = 'Server video tidak merespons. Silakan coba lagi nanti.';
          errorType = 'TIMEOUT';
        } else if (watchData.error === 'NO_VIDEO_DATA') {
          errorMessage = 'Data video tidak tersedia untuk episode ini.';
          errorType = 'NO_VIDEO_DATA';
        }
        
        throw new Error(`${errorType}: ${errorMessage}`);
      }
      
      // Fetch chapters data
      const chaptersResponse = await dramaAPI.getChapters(bookId);
      const validChapters = chaptersResponse.list || [];
      const totalChaptersCount = chaptersResponse.total || validChapters.length;
      
      // Validate chapter index
      if (currentChapter >= totalChaptersCount && totalChaptersCount > 0) {
        setCurrentChapter(0);
        navigate(`/watch/${bookId}/0`);
        return;
      }
      
      // Fetch drama info
      const fetchDramaInfo = async () => {
        try {
          const sources = [
            () => dramaAPI.search(bookId, 1),
            () => dramaAPI.getForYou(1),
            () => dramaAPI.getNewDramas(1, 50)
          ];
          
          for (let i = 0; i < sources.length; i++) {
            try {
              const results = await sources[i]();
              const foundDrama = results.find(d => d.bookId === bookId);
              
              if (foundDrama) {
                return {
                  title: foundDrama.title || foundDrama.bookName,
                  description: foundDrama.description || foundDrama.introduction,
                  cover: foundDrama.cover,
                  genre: foundDrama.genre || (foundDrama.tags && foundDrama.tags[0]),
                  rating: foundDrama.rating,
                  chapterCount: foundDrama.chapterCount,
                  playCount: foundDrama.playCount
                };
              }
            } catch (sourceError) {
              console.log(`Source ${i} failed:`, sourceError.message);
            }
          }
          return null;
        } catch (error) {
          console.error('Error fetching drama info:', error);
          return null;
        }
      };
      
      const dramaInfoData = await fetchDramaInfo();
      
      setVideoData({
        ...watchData,
        chapterIndex: currentChapter,
        totalChapters: totalChaptersCount
      });
      
      setChapters(validChapters);
      setTotalChapters(totalChaptersCount);
      setDramaInfo(dramaInfoData);
      setIsVideoReady(true);
      
      console.log('✅ Video ready to play');
      
      // Scroll to top
      window.scrollTo(0, 0);
      
    } catch (error) {
      console.error('❌ Error in fetchVideoData:', error.message);
      
      const errorMessage = error.message.split(': ')[1] || error.message;
      setError(errorMessage);
      
      // Set data kosong - NO DEMO VIDEO
      setVideoData({
        url: null,
        title: `Episode ${currentChapter + 1}`,
        description: 'Video tidak tersedia',
        isVideoValid: false,
        error: true
      });
      
      setChapters([]);
      setTotalChapters(0);
      setIsVideoReady(false);
      
    } finally {
      setLoading(false);
    }
  }, [bookId, currentChapter, navigate]);

  // 🔧 SEKARANG BARU useEffect
  useEffect(() => {
    fetchVideoData();
  }, [fetchVideoData]);

  // Time tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoReady) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateTime);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateTime);
    };
  }, [videoData, isVideoReady]);

  const handleChapterSelect = (chapterIdx) => {
    if (chapterIdx >= 0 && chapterIdx < totalChapters) {
      setCurrentChapter(chapterIdx);
      navigate(`/watch/${bookId}/${chapterIdx}`);
    }
  };

  const getProgressPercentage = () => {
    if (!duration || duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  const calculateAverageDuration = () => {
    if (chapters.length === 0) return "24";

    const durations = chapters
      .map((c) => {
        if (!c.duration) return 24 * 60;
        const match = c.duration.match(/(\d+):(\d+)/);
        if (match) {
          return parseInt(match[1]) * 60 + parseInt(match[2]);
        }
        return 24 * 60;
      })
      .filter((d) => !isNaN(d));

    if (durations.length === 0) return "24";

    const avgSeconds = durations.reduce((a, b) => a + b, 0) / durations.length;
    return Math.round(avgSeconds / 60);
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleNextChapter = () => {
    if (currentChapter < totalChapters - 1) {
      handleChapterSelect(currentChapter + 1);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapter > 0) {
      handleChapterSelect(currentChapter - 1);
    }
  };

  // ================= RENDER FUNCTIONS =================

  const renderLoading = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 border-t-4 border-b-4 border-red-600 rounded-full animate-spin"></div>
        <h2 className="mb-2 text-2xl font-bold text-white">
          Memuat Episode {currentChapter + 1}
        </h2>
        <p className="text-gray-400">Memeriksa ketersediaan video...</p>
        <div className="mt-6">
          <div className="w-64 h-2 mx-auto mb-2 bg-gray-800 rounded-full">
            <div
              className="h-2 bg-red-600 rounded-full animate-pulse"
              style={{ width: "40%" }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">Menghubungkan ke server...</p>
        </div>
      </div>
    </div>
  );

  const renderError = () => {
    const getErrorDetails = () => {
      if (
        error.includes("koneksi") ||
        error.includes("jaringan") ||
        error.includes("terhubung")
      ) {
        return {
          icon: "📡",
          title: "Masalah Koneksi",
          description: error,
          color: "bg-yellow-900/30 border-yellow-700",
          tips: [
            "Periksa koneksi internet Anda",
            "Coba matikan/menyalakan Wi-Fi",
            "Pastikan tidak ada pembatasan jaringan",
          ],
        };
      } else if (
        error.includes("tidak ditemukan") ||
        error.includes("tidak tersedia")
      ) {
        return {
          icon: "🔍",
          title: "Episode Tidak Tersedia",
          description: error,
          color: "bg-red-900/30 border-red-700",
          tips: [
            "Episode mungkin belum dirilis",
            "Coba episode lainnya",
            "Periksa kembali nanti",
          ],
        };
      } else if (error.includes("teknis") || error.includes("server")) {
        return {
          icon: "⚙️",
          title: "Masalah Server",
          description: error,
          color: "bg-blue-900/30 border-blue-700",
          tips: [
            "Server video sedang maintenance",
            "Coba lagi dalam beberapa menit",
            "Hubungi admin jika masalah berlanjut",
          ],
        };
      } else {
        return {
          icon: "❓",
          title: "Terjadi Kesalahan",
          description: error,
          color: "bg-gray-800/50 border-gray-700",
          tips: [
            "Refresh halaman (F5)",
            "Clear cache browser",
            "Coba browser berbeda",
          ],
        };
      }
    };

    const errorDetails = getErrorDetails();

    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="w-full max-w-2xl">
          {/* Error Card */}
          <div
            className={`rounded-2xl p-8 border ${errorDetails.color} backdrop-blur-sm`}
          >
            {/* Error Icon */}
            <div className="mb-6 text-center text-7xl">{errorDetails.icon}</div>

            {/* Error Title */}
            <h1 className="mb-4 text-3xl font-bold text-center text-white">
              {errorDetails.title}
            </h1>

            {/* Error Description */}
            <div className="mb-8 text-center">
              <p className="mb-2 text-lg text-gray-300">
                {errorDetails.description}
              </p>
              <p className="text-sm text-gray-500">
                Drama ID: {bookId} • Episode: {currentChapter + 1}
              </p>
            </div>

            {/* Tips Section */}
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-semibold text-center text-gray-300">
                💡 Tips Penyelesaian
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {errorDetails.tips.map((tip, index) => (
                  <div key={index} className="p-4 rounded-lg bg-black/30">
                    <div className="mb-2 text-lg font-bold text-green-400">
                      {index + 1}
                    </div>
                    <p className="text-gray-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 py-4 font-semibold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 hover:scale-105"
              >
                <span className="text-xl">🔄</span>
                Coba Lagi
              </button>

              {totalChapters > 0 && currentChapter < totalChapters - 1 && (
                <button
                  onClick={() => handleChapterSelect(currentChapter + 1)}
                  className="flex items-center justify-center gap-2 py-4 font-semibold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 hover:scale-105"
                >
                  <span className="text-xl">⏭️</span>
                  Coba Episode Selanjutnya
                </button>
              )}

              <Link
                to="/"
                className="flex items-center justify-center gap-2 py-4 font-semibold text-white transition-all bg-gray-700 rounded-lg hover:bg-gray-600 hover:scale-105"
              >
                <span className="text-xl">←</span>
                Kembali ke Beranda
              </Link>
            </div>

            {/* Technical Info */}
            <div className="pt-6 mt-8 border-t border-gray-700">
              <div className="text-center">
                <p className="mb-2 text-sm text-gray-500">Informasi Teknis</p>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
                  <span>Status: Gagal memuat video</span>
                  <span>•</span>
                  <span>Percobaan: {retryCount + 1}</span>
                  <span>•</span>
                  <span>
                    Terakhir dicoba: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Masih bermasalah?{" "}
              <button
                onClick={() => window.location.reload()}
                className="text-red-400 underline hover:text-red-300"
              >
                Refresh halaman lengkap
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderChaptersGrid = () => {
    if (chapters.length === 0) {
      return (
        <div className="py-8 text-center">
          <div className="mb-4 text-4xl">📺</div>
          <h3 className="mb-2 text-xl font-bold text-white">
            Daftar Episode Sedang Dimuat
          </h3>
          <p className="text-gray-400">
            Episode akan ditampilkan setelah data tersedia
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
        {chapters.slice(0, 48).map((chapter, index) => {
          const isCurrent = currentChapter === chapter.chapterIndex;
          const isWatched = chapter.chapterIndex < currentChapter;
          const isLocked = chapter.isLocked;

          return (
            <button
              key={index}
              onClick={() =>
                !isLocked && handleChapterSelect(chapter.chapterIndex)
              }
              disabled={isLocked}
              className={`p-3 rounded-lg text-center transition-all relative group ${
                isCurrent
                  ? "bg-red-600 text-white scale-105 shadow-lg ring-2 ring-red-400"
                  : isLocked
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-70"
                  : isWatched
                  ? "bg-green-900/40 hover:bg-green-800/60"
                  : "bg-gray-700 hover:bg-gray-600 hover:scale-105"
              }`}
              title={isLocked ? "Episode terkunci" : chapter.title}
            >
              <div className="mb-1 text-lg font-bold">{chapter.chapterNo}</div>

              {chapter.duration && (
                <div
                  className={`text-xs px-1 rounded ${
                    isCurrent ? "bg-white/20" : "bg-black/20"
                  }`}
                >
                  {formatDuration(chapter.duration)}
                </div>
              )}

              <div className="absolute top-1 right-1">
                {isCurrent && <span className="text-xs">▶️</span>}
                {isWatched && <span className="text-xs text-green-400">✓</span>}
                {isLocked && <span className="text-xs">🔒</span>}
              </div>

              {chapter.playCount && !isCurrent && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="text-xs opacity-75">
                    👁 {chapter.playCount}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderChapterInfo = () => (
    <div className="p-6 mb-8 bg-gray-800/50 rounded-xl backdrop-blur-sm">
      <h3 className="mb-4 text-xl font-bold text-white">
        📊 Informasi Episode
      </h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="p-4 rounded-lg bg-gray-900/70">
          <div className="text-sm text-gray-400">Episode Saat Ini</div>
          <div className="text-2xl font-bold text-white">
            {currentChapter + 1}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {chapters[currentChapter]?.title || `Episode ${currentChapter + 1}`}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-900/70">
          <div className="text-sm text-gray-400">Total Episode</div>
          <div className="text-2xl font-bold text-white">{totalChapters}</div>
          <div className="mt-1 text-xs text-gray-500">
            Tersedia untuk ditonton
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-900/70">
          <div className="text-sm text-gray-400">Durasi</div>
          <div className="text-2xl font-bold text-white">
            {videoData?.duration ? formatDuration(videoData.duration) : "--:--"}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Rata-rata: {calculateAverageDuration()} menit
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-900/70">
          <div className="text-sm text-gray-400">Progress</div>
          <div className="text-2xl font-bold text-white">
            {totalChapters > 0
              ? Math.round(((currentChapter + 1) / totalChapters) * 100)
              : 0}
            %
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {totalChapters > 0
              ? `${totalChapters - currentChapter - 1} episode tersisa`
              : "Data loading..."}
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        <span className="text-sm text-green-400">
          Video tersedia dan siap diputar
        </span>
      </div>
    </div>
  );

  const renderVideoPlayer = () => (
    <div className="min-h-screen text-white bg-gradient-to-b from-gray-900 to-black">
      <div className="container px-4 py-6 mx-auto">
        {/* Header with Drama Info */}
        <div className="mb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Drama Cover */}
            {dramaInfo?.cover && (
              <div className="flex-shrink-0 w-32">
                <img
                  src={dramaInfo.cover}
                  alt={dramaInfo.title}
                  className="w-full rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/300/400?random=${bookId}`;
                  }}
                />
              </div>
            )}

            {/* Drama Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                    {dramaInfo?.title ||
                      videoData?.title ||
                      `Episode ${currentChapter + 1}`}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 text-sm bg-red-600 rounded-full">
                      Episode {currentChapter + 1}
                    </span>
                    {dramaInfo?.genre && (
                      <span className="px-3 py-1 text-sm bg-gray-700 rounded-full">
                        {dramaInfo.genre}
                      </span>
                    )}
                    {dramaInfo?.rating && (
                      <span className="px-3 py-1 text-sm bg-yellow-600 rounded-full">
                        ⭐ {dramaInfo.rating}
                      </span>
                    )}
                  </div>
                </div>

                {totalChapters > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Total Episode</div>
                    <div className="text-2xl font-bold text-white">
                      {totalChapters}
                    </div>
                  </div>
                )}
              </div>

              <p className="mb-4 text-gray-300">
                {dramaInfo?.description ||
                  videoData?.description ||
                  "Tidak ada deskripsi tersedia"}
              </p>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between mb-1 text-sm text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-2 transition-all duration-300 bg-red-600 rounded-full"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="mb-8">
          <div className="mb-4 overflow-hidden bg-black shadow-2xl rounded-2xl">
            <div className="aspect-video">
              <video
                ref={videoRef}
                key={`${videoData?.url}-${currentChapter}`}
                controls
                autoPlay
                className="w-full h-full"
                poster={videoData?.cover || dramaInfo?.cover}
                onError={(e) => {
                  console.error("Video element error:", e.target.error);
                  setError("Gagal memuat video. Format tidak didukung.");
                }}
                onCanPlay={() => {
                  console.log("Video can play");
                }}
              >
                {videoData?.url && (
                  <source src={videoData.url} type="video/mp4" />
                )}
                Browser Anda tidak mendukung pemutaran video.
              </video>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between mb-6">
            <button
              onClick={handlePrevChapter}
              disabled={currentChapter === 0}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                currentChapter === 0
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600 hover:scale-105"
              }`}
            >
              ⏮️ Episode Sebelumnya
            </button>

            <div className="text-center">
              <div className="text-lg font-bold">
                Episode {currentChapter + 1}
              </div>
              <div className="text-sm text-gray-400">
                {videoData?.duration
                  ? formatDuration(videoData.duration)
                  : "--:--"}
              </div>
            </div>

            <button
              onClick={handleNextChapter}
              disabled={currentChapter >= totalChapters - 1}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                currentChapter >= totalChapters - 1
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 hover:scale-105"
              }`}
            >
              Episode Selanjutnya ⏭️
            </button>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="p-6 mb-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Daftar Episode</h2>
            <div className="text-sm text-gray-400">
              {chapters.length} episode tersedia
            </div>
          </div>

          {renderChaptersGrid()}

          {/* Show More Button if many chapters */}
          {chapters.length > 48 && (
            <div className="mt-8 text-center">
              <button className="px-6 py-3 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600">
                Tampilkan Lebih Banyak Episode (+{chapters.length - 48})
              </button>
            </div>
          )}
        </div>

        {/* Chapter Info */}
        {renderChapterInfo()}

        {/* Drama Statistics */}
        <div className="p-6 mt-8 bg-gray-800/30 rounded-xl backdrop-blur-sm">
          <h3 className="mb-4 text-xl font-bold text-white">
            📈 Statistik Drama
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-4 text-center rounded-lg bg-gray-900/50">
              <div className="text-3xl font-bold text-green-400">
                {chapters.filter((c) => c.isFree && !c.isLocked).length}
              </div>
              <div className="text-sm text-gray-400">Episode Gratis</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-gray-900/50">
              <div className="text-3xl font-bold text-blue-400">
                {chapters.filter((c) => c.isLocked).length}
              </div>
              <div className="text-sm text-gray-400">Episode Premium</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-gray-900/50">
              <div className="text-3xl font-bold text-yellow-400">
                {calculateAverageDuration()}
              </div>
              <div className="text-sm text-gray-400">Menit/Episode</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-gray-900/50">
              <div className="text-3xl font-bold text-purple-400">
                {Math.round((totalChapters * calculateAverageDuration()) / 60)}
              </div>
              <div className="text-sm text-gray-400">Jam Total</div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 font-semibold transition-colors bg-red-600 rounded-lg hover:bg-red-700 hover:scale-105"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );

  // ================= MAIN RENDER =================
  if (loading) return renderLoading();
  if (error || !isVideoReady) return renderError();
  return renderVideoPlayer();
};

export default Watch;