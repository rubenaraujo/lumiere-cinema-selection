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
  
  // For miniseries, we search TV shows and filter by series characteristics
  const searchType = contentType === 'miniseries' ? 'tv' : contentType;
  
  const params: Record<string, any> = {
    page,
    'vote_average.gte': minRating,
    'vote_count.gte': 10,
    sort_by: [
      'popularity.desc', 
      'popularity.asc', 
      'release_date.desc', 
      'release_date.asc',
      'vote_average.desc', 
      'vote_average.asc',
      'vote_count.desc',
      'vote_count.asc'
    ][Math.floor(Math.random() * 8)],
  };

  console.log(`🔍 DISCOVER: contentType=${contentType}, searchType=${searchType}, page=${page}`);
  console.log(`🔍 FILTERS: genres=[${genres.join(',')}], year=${yearFrom}-${yearTo}, lang=${language}, rating>=${minRating}`);
  
  // For miniseries, don't use restrictive filters - we'll filter in post-processing
  if (contentType === 'miniseries') {
    console.log('🎬 Searching for miniseries (will filter by episode count and status after API call)');
  }

  if (genres.length > 0) {
    params.with_genres = genres.join(',');
    console.log(`🏷️ Genre filter applied: [${genres.join(',')}]`);
  }

  if (yearFrom) {
    if (searchType === 'movie') {
      params['primary_release_date.gte'] = `${yearFrom}-01-01`;
    } else {
      params['first_air_date.gte'] = `${yearFrom}-01-01`;
    }
    console.log(`📅 Year from: ${yearFrom}`);
  }

  if (yearTo) {
    if (searchType === 'movie') {
      params['primary_release_date.lte'] = `${yearTo}-12-31`;
    } else {
      params['first_air_date.lte'] = `${yearTo}-12-31`;
    }
    console.log(`📅 Year to: ${yearTo}`);
  }

  if (language && language !== 'all') {
    params.with_original_language = language;
    console.log(`🌍 Language: ${language}`);
  }
  
  // Debug: log the exact request parameters being sent
  console.log('🔍 TMDb API request params for searchType:', searchType, params);
  console.log('🔍 Full URL will be:', `${TMDB_BASE_URL}/discover/${searchType}`, 'with params:', params);
  
  // Debug: log the actual request parameters
  console.log('TMDb API request params:', params);

  const response = await makeRequest(`/discover/${searchType}`, params);
  
  // Debug: log the response and check for specific titles
  console.log(`📊 TMDb API response - Page ${page}: ${response.results.length} results, Total pages: ${response.total_pages}, Total results: ${response.total_results}`);
  
  // Debug: Check for mystery genre specifically
  if (genres.includes(9648)) { // Mystery genre ID
    console.log('🔍 Mystery genre filter active - checking for mystery shows...');
    const mysteryShows = response.results.filter(item => item.genre_ids.includes(9648));
    console.log(`🔍 Found ${mysteryShows.length} shows with mystery genre on this page`);
  }
  
  // Debug: Check if specific series are in results
  const targetSeries = [
    { name: 'Presumed Innocent', id: 156933 },
    { name: 'Black Bird', id: 155537 }
  ];
  
  targetSeries.forEach(target => {
    const found = response.results.find(item => 
      (item.title || item.name)?.toLowerCase().includes(target.name.toLowerCase()) || 
      item.id === target.id
    );
    if (found) {
      console.log(`🎯 Found ${target.name} on page ${page}:`, {
        id: found.id,
        title: found.title || found.name,
        vote_average: found.vote_average,
        vote_count: found.vote_count,
        genre_ids: found.genre_ids,
        original_language: found.original_language,
        first_air_date: found.first_air_date
      });
    } else {
      console.log(`❌ ${target.name} NOT found on page ${page}`);
    }
  });
  
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

// Global suggestion pool cache
let suggestionPool: ContentItem[] = [];
let currentFiltersKey = '';

const getFiltersKey = (filters: Filters): string => {
  return JSON.stringify(filters);
};

export const clearSuggestionPool = () => {
  suggestionPool = [];
  currentFiltersKey = '';
};


