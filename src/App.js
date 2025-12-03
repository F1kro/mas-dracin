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
      <div className="flex flex-col min-h-screen text-white bg-gradient-to-b from-gray-900 via-gray-900 to-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search/:query" element={<Search />} />
          <Route
            path="/watch/:bookId/:chapterIndex?"
            element={
              <ErrorBoundary
                fallback={
                  <div className="flex items-center justify-center min-h-screen bg-gray-900">
                    <div className="text-center">
                      <h1 className="mb-4 text-2xl text-white">
                        Terjadi Kesalahan
                      </h1>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 text-white bg-red-600 rounded-lg"
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
        <footer className="py-12 mt-0 text-white bg-gray-900">
          <div className="container px-4 mx-auto">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold">🎬 Mas-Dracin(Drama-China)</h2>
              <p className="max-w-2xl mx-auto mb-8 text-gray-400">
                Platform streaming drama China dengan subtitle Indonesia. Tonton
                gratis drama terbaru dan terpopuler.
              </p>

              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <a
                  href="/"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Beranda
                </a>
                <a
                  href="/search/romance"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Romance
                </a>
                <a
                  href="/search/historical"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Historical
                </a>
                <a
                  href="/search/fantasy"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Fantasy
                </a>
              </div>

              <div className="pt-8 border-t border-gray-800">
                <p className="text-sm text-gray-500">
                  © 2025 Mas-Dracin. Website ini dibuat oleh Masfiq menggunakan API publik untuk
                  tujuan Demonstrasi dan Testing Api Free yang berasal dari GC FB
                </p>
                <p className="mt-2 text-xs text-gray-600">
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
