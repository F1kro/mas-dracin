import axios from "axios";

const API_BASE_URL = "https://sapi.dramabox.be/api";

// Buat instance axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor untuk logging
apiClient.interceptors.response.use(
  (response) => {
    const url = response.config.url;
    const data = response.data;

    // Debug info
    console.log(`✅ ${url}:`, {
      success: data?.success,
      hasData: !!data?.data,
      hasList: data?.data?.list && Array.isArray(data.data.list),
      listLength: data?.data?.list?.length || 0,
      listSample: data?.data?.list?.[0],
    });

    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.url}:`, error.message);
    return Promise.reject(error);
  }
);

// Fungsi untuk extract data berdasarkan struktur yang kita lihat
const extractDramaData = (response) => {
  try {
    const responseData = response?.data || response;

    console.log("🔍 Extracting data from:", {
      success: responseData?.success,
      hasData: !!responseData?.data,
      dataKeys: responseData?.data ? Object.keys(responseData.data) : [],
      hasList:
        responseData?.data?.list && Array.isArray(responseData.data.list),
    });

    // Struktur yang kita lihat di console:
    // {success: true, data: {list: [...], isMore: true, ...}, meta: {...}}
    if (responseData?.success && responseData?.data) {
      const innerData = responseData.data;

      // Priority 1: list array
      if (innerData.list && Array.isArray(innerData.list)) {
        console.log(`🎯 Found list array with ${innerData.list.length} items`);
        return innerData.list;
      }

      // Priority 2: items array
      if (innerData.items && Array.isArray(innerData.items)) {
        console.log(
          `🎯 Found items array with ${innerData.items.length} items`
        );
        return innerData.items;
      }

      // Priority 3: results array
      if (innerData.results && Array.isArray(innerData.results)) {
        console.log(
          `🎯 Found results array with ${innerData.results.length} items`
        );
        return innerData.results;
      }

      // Priority 4: data array
      if (innerData.data && Array.isArray(innerData.data)) {
        console.log(
          `🎯 Found data.data array with ${innerData.data.length} items`
        );
        return innerData.data;
      }

      // Cari semua array properti
      const arrayKeys = Object.keys(innerData).filter((key) =>
        Array.isArray(innerData[key])
      );

      if (arrayKeys.length > 0) {
        console.log(
          `🎯 Found array in ${arrayKeys[0]} with ${
            innerData[arrayKeys[0]].length
          } items`
        );
        return innerData[arrayKeys[0]];
      }
    }

    // Struktur alternatif langsung {list: [...]}
    if (responseData?.list && Array.isArray(responseData.list)) {
      console.log(
        `🎯 Found direct list array with ${responseData.list.length} items`
      );
      return responseData.list;
    }

    // Jika langsung array
    if (Array.isArray(responseData)) {
      console.log(`🎯 Direct array with ${responseData.length} items`);
      return responseData;
    }

    console.warn("⚠️ No drama array found in response");
    return [];
  } catch (error) {
    console.error("❌ Error extracting data:", error);
    return [];
  }
};

// Normalize drama data untuk konsistensi
const normalizeDrama = (drama, index) => {
  return {
    // ID fields
    bookId: drama.bookId || drama.id || `drama-${index}`,
    id: drama.bookId || drama.id || `drama-${index}`,

    // Title fields
    title: drama.bookName || drama.title || drama.name || `Drama ${index + 1}`,
    bookName:
      drama.bookName || drama.title || drama.name || `Drama ${index + 1}`,

    // Cover image
    cover:
      drama.cover ||
      drama.image ||
      drama.poster ||
      `https://picsum.photos/300/400?random=${index + 100}`,

    // Description
    description:
      drama.introduction ||
      drama.description ||
      drama.summary ||
      "Drama China dengan cerita menarik",

    // Genre/Tags
    genre: drama.tags?.[0] || drama.genre || drama.category || "Romance",
    tags: drama.tags || [drama.genre || "Drama"],

    // Rating
    rating: drama.rank?.hotCode
      ? parseFloat(drama.rank.hotCode)
      : drama.score || (7.5 + Math.random()).toFixed(1),

    // Additional info
    chapterCount: drama.chapterCount || 0,
    playCount: drama.playCount || "0",
    isNew: !!drama.corner,
    rank: drama.rank,
  };
};

