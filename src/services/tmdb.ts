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

// Cache for recent suggestions to avoid repetition
const recentSuggestions = new Set<number>();
const MAX_RECENT_SUGGESTIONS = 50; // Remember last 50 suggestions

const addToRecentSuggestions = (id: number) => {
  recentSuggestions.add(id);
  // Keep only the most recent suggestions
  if (recentSuggestions.size > MAX_RECENT_SUGGESTIONS) {
    const oldestItems = Array.from(recentSuggestions).slice(0, recentSuggestions.size - MAX_RECENT_SUGGESTIONS);
    oldestItems.forEach(item => recentSuggestions.delete(item));
  }
};

export const clearSuggestionHistory = () => {
  recentSuggestions.clear();
};

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
    'vote_count.gte': 100,
  };
  
  // Randomize sorting method for much better variety
  const sortOptions = [
    'popularity.desc', 'popularity.asc',
    'release_date.desc', 'release_date.asc', 
    'vote_average.desc', 'vote_count.desc',
    'original_title.asc'
  ];
  
  params.sort_by = sortOptions[Math.floor(Math.random() * sortOptions.length)];

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
  const MAX_ATTEMPTS = 10; // Maximum attempts to find a non-repeated suggestion
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      // Vary search strategy for better randomness
      const searchStrategy = Math.random();
      let modifiedFilters = { ...filters };
      
      // Occasionally broaden search criteria for more variety
      if (searchStrategy < 0.2 && attempt > 2) {
        // Lower rating threshold slightly for more variety
        modifiedFilters.minRating = Math.max(6.0, filters.minRating - 0.5);
      }
      
      // Get total results first
      const initialResponse = await discoverContent(modifiedFilters, 1);
      
      if (initialResponse.results.length === 0) {
        continue; // Try next attempt with different strategy
      }
      
      // Calculate available pages (limit to first 100 pages)
      const totalPages = Math.min(initialResponse.total_pages, 100);
      
      // Use different page selection strategy
      let randomPage: number;
      if (searchStrategy < 0.4) {
        // Sometimes prefer later pages for more variety
        const startPage = Math.max(1, Math.floor(totalPages * 0.3));
        randomPage = Math.floor(Math.random() * (totalPages - startPage + 1)) + startPage;
      } else {
        randomPage = Math.floor(Math.random() * totalPages) + 1;
      }
      
      // Get the random page
      let finalResponse = initialResponse;
      if (randomPage > 1) {
        finalResponse = await discoverContent(modifiedFilters, randomPage);
      }
      
      if (finalResponse.results.length === 0) {
        continue;
      }
      
      // Filter out recently suggested items
      const availableResults = finalResponse.results.filter(
        item => !recentSuggestions.has(item.id)
      );
      
      // If all results are recent, allow repetition but prefer less recent ones
      const resultsToUse = availableResults.length > 0 ? availableResults : finalResponse.results;
      
      // Pick random item
      const randomIndex = Math.floor(Math.random() * resultsToUse.length);
      const selectedItem = resultsToUse[randomIndex];
      
      // Add to recent suggestions
      addToRecentSuggestions(selectedItem.id);
      
      return selectedItem;
      
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      continue;
    }
  }
  
  console.error('Failed to get suggestion after multiple attempts');
  return null;
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