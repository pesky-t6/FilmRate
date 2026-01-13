import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Note: For seeding, you might need service role key

if (!TMDB_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  popularity: number;
  vote_count: number;
  vote_average: number;
  backdrop_path: string | null;
  genre_ids: number[];
}

interface TMDBShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  poster_path: string | null;
  popularity: number;
  vote_count: number;
  vote_average: number;
  backdrop_path: string | null;
  genre_ids: number[];
}

async function fetchPopularMovies(page: number = 1, minVotes: number = 500): Promise<TMDBMovie[]> {
  const response = await fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&page=${page}&vote_count.gte=${minVotes}&sort_by=popularity.desc`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

async function fetchPopularShows(page: number = 1, minVotes: number = 500): Promise<TMDBShow[]> {
  const response = await fetch(
    `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&page=${page}&vote_count.gte=${minVotes}&sort_by=popularity.desc`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

async function seedMovies() {
  try {
    console.log('Clearing existing movies and shows...');

    // Delete all existing movies
    const { error: deleteError } = await supabase
      .from('movies')
      .delete()
      .in('type', ['movie', 'tv']);

    if (deleteError) {
      console.error('Error deleting existing movies and shows:', deleteError);
      return;
    }

    console.log('Fetching popular movies and shows from TMDB...');

    // Fetch first 10 pages (200 movies)
    const allMovies: TMDBMovie[] = [];
    for (let page = 1; page <= 50; page++) {
      console.log(`Fetching movie page ${page}...`);
      const movies = await fetchPopularMovies(page, 500);
      allMovies.push(...movies);
    }

    // Fetch first 10 pages (200 tv shows)
    const allShows: TMDBShow[] = [];
    for (let page = 1; page <= 50; page++) {
      console.log(`Fetching shows page ${page}...`);
      const shows = await fetchPopularShows(page, 500);
        allShows.push(...shows);
    }

    console.log(`Fetched ${allMovies.length} movies and ${allShows.length} shows. Inserting into database...`);

    const combined: (TMDBMovie | TMDBShow)[] = [...allMovies, ...allShows];

    // Transform and insert movies and shows
    const moviesToInsert = allMovies
      .filter(movie => movie.title && movie.title.trim())
      .map((movie) => ({
        tmdb_id: movie.id,
        title: movie.title,
        description: movie.overview,
        release_year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        poster_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        backdrop_url: movie.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
          : null,
        popularity: movie.popularity,
        vote_count: movie.vote_count,
        vote_average: movie.vote_average,
        genre_ids: movie.genre_ids,
        type: 'movie' as const,
      }));

    const showsToInsert = allShows
      .filter(show => show.name && show.name.trim())
      .map((show) => ({
        tmdb_id: show.id,
        title: show.name,
        description: show.overview,
        release_year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
        poster_url: show.poster_path
          ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
          : null,
        backdrop_url: show.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}`
          : null,
        popularity: show.popularity,
        vote_count: show.vote_count,
        vote_average: show.vote_average,
        genre_ids: show.genre_ids,
        type: 'tv' as const,
      }));

    const allToInsert = [...moviesToInsert, ...showsToInsert];

    // Insert in batches to avoid payload size limits
    const batchSize = 50;
    for (let i = 0; i < allToInsert.length; i += batchSize) {
      const batch = allToInsert.slice(i, i + batchSize);
      if (i === 0) {
        console.log('First item in first batch:', batch[0]);
      }
      const { data, error } = await supabase
        .from('movies')
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
      } else {
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}, inserted ${data?.length || 0} records`);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding movies:', error);
  }
}

seedMovies();