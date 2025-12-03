import React, { useState, useEffect } from "react";
import DramaCard from "../components/DramaCard";
import SearchBar from "../components/SearchBar";
import { dramaAPI } from "../services/api";
import { fallbackDramas } from "../data/fallbackData";
import { Play, TrendingUp, Sparkles, Clock } from "lucide-react";

const Home = () => {
  const [forYou, setForYou] = useState([]);
  const [newDramas, setNewDramas] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("foryou");

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);

    try {
      const [foryouData, newData, trendingData] = await Promise.all([
        dramaAPI.getForYou(1),
        dramaAPI.getNewDramas(1, 12),
        dramaAPI.getForYou(2), // sementara gunakan page 2 sebagai trending
      ]);

      setForYou(foryouData.length > 0 ? foryouData : fallbackDramas);
      setNewDramas(newData.length > 0 ? newData : fallbackDramas.slice(0, 12));
      setTrending(
        trendingData.length > 0 ? trendingData : fallbackDramas.slice(6, 18)
      );
    } catch (error) {
      console.error("Error:", error);
      setForYou(fallbackDramas);
      setNewDramas(fallbackDramas.slice(0, 12));
      setTrending(fallbackDramas.slice(6, 18));
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      id: "all",
      name: "Semua",
      count: forYou.length + newDramas.length + trending.length,
    },
    { id: "foryou", name: "Untuk Kamu", icon: <Sparkles className="w-4 h-4" />, count: forYou.length },
    { id: "new", name: "Baru", icon: <Clock className="w-4 h-4" />, count: newDramas.length },
    { id: "trending", name: "Trending", icon: <TrendingUp className="w-4 h-4" />, count: trending.length },
  ];

  const getActiveDramas = () => {
    switch (activeTab) {
      case "foryou":
        return forYou;
      case "new":
        return newDramas;
      case "trending":
        return trending;
      default:
        return [...forYou, ...newDramas, ...trending];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="container px-4 py-8 mx-auto">
          {/* Hero Skeleton */}
          <div className="mb-12">
            <div className="h-64 mb-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl animate-pulse"></div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-24 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-gray-900 to-black">

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>

        <div className="container relative px-4 py-12 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-6xl">
              <span className="text-foreground bg-gradient-to-r from-primary to-pink-600 bg-clip-text">
                Nonton Drama China
              </span>
              <br />
              <span className="text-foreground">Gratis & Lengkap</span>
            </h1>

            <p className="max-w-2xl mx-auto mb-8 text-xl text-muted-foreground">
              Streaming drama China terbaru dengan subtitle Indonesia.
              Ribuan episode tersedia untuk kamu tonton.
            </p>

            <div className="max-w-2xl mx-auto mb-12">
              <SearchBar />
            </div>

            {/* Stats */}
            <div className="grid max-w-xl grid-cols-2 gap-4 mx-auto md:grid-cols-4">
              <div className="p-4 border bg-background/50 backdrop-blur-sm rounded-xl">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Drama</div>
              </div>
              <div className="p-4 border bg-background/50 backdrop-blur-sm rounded-xl">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Episode</div>
              </div>
              <div className="p-4 border bg-background/50 backdrop-blur-sm rounded-xl">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Update</div>
              </div>
              <div className="p-4 border bg-background/50 backdrop-blur-sm rounded-xl">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Gratis</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8 mx-auto">

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                  activeTab === category.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === category.id
                      ? "bg-primary-foreground/20"
                      : "bg-muted-foreground/20"
                  }`}
                >
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Drama Grid */}
        <div className="mb-12">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-6">
            {getActiveDramas().slice(0, 18).map((drama, index) => (
              <DramaCard
                key={`${activeTab}-${drama.bookId || index}`}
                drama={drama}
              />
            ))}
          </div>

          {getActiveDramas().length === 0 && (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">🎬</div>
              <h3 className="mb-2 text-xl font-bold">Belum Ada Drama</h3>
              <p className="text-muted-foreground">Coba refresh atau gunakan pencarian</p>
            </div>
          )}
        </div>

        {/* Genre Quick Links */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Jelajahi Genre</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
            {[
              { name: "Romance", icon: "💖", color: "bg-pink-500" },
              { name: "Historical", icon: "🏰", color: "bg-amber-500" },
              { name: "Fantasy", icon: "🧚", color: "bg-purple-500" },
              { name: "Modern", icon: "🏙️", color: "bg-blue-500" },
              { name: "Action", icon: "💥", color: "bg-red-500" },
              { name: "Comedy", icon: "😂", color: "bg-yellow-500" },
              { name: "Mystery", icon: "🔍", color: "bg-gray-500" },
            ].map(genre => (
              <a
                key={genre.name}
                href={`/search/${genre.name.toLowerCase()}`}
                className={`${genre.color} text-white p-4 rounded-xl hover:scale-105 transition-all text-center flex flex-col items-center gap-2`}
              >
                <span className="text-2xl">{genre.icon}</span>
                <span className="font-medium">{genre.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Feature Boxes */}
        <div className="grid gap-6 mb-12 md:grid-cols-3">
          <div className="p-6 border bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-primary/20 rounded-xl">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-bold">Streaming HD</h3>
            <p className="text-muted-foreground">Tonton dengan kualitas HD tanpa buffering</p>
          </div>

          <div className="p-6 border bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-green-500/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold">Subtitle Indonesia</h3>
            <p className="text-muted-foreground">Semua drama dengan subtitle bahasa Indonesia</p>
          </div>

          <div className="p-6 border bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-500/20 rounded-xl">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold">Update Harian</h3>
            <p className="text-muted-foreground">Episode baru ditambahkan setiap hari</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
