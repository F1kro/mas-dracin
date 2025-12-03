import React from 'react';
import { Link } from 'react-router-dom';

const DramaCard = ({ drama }) => {
  // Extract data dengan field yang sesuai
  const {
    bookId,
    id,
    title,
    bookName,
    cover,
    description,
    introduction,
    genre,
    tags,
    rating,
    chapterCount,
    playCount,
    isNew,
    rank
  } = drama || {};

  // Gunakan bookId atau id
  const dramaId = bookId || id || 'unknown';
  
  // Gunakan title atau bookName
  const dramaTitle = title || bookName || 'Drama Tanpa Judul';
  
  // Gunakan description atau introduction
  const dramaDesc = description || introduction || 'Deskripsi tidak tersedia';
  
  // Gunakan genre atau tag pertama
  const dramaGenre = genre || (tags && tags[0]) || 'Drama';
  
  // Format rating
  const dramaRating = rating ? (typeof rating === 'number' ? rating.toFixed(1) : rating) : 'N/A';
  
  // Format play count
  const formattedPlayCount = playCount ? 
    (playCount.includes('K') ? playCount : parseInt(playCount) > 1000 ? 
      `${(parseInt(playCount) / 1000).toFixed(1)}K` : playCount) : '';

  return (
    <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      <Link to={`/watch/${dramaId}/0`} className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img 
            src={cover} 
            alt={dramaTitle}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = `https://picsum.photos/300/400?random=${dramaId}`;
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors">
                Tonton Sekarang
              </button>
            </div>
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Baru
              </span>
            )}
            {rank && (
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                #{rank.sort || 'Hot'}
              </span>
            )}
          </div>
          
          {/* Rating */}
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            ⭐ {dramaRating}
          </div>
          
          {/* Chapter Count */}
          {chapterCount > 0 && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {chapterCount} eps
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14" title={dramaTitle}>
            {dramaTitle}
          </h3>
          
          {/* Genre Tags */}
          <div className="mb-3 flex flex-wrap gap-1">
            {(tags && Array.isArray(tags) ? tags.slice(0, 2) : [dramaGenre]).map((tag, idx) => (
              <span 
                key={idx}
                className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-3" title={dramaDesc}>
            {dramaDesc}
          </p>
          
          {/* Stats */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            {formattedPlayCount && (
              <span className="flex items-center gap-1">
                👁️ {formattedPlayCount}
              </span>
            )}
            <span className="text-red-600 font-medium">
              GRATIS
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DramaCard;