const buildSuggestionPool = async (filters: Filters): Promise<ContentItem[]> => {
  const filtersKey = getFiltersKey(filters);
  
  // If filters changed, clear the pool
  if (currentFiltersKey !== filtersKey) {
    suggestionPool = [];
    currentFiltersKey = filtersKey;
  }
  
  // If pool is already built, return it
  if (suggestionPool.length > 0) {
    return suggestionPool;
  }
  
  console.log('Building complete suggestion pool...');
  
  // Get first page to know total pages
  const initialResponse = await discoverContent(filters, 1);
  
  if (initialResponse.results.length === 0) {
    return [];
  }
  
  const allResults: ContentItem[] = [...initialResponse.results];
  const totalPages = Math.min(initialResponse.total_pages, 50); // Limit to 50 pages for performance
  
  console.log(`Total pages available: ${initialResponse.total_pages}, Fetching: ${totalPages}`);
  
  // Fetch remaining pages in parallel (in batches to avoid overwhelming the API)
  const batchSize = 5;
  for (let i = 2; i <= totalPages; i += batchSize) {
    const batchPromises = [];
    const batchEnd = Math.min(i + batchSize - 1, totalPages);
    
    for (let page = i; page <= batchEnd; page++) {
      batchPromises.push(discoverContent(filters, page));
    }
    
    try {
      const batchResponses = await Promise.all(batchPromises);
      batchResponses.forEach(response => {
        allResults.push(...response.results);
      });
      
      console.log(`Fetched pages ${i}-${batchEnd}, Total items so far: ${allResults.length}`);
    } catch (error) {
      console.error(`Error fetching batch ${i}-${batchEnd}:`, error);
      // Continue with what we have
      break;
    }
  }
  
  // Remove duplicates
  const uniqueResults = allResults.filter((item, index, self) => 
    index === self.findIndex(i => i.id === item.id)
  );
  
  // If searching for miniseries, get detailed info and filter more intelligently
  let filteredResults = uniqueResults;
  if (filters.contentType === 'miniseries') {
    console.log('🎬 Filtering for miniseries characteristics...');
    const detailedResults = [];
    
    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < uniqueResults.length; i += 10) {
      const batch = uniqueResults.slice(i, i + 10);
      const detailPromises = batch.map(async (item) => {
        try {
          const details = await makeRequest(`/tv/${item.id}`);
          // Check if it's a miniseries-like show
          const isMiniseries = 
            details.type === 'Miniseries' || 
            details.status === 'Ended' && details.number_of_seasons === 1 && details.number_of_episodes <= 12 ||
            details.status === 'Returning Series' && details.number_of_seasons === 1 && details.number_of_episodes <= 12;
          
          if (isMiniseries) {
            console.log(`✅ ${details.name} qualifies as miniseries: type=${details.type}, seasons=${details.number_of_seasons}, episodes=${details.number_of_episodes}, status=${details.status}`);
            return { ...item, ...details };
          } else {
            console.log(`❌ ${details.name} doesn't qualify: type=${details.type}, seasons=${details.number_of_seasons}, episodes=${details.number_of_episodes}, status=${details.status}`);
            return null;
          }
        } catch (error) {
          console.error(`Error getting details for ${item.title}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(detailPromises);
      detailedResults.push(...batchResults.filter(Boolean));
      
      console.log(`Processed ${i + batch.length}/${uniqueResults.length} items, found ${detailedResults.length} miniseries so far`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    filteredResults = detailedResults;
    console.log(`After miniseries filtering: ${filteredResults.length} items`);
  }
  
  // Fisher-Yates shuffle algorithm
  for (let i = filteredResults.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filteredResults[i], filteredResults[j]] = [filteredResults[j], filteredResults[i]];
  }
  
  suggestionPool = filteredResults;
  console.log(`Built suggestion pool with ${suggestionPool.length} unique items (shuffled)`);
  
  // Debug: Check if "Presumed Innocent" is in the pool
  const presumedInnocent = suggestionPool.find(item => 
    (item.title || item.original_title || item.original_name)?.toLowerCase().includes('presumed innocent') || 
    item.id === 156933
  );
  if (presumedInnocent) {
    console.log('🎯 Presumed Innocent found in suggestion pool:', presumedInnocent);
  }
  
  const blackBird = suggestionPool.find(item => 
    (item.title || item.original_title || item.original_name)?.toLowerCase().includes('black bird') || 
    item.id === 155537
  );
  if (blackBird) {
    console.log('🎯 Black Bird found in suggestion pool:', blackBird);
  }
  
  return suggestionPool;
};

export const getRandomSuggestion = async (filters: Filters, excludeIds: number[] = []): Promise<ContentItem | null> => {
  try {
    const pool = await buildSuggestionPool(filters);
    
    console.log(`🎯 SUGGESTION STATUS: Pool has ${pool.length} total items`);
    console.log(`🎯 SUGGESTION STATUS: ${excludeIds.length} already shown`);
    console.log(`🎯 SUGGESTION STATUS: ${pool.length - excludeIds.length} available to show`);
    console.log(`🎯 EXCLUDED IDs: [${excludeIds.join(', ')}]`);
    
    if (pool.length === 0) {
      console.log('❌ No items in suggestion pool');
      return null;
    }
    
    // Show all available items in pool for debugging
    console.log('📚 COMPLETE POOL CONTENTS:');
    pool.forEach((item, index) => {
      const isShown = excludeIds.includes(item.id);
      console.log(`  ${index + 1}. [ID: ${item.id}] ${item.title} ${isShown ? '(ALREADY SHOWN)' : '(AVAILABLE)'}`);
    });
    
    // Find first item that hasn't been shown yet
    const availableItem = pool.find(item => !excludeIds.includes(item.id));
    
    if (!availableItem) {
      console.log('⚠️ All suggestions have been shown. Pool exhausted. Resetting...');
      // Reset the shown IDs when pool is exhausted and return first item
      const firstItem = pool[0];
      console.log(`🔄 Restarting with: ${firstItem.title}`);
      return firstItem;
    }
    
    console.log(`✅ SELECTED SUGGESTION: [ID: ${availableItem.id}] ${availableItem.title}`);
    console.log(`✅ This is suggestion ${excludeIds.length + 1} of ${pool.length} total`);
    return availableItem;
  } catch (error) {
    console.error('❌ Error getting random suggestion:', error);
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

// Test function to search for specific series by name
export const searchSpecificSeries = async (query: string): Promise<any> => {
  const response = await makeRequest('/search/tv', { query });
  return response;
};

// Test function to get details of specific series by ID
export const testSeriesById = async (id: number): Promise<any> => {
  try {
    const response = await makeRequest(`/tv/${id}`);
    console.log(`📺 Series details for ID ${id}:`, {
      id: response.id,
      name: response.name,
      first_air_date: response.first_air_date,
      vote_average: response.vote_average,
      vote_count: response.vote_count,
      genres: response.genres,
      original_language: response.original_language,
      number_of_episodes: response.number_of_episodes,
      number_of_seasons: response.number_of_seasons,
      episode_run_time: response.episode_run_time,
      status: response.status,
      type: response.type
    });
    return response;
  } catch (error) {
    console.error(`❌ Error getting details for series ID ${id}:`, error);
    return null;
  }
};

// Test function to manually check if series meet our filter criteria
export const testFilterCompatibility = async (): Promise<void> => {
  console.log('🧪 TESTING SPECIFIC SERIES COMPATIBILITY...');
  
  // Test "Presumed Innocent" (ID: 156933)
  console.log('\n🔍 Testing "Presumed Innocent"...');
  const presumedInnocent = await testSeriesById(156933);
  
  // Test "Black Bird" (ID: 155537) 
  console.log('\n🔍 Testing "Black Bird"...');
  const blackBird = await testSeriesById(155537);
  
  // Test search by name
  console.log('\n🔍 Searching for "Presumed Innocent" by name...');
  const searchResults1 = await searchSpecificSeries('Presumed Innocent');
  console.log('Search results:', searchResults1.results?.slice(0, 3));
  
  console.log('\n🔍 Searching for "Black Bird" by name...');
  const searchResults2 = await searchSpecificSeries('Black Bird');
  console.log('Search results:', searchResults2.results?.slice(0, 3));
  
  // Test discover with very broad filters
  console.log('\n🔍 Testing discover with broad filters (miniseries, mystery, 2021+, rating 6+)...');
  const broadFilters: Filters = {
    contentType: 'miniseries',
    genres: [9648], // Mystery
    yearFrom: '2021',
    yearTo: '',
    language: 'en',
    minRating: 6
  };
  
  const discoverResults = await discoverContent(broadFilters, 1);
  console.log(`Discover found ${discoverResults.results.length} results`);
  
  // Check if our target series are in the results
  const foundPresumed = discoverResults.results.find(item => 
    item.id === 156933 || item.title?.toLowerCase().includes('presumed innocent')
  );
  const foundBlackBird = discoverResults.results.find(item => 
    item.id === 155537 || item.title?.toLowerCase().includes('black bird')
  );
  
  console.log('Found Presumed Innocent in discover?', foundPresumed ? 'YES' : 'NO');
  console.log('Found Black Bird in discover?', foundBlackBird ? 'YES' : 'NO');
};