export const dramaAPI = {
  // GET: /api/foryou/{page}?lang=in
  getForYou: async (page = 1) => {
    try {
      const response = await apiClient.get(`/foryou/${page}?lang=in`);
      const dramas = extractDramaData(response);
      return dramas.map((drama, index) => normalizeDrama(drama, index));
    } catch (error) {
      console.error("Error getForYou:", error.message);
      return [];
    }
  },

  // GET: /api/new/{page}?lang=in&pageSize={pageSize}
  getNewDramas: async (page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get(
        `/new/${page}?lang=in&pageSize=${pageSize}`
      );
      const dramas = extractDramaData(response);
      return dramas.map((drama, index) => normalizeDrama(drama, index));
    } catch (error) {
      console.error("Error getNewDramas:", error.message);
      return [];
    }
  },

  // GET: /api/rank/{page}?lang=in
  getRanking: async (page = 1) => {
    try {
      const response = await apiClient.get(`/rank/${page}?lang=in`);
      const dramas = extractDramaData(response);
      return dramas.map((drama, index) => normalizeDrama(drama, index));
    } catch (error) {
      console.error("Error getRanking:", error.message);
      return [];
    }
  },

  // GET: /api/classify?lang=in&pageNo={pageNo}&genre={genre}&sort={sort}
  getByCategory: async (genre, pageNo = 1, sort = 1) => {
    try {
      const response = await apiClient.get(
        `/classify?lang=in&pageNo=${pageNo}&genre=${genre}&sort=${sort}`
      );
      const dramas = extractDramaData(response);
      return dramas.map((drama, index) => normalizeDrama(drama, index));
    } catch (error) {
      console.error("Error getByCategory:", error.message);
      return [];
    }
  },

  // GET: /api/search/{query}/{page}?lang=in
  search: async (query, page = 1) => {
    try {
      const response = await apiClient.get(
        `/search/${encodeURIComponent(query)}/${page}?lang=in`
      );
      const dramas = extractDramaData(response);
      return dramas.map((drama, index) => normalizeDrama(drama, index));
    } catch (error) {
      console.error("Error search:", error.message);
      return [];
    }
  },

  // GET: /api/suggest/{query}?lang=in
  getSuggestions: async (query) => {
    try {
      const response = await apiClient.get(
        `/suggest/${encodeURIComponent(query)}?lang=in`
      );
      const data = response.data || response;

      // Suggestions mungkin berbeda struktur
      if (data?.success && data?.data) {
        // Coba extract suggestions
        const suggestions =
          data.data.suggestions || data.data.list || data.data;
        if (Array.isArray(suggestions)) {
          return suggestions.slice(0, 5);
        }
      }

      if (Array.isArray(data)) {
        return data.slice(0, 5);
      }

      return [];
    } catch (error) {
      console.error("Error getSuggestions:", error.message);
      return [];
    }
  },

  // GET: /api/chapters/{bookId}?lang=in
  getChapters: async (bookId) => {
    try {
      console.log(`📚 Fetching chapters for ${bookId}`);
      const response = await apiClient.get(`/chapters/${bookId}?lang=in`);

      const responseData = response.data || response;
      console.log("Chapters API Full Response:", responseData);

      if (responseData?.success && responseData?.data) {
        const chaptersData = responseData.data;

        // DEBUG: Log semua keys dan nilai
        console.log("🔍 Analyzing chapters data structure:");
        const logStructure = (obj, indent = "") => {
          Object.keys(obj).forEach((key) => {
            const value = obj[key];
            console.log(
              `${indent}${key}:`,
              Array.isArray(value)
                ? `[Array, length=${value.length}]`
                : typeof value === "object"
                ? "{...}"
                : value
            );
            if (
              typeof value === "object" &&
              value !== null &&
              !Array.isArray(value)
            ) {
              logStructure(value, indent + "  ");
            }
          });
        };
        logStructure(chaptersData);

        // Cari chapters di berbagai kemungkinan lokasi
        let chaptersList = [];

        // Lokasi 1: Langsung di data.list
        if (
          chaptersData.list &&
          Array.isArray(chaptersData.list) &&
          chaptersData.list.length > 0
        ) {
          console.log(
            `✅ Found chapters in data.list: ${chaptersData.list.length} items`
          );
          chaptersList = chaptersData.list;
        }
        // Lokasi 2: Di dalam data.raw
        else if (chaptersData.raw && chaptersData.raw.data) {
          console.log("🔍 Checking data.raw structure...");
          const rawData = chaptersData.raw.data;

          // Cek berbagai kemungkinan struktur dalam raw
          if (rawData.theater && rawData.theater.columnVoList) {
            console.log(`✅ Found chapters in raw.data.theater.columnVoList`);
            chaptersList = rawData.theater.columnVoList.map((item, index) => ({
              chapterIndex: index,
              chapterNo: index + 1,
              title: item.title || `Episode ${index + 1}`,
              duration: null,
              isFree: true,
            }));
          } else if (rawData.data && Array.isArray(rawData.data)) {
            console.log(`✅ Found chapters in raw.data.data`);
            chaptersList = rawData.data;
          }
        }
        // Lokasi 3: Di properti lain
        else {
          // Cari semua array dalam data
          const findArraysInObject = (obj, path = "") => {
            const arrays = [];
            Object.keys(obj).forEach((key) => {
              const value = obj[key];
              if (Array.isArray(value) && value.length > 0) {
                // Cek jika array ini berisi chapter-like objects
                const firstItem = value[0];
                if (firstItem && typeof firstItem === "object") {
                  const hasChapterProps =
                    firstItem.chapterIndex !== undefined ||
                    firstItem.chapterNo !== undefined ||
                    firstItem.title !== undefined ||
                    firstItem.episode !== undefined;

                  if (hasChapterProps) {
                    arrays.push({
                      path: path ? `${path}.${key}` : key,
                      array: value,
                      length: value.length,
                    });
                  }
                }
              } else if (typeof value === "object" && value !== null) {
                arrays.push(
                  ...findArraysInObject(value, path ? `${path}.${key}` : key)
                );
              }
            });
            return arrays;
          };

          const foundArrays = findArraysInObject(chaptersData);
          console.log(
            `🔍 Found ${foundArrays.length} potential chapter arrays:`,
            foundArrays
          );

          if (foundArrays.length > 0) {
            // Ambil array pertama yang memiliki item
            const bestArray = foundArrays.sort(
              (a, b) => b.length - a.length
            )[0];
            console.log(
              `✅ Using chapters from ${bestArray.path} with ${bestArray.length} items`
            );
            chaptersList = bestArray.array;
          }
        }

        // Normalize chapters
        const normalizedChapters = chaptersList.map((chapter, index) => ({
          chapterIndex:
            chapter.chapterIndex !== undefined ? chapter.chapterIndex : index,
          chapterNo: chapter.chapterNo || chapter.episode || index + 1,
          title:
            chapter.title || chapter.chapterTitle || `Episode ${index + 1}`,
          duration: chapter.duration || null,
          isFree: chapter.isFree !== false,
          isLocked: chapter.isLocked || false,
          cover: chapter.cover || chapter.image,
          playCount: chapter.playCount,
          rawChapter: chapter, // Keep for debugging
        }));

        console.log(
          `📊 Normalized ${normalizedChapters.length} chapters for ${bookId}`
        );

        return {
          list: normalizedChapters,
          total: chaptersData.total || normalizedChapters.length,
          isMore: chaptersData.isMore || false,
          bookId: bookId,
          rawResponse: chaptersData,
          hasChapters: normalizedChapters.length > 0,
        };
      }

      console.warn("⚠️ No successful chapters data found");
      return {
        list: [],
        total: 0,
        isMore: false,
        bookId: bookId,
        hasChapters: false,
        error: "No successful response",
      };
    } catch (error) {
      console.error("❌ Error getChapters:", error.message);
      return {
        list: [],
        total: 0,
        isMore: false,
        bookId: bookId,
        hasChapters: false,
        error: error.message,
      };
    }
  },

  getWatch: async (bookId, chapterIndex = 0) => {
    try {
      console.log(
        `🎥 Fetching watch data for ${bookId} chapter ${chapterIndex}`
      );
      const response = await apiClient.get(
        `/watch/${bookId}/${chapterIndex}?lang=in&source=search_result`
      );

      const responseData = response.data || response;
      console.log("Watch response:", {
        success: responseData?.success,
        hasData: !!responseData?.data,
        videoUrl: responseData?.data?.videoUrl ? "Available" : "Missing",
        dataKeys: responseData?.data ? Object.keys(responseData.data) : [],
      });

      if (responseData?.success && responseData?.data) {
        const videoData = responseData.data;

        // Cek jika video URL valid
        let videoUrl = videoData.videoUrl || videoData.url;
        let isVideoValid = false;

        if (videoUrl && typeof videoUrl === "string") {
          // Cek jika URL mengandung domain video yang valid
          const validDomains = [
            "dramaboxdb.com",
            "dramacool",
            "vidstream",
            "mp4",
            "m3u8",
          ];
          isVideoValid = validDomains.some((domain) =>
            videoUrl.includes(domain)
          );

          if (!isVideoValid) {
            console.warn(
              "⚠️ Video URL mungkin tidak valid:",
              videoUrl.substring(0, 50)
            );
          }
        }

        // Jika ada qualities array, ambil yang terbaik
        if (
          videoData.qualities &&
          Array.isArray(videoData.qualities) &&
          videoData.qualities.length > 0
        ) {
          const sortedQualities = [...videoData.qualities].sort((a, b) => {
            const qualityA = parseInt(a.quality) || 0;
            const qualityB = parseInt(b.quality) || 0;
            return qualityB - qualityA;
          });

          videoUrl = sortedQualities[0].url || videoUrl;
          isVideoValid = true;
          console.log(`🎯 Selected quality: ${sortedQualities[0].quality}p`);
        }

        return {
          url: videoUrl,
          title: videoData.title || `Episode ${chapterIndex + 1}`,
          description: videoData.description || videoData.introduction,
          duration: videoData.duration,
          qualities: videoData.qualities || [],
          bookId: videoData.bookId || bookId,
          chapterIndex: videoData.chapterIndex || chapterIndex,
          cover: videoData.cover,
          nextChapter: (videoData.chapterIndex || chapterIndex) + 1,
          hasNext: videoData.hasNext !== false,
          isVideoValid: isVideoValid,
          isFallback: false,
          success: true,
        };
      }

      // Jika tidak ada data yang valid
      console.warn("❌ No valid video data found in API response");
      return {
        url: null,
        title: `Episode ${chapterIndex + 1}`,
        description: "Video tidak tersedia",
        isVideoValid: false,
        isFallback: false,
        success: false,
        error: "NO_VIDEO_DATA",
      };
    } catch (error) {
      console.error("❌ Error getWatch:", error.message);

      // Tentukan tipe error
      let errorType = "NETWORK_ERROR";
      let errorMessage = "Gagal terhubung ke server";

      if (error.message.includes("404")) {
        errorType = "NOT_FOUND";
        errorMessage = "Episode tidak ditemukan";
      } else if (error.message.includes("CORS")) {
        errorType = "CORS_ERROR";
        errorMessage = "Terjadi masalah dengan server video";
      } else if (error.message.includes("timeout")) {
        errorType = "TIMEOUT";
        errorMessage = "Server tidak merespons";
      }

      return {
        url: null,
        title: `Episode ${chapterIndex + 1}`,
        description: errorMessage,
        isVideoValid: false,
        isFallback: false,
        success: false,
        error: errorType,
      };
    }
  },

  // POST: /api/watch/player?lang=in
  getPlayer: async (bookId, chapterIndex = 0) => {
    try {
      // Skip karena CORS, gunakan getWatch saja
      console.log("⏭️ Skipping player endpoint, using getWatch instead");
      return await dramaAPI.getWatch(bookId, chapterIndex);
    } catch (error) {
      console.error("Error getPlayer:", error.message);
      return {
        url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
        success: false,
      };
    }
  },
};
