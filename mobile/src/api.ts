const BASE_URL = "https://jmhstream.online";

async function fetchAPI(path: string) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function normalizeMovie(m: any) {
  const subjectId = m.subjectId || m.id || m._id || "";
  const title = m.title || m.name || "Unknown";
  const posterUrl = m.cover?.url || m.coverUrl || m.posterUrl || m.poster || "";
  const bannerUrl = m.stills?.url || m.banner?.url || m.backdrop || m.backdropUrl || posterUrl;
  const description = m.description || m.overview || m.intro || "";
  const rating = m.imdbRatingValue || m.rating || m.score;
  const year = m.releaseDate?.split("-")[0] || m.year || m.releaseYear;
  const type = m.subjectType === 2 ? "tv" : m.type || "movie";
  const genreStr = m.genre || m.genres;
  const genres: string[] = typeof genreStr === "string"
    ? genreStr.split(",").map((g: string) => g.trim()).filter(Boolean)
    : Array.isArray(genreStr) ? genreStr : [];
  return { subjectId, title, posterUrl, bannerUrl, description, rating, year, type, genres };
}

function extractMovies(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data?.items) return data.data.items;
  if (data.data?.subjectList) return data.data.subjectList;
  if (data.list) return data.list;
  if (data.items) return data.items;
  if (data.results) return data.results;
  return [];
}

export async function getHome() {
  const [home, trending, featured] = await Promise.allSettled([
    fetchAPI("/api/home"),
    fetchAPI("/api/trending?page=1&perPage=24"),
    fetchAPI("/api/public/featured"),
  ]);
  const trendingMovies = trending.status === "fulfilled"
    ? extractMovies(trending.value).map(normalizeMovie) : [];
  const featuredItems = featured.status === "fulfilled" && Array.isArray(featured.value)
    ? featured.value.slice(0, 6).map(normalizeMovie) : [];
  const heroMovies = featuredItems.length > 0 ? featuredItems : trendingMovies.slice(0, 6);
  const sections: Array<{ title: string; movies: any[] }> = [];
  if (home.status === "fulfilled" && home.value?.data) {
    const d = home.value.data;
    if (d.topPickList?.length) sections.push({ title: "Top Picks", movies: d.topPickList.map(normalizeMovie) });
    if (d.homeList?.length) sections.push({ title: "For You", movies: d.homeList.map(normalizeMovie) });
  }
  if (trendingMovies.length) sections.unshift({ title: "Trending Now", movies: trendingMovies.slice(0, 20) });
  return { heroMovies, sections };
}

export async function getMovies(page = 1) {
  const data = await fetchAPI(`/api/trending?page=${page}&perPage=24&type=movie`);
  return extractMovies(data).map(normalizeMovie);
}

export async function getShows(page = 1) {
  const data = await fetchAPI(`/api/trending?page=${page}&perPage=24&type=tv`);
  return extractMovies(data).map(normalizeMovie);
}

export async function searchContent(query: string) {
  const data = await fetchAPI(`/api/search?q=${encodeURIComponent(query)}&page=1&perPage=20`);
  return extractMovies(data).map(normalizeMovie);
}

export async function getMovieDetail(subjectId: string) {
  return fetchAPI(`/api/movie-info?subjectId=${subjectId}`);
}

export async function getStreamSources(subjectId: string, season?: number, episode?: number) {
  const qs = season ? `subjectId=${subjectId}&season=${season}&episode=${episode}` : `subjectId=${subjectId}`;
  return fetchAPI(`/api/stream?${qs}`);
}

export async function getRecommendations(subjectId: string) {
  const data = await fetchAPI(`/api/recommend?subjectId=${subjectId}&page=1&perPage=20`);
  return extractMovies(data).map(normalizeMovie);
}

export async function getWatchlist() {
  return fetchAPI("/api/watchlist");
}

export async function getTrending(page = 1) {
  const data = await fetchAPI(`/api/trending?page=${page}&perPage=24`);
  return extractMovies(data).map(normalizeMovie);
}
