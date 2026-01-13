-- Add TMDB fields to movies table
ALTER TABLE public.movies
ADD COLUMN tmdb_id INTEGER UNIQUE,
ADD COLUMN popularity NUMERIC,
ADD COLUMN vote_count INTEGER,
ADD COLUMN vote_average NUMERIC,
ADD COLUMN backdrop_url TEXT,
ADD COLUMN genre_ids INTEGER[];