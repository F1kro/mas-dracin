// Data fallback untuk ketika API tidak bekerja
export const fallbackDramas = Array.from({ length: 12 }, (_, i) => ({
    bookId: `42000000${720 + i}`,
    title: [
      'CEO di Atas Saya',
      'Cinta di Musim Semi',
      'Jenderal dan Putri',
      'Metropolis Love',
      'Legenda Naga Putih',
      'Detective in Ancient City',
      'Love in Campus',
      'Imperial Consort',
      'Business Tycoon',
      'The Last Princess',
      'Modern Fairy Tale',
      'Secret Agent Love'
    ][i] || `Drama China ${i + 1}`,
    cover: `https://picsum.photos/300/200?random=${i + 100}`,
    description: [
      'Kisah cinta antara CEO dan karyawannya',
      'Romansa musim semi yang indah',
      'Epik sejarah dengan percintaan kerajaan',
      'Cinta di kota metropolitan modern',
      'Fantasi tentang legenda naga',
      'Misteri detektif di kota kuno',
      'Cinta masa muda di kampus',
      'Kisah selir kerajaan yang kuat',
      'Drama bisnis dan percintaan',
      'Petualangan putri terakhir',
      'Dongeng cinta modern',
      'Cinta agen rahasia'
    ][i] || 'Drama China dengan cerita menarik',
    genre: [
      'Romance', 'Romance', 'Historical', 'Modern',
      'Fantasy', 'Mystery', 'Romance', 'Historical',
      'Business', 'Adventure', 'Fantasy', 'Action'
    ][i] || 'Drama',
    rating: (8.0 + (i * 0.1)).toFixed(1)
  }));