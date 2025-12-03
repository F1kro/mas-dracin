import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Watch from "./pages/Watch";
import "./App.css";
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search/:query" element={<Search />} />
          <Route
            path="/watch/:bookId/:chapterIndex?"
            element={
              <ErrorBoundary
                fallback={
                  <div className="min-h-screen flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                      <h1 className="text-2xl text-white mb-4">
                        Terjadi Kesalahan
                      </h1>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg"
                      >
                        Refresh Halaman
                      </button>
                    </div>
                  </div>
                }
              >
                <Watch />
              </ErrorBoundary>
            }
          />
          <Route path="*" element={<Home />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">🎬 Mas-Dracin(Drama-China)</h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Platform streaming drama China dengan subtitle Indonesia. Tonton
                gratis drama terbaru dan terpopuler.
              </p>

              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <a
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Beranda
                </a>
                <a
                  href="/search/romance"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Romance
                </a>
                <a
                  href="/search/historical"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Historical
                </a>
                <a
                  href="/search/fantasy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Fantasy
                </a>
              </div>

              <div className="border-t border-gray-800 pt-8">
                <p className="text-gray-500 text-sm">
                  © 2025 Mas-Dracin. Website ini dibuat oleh Masfiq menggunakan API publik untuk
                  tujuan Demonstrasi dan Testing Api Free yang berasal dari GC FB
                </p>
                <p className="text-gray-600 text-xs mt-2">
                  Disclaimer: Konten asli milik pemegang hak cipta
                  masing-masing.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
