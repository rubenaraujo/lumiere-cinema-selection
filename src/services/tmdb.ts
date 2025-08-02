// TMDb API Service
// Note: API key needs to be provided by the user

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '9fd38d064c1422abdae6485d2d64ec0f'; // Default API key

export const setTmdbApiKey = (apiKey: string) => {
  // In a real app, you would store this more securely
  (window as any).TMDB_API_KEY = apiKey;
};

export const getTmdbApiKey = (): string => {
  return (window as any).TMDB_API_KEY || TMDB_API_KEY;
};

export const isApiKeySet = (): boolean => {
  return Boolean(getTmdbApiKey());
};

interface TmdbResponse<T> {
  results: T[];
  total_pages: number;
  total_results: number;
}

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids: number[];
  original_language: string;
  popularity: number;
}

interface TvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  first_air_date: string;
  genre_ids: number[];
  original_language: string;
  popularity: number;
}

interface Genre {
  id: number;
  name: string;
}

export interface ContentItem {
  id: number;
  title: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  original_language: string;
  popularity: number;
}

export interface Filters {
  contentType: 'movie' | 'tv' | 'miniseries';
  genres: number[];
  yearFrom: string;
  yearTo: string;
  language: string;
  minRating: number;
}

const makeRequest = async (endpoint: string, params: Record<string, any> = {}) => {
  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', apiKey);
  url.searchParams.append('language', 'pt-BR');
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`TMDb API error: ${response.status}`);
  }
  
  return response.json();
};

export const getGenres = async (contentType: 'movie' | 'tv'): Promise<Genre[]> => {
  const response = await makeRequest(`/genre/${contentType}/list`);
  return response.genres;
};

export const discoverContent = async (
  filters: Filters,
  page: number = 1
): Promise<TmdbResponse<ContentItem>> => {
  const { contentType, genres, yearFrom, yearTo, language, minRating } = filters;
  
  // For miniseries, we search TV shows with specific constraints
  const searchType = contentType === 'miniseries' ? 'tv' : contentType;
  
  const params: Record<string, any> = {
    page,
    'vote_average.gte': minRating,
    'vote_count.gte': 50, // Lower threshold for larger pool
    // Completely random sorting for maximum variety
    sort_by: ['popularity.desc', 'popularity.asc', 'release_date.desc', 'vote_average.desc', 'vote_count.desc'][Math.floor(Math.random() * 5)],
  };

  // Add miniseries specific constraints
  if (contentType === 'miniseries') {
    params['with_type'] = '2'; // Miniseries type
  }

  if (genres.length > 0) {
    params.with_genres = genres.join(',');
  }

  if (yearFrom) {
    if (searchType === 'movie') {
      params['primary_release_date.gte'] = `${yearFrom}-01-01`;
    } else {
      params['first_air_date.gte'] = `${yearFrom}-01-01`;
    }
  }

  if (yearTo) {
    if (searchType === 'movie') {
      params['primary_release_date.lte'] = `${yearTo}-12-31`;
    } else {
      params['first_air_date.lte'] = `${yearTo}-12-31`;
    }
  }

  if (language && language !== 'all') {
    params.with_original_language = language;
  }

  const response = await makeRequest(`/discover/${searchType}`, params);
  
  // Normalize the response to have consistent field names
  const normalizedResults = response.results.map((item: Movie | TvShow) => ({
    ...item,
    title: (item as Movie).title || (item as TvShow).name,
    original_title: (item as any).original_title,
    original_name: (item as any).original_name,
    release_date: (item as Movie).release_date,
    first_air_date: (item as TvShow).first_air_date,
  }));

  return {
    ...response,
    results: normalizedResults,
  };
};

export const getRandomSuggestion = async (filters: Filters): Promise<ContentItem | null> => {
  try {
    // Get total results first
    const initialResponse = await discoverContent(filters, 1);
    
    if (initialResponse.results.length === 0) {
      return null;
    }
    
    // Use much more pages for bigger pool (up to 500 pages = 10,000 items)
    const totalPages = Math.min(initialResponse.total_pages, 500);
    const randomPage = Math.floor(Math.random() * totalPages) + 1;
    
    // Get the random page
    let finalResponse = initialResponse;
    if (randomPage > 1) {
      finalResponse = await discoverContent(filters, randomPage);
    }
    
    if (finalResponse.results.length === 0) {
      return null;
    }
    
    // Pick completely random item
    const randomIndex = Math.floor(Math.random() * finalResponse.results.length);
    return finalResponse.results[randomIndex];
  } catch (error) {
    console.error('Error getting random suggestion:', error);
    return null;
  }
};

// Get detailed information about a specific content item
export const getContentDetails = async (
  contentType: string, 
  id: number
): Promise<any> => {
  const searchType = contentType === 'miniseries' ? 'tv' : contentType;
  const response = await makeRequest(`/${searchType}/${id}`, {
    append_to_response: 'credits'
  });
  return response;
};