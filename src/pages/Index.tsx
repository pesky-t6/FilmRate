// The front page of the website showing a list of movies and TV shows
// Everything starts here! (kinda)

import { useState, useEffect } from "react";
import { Search, Film, Tv, ChevronDown, ClockArrowUp, ClockArrowDown, ArrowDownNarrowWide, ArrowDownWideNarrow, Check, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { MovieCard } from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import TMDBIcon from "@/assets/tmdb.svg";

interface Movie {
  id: string;
  title: string;
  description: string | null;
  release_year: number | null;
  poster_url: string | null;
  type: "movie" | "tv";
}

interface MovieWithRating extends Movie {
  averageRating: number | null;
  reviewCount: number;
}

type FilterType = "all" | "movie" | "tv";

export default function Index() {
  const [movies, setMovies] = useState<MovieWithRating[]>([]);
  const [tvshows, setTVShows] = useState<MovieWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "best rating" | "worst rating">("newest");

  useEffect(() => {
    fetchMovies();
    fetchTVShows();
  }, []);

  const PAGE_SIZE = 1000;

  // Fetch movies and their average ratings from the database
  const fetchMovies = async () => {
    try {
      const { data: moviesData, error: moviesError } = await supabase
        .from("movies")
        .select("*")
        .eq("type", "movie")
        .order("popularity", { ascending: false })
        .limit(PAGE_SIZE);

      if (moviesError) throw moviesError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("movie_id, rating");

      if (reviewsError) throw reviewsError;

      // Calculate average ratings
      const ratingsMap = new Map<string, { sum: number; count: number }>();
      reviewsData?.forEach((review) => {
        const existing = ratingsMap.get(review.movie_id) || { sum: 0, count: 0 };
        ratingsMap.set(review.movie_id, {
          sum: existing.sum + review.rating,
          count: existing.count + 1,
        });
      });

      // Combine movie data with ratings
      const moviesWithRatings: MovieWithRating[] = (moviesData || []).map((movie) => {
        const ratingData = ratingsMap.get(movie.id);
        return {
          ...movie,
          type: movie.type as "movie",
          averageRating: ratingData ? ratingData.sum / ratingData.count : null,
          reviewCount: ratingData?.count || 0,
        };
      });

      console.log('Movies data:', moviesData?.length, 'Movies with ratings:', moviesWithRatings.length);
      console.log('Movies by type:', moviesWithRatings.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));

      setMovies(moviesWithRatings);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch TV Shows and their average ratings from the database
  const fetchTVShows = async () => {
    try {
      const { data: TVData, error: TVError } = await supabase
        .from("movies")
        .select("*")
        .eq("type", "tv")
        .order("popularity", { ascending: false })
        .limit(PAGE_SIZE);

      if (TVError) throw TVError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("movie_id, rating");

      if (reviewsError) throw reviewsError;

      // Calculate average ratings
      const ratingsMap = new Map<string, { sum: number; count: number }>();
      reviewsData?.forEach((review) => {
        const existing = ratingsMap.get(review.movie_id) || { sum: 0, count: 0 };
        ratingsMap.set(review.movie_id, {
          sum: existing.sum + review.rating,
          count: existing.count + 1,
        });
      });

      // Combine movie data with ratings
      const TVWithRatings: MovieWithRating[] = (TVData || []).map((movie) => {
        const ratingData = ratingsMap.get(movie.id);
        return {
          ...movie,
          type: movie.type as "tv",
          averageRating: ratingData ? ratingData.sum / ratingData.count : null,
          reviewCount: ratingData?.count || 0,
        };
      });

      console.log('TV Shows data:', TVData?.length, 'TV with ratings:', TVWithRatings.length);
      console.log('Movies by type:', TVWithRatings.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));

      setTVShows(TVWithRatings);
    } catch (error) {
      console.error("Error fetching TV shows:", error);
    } finally {
      setLoading(false);
    }
  };

  const allItems = [...movies, ...tvshows];

  // Filter all the movies and shows and sort them based on the user's choices
  const filteredMovies = allItems
    .filter((movie) => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === "all" || movie.type === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.release_year || 0).getTime() - new Date(b.release_year || 0).getTime();
        case "best rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "worst rating":
          return (a.averageRating || 0) - (b.averageRating || 0);
        case "newest":
        default:
          return new Date(b.release_year || 0).getTime() - new Date(a.release_year || 0).getTime();
      }
    });

  // The main render of the index page
  return (
    <div className="min-h-screen bg-background">
      <Header />
    
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Discover & Review
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your thoughts on the movies and TV shows you love. Read reviews from fellow cinephiles.
          </p>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
            <img src={TMDBIcon} alt="TMDB Logo" className="ml-2 inline-block h-12 w-12" />
          </p>
        </section>

        {/* Search and Filter */}
        <section className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search movies and TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button className="IconButton" size="sm">
                  {sortBy === "newest" && <ClockArrowUp className="h-4 w-4" />}
                  {sortBy === "oldest" && <ClockArrowDown className="h-4 w-4" />}
                  {sortBy === "best rating" && <ArrowDownWideNarrow className="h-4 w-4" />}
                  {sortBy === "worst rating" && <ArrowDownNarrowWide className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortBy("newest")}>
                  {sortBy === "newest" && <Check className="mr-2 h-4 w-4" />}
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                  {sortBy === "oldest" && <Check className="mr-2 h-4 w-4" />}
                  Oldest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("best rating")}>
                  {sortBy === "best rating" && <Check className="mr-2 h-4 w-4" />}
                  Highest Rated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("worst rating")}>
                  {sortBy === "worst rating" && <Check className="mr-2 h-4 w-4" />}
                  Lowest Rated
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "movie" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilter("movie")}
              className="gap-1"
            >
              <Film className="h-4 w-4" />
              Movies
            </Button>
            <Button
              variant={filter === "tv" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilter("tv")}
              className="gap-1"
            >
              <Tv className="h-4 w-4" />
              TV Shows
            </Button>
          </div>
        </section>

        {/* Movies Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No movies or shows found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_url}
                  releaseYear={movie.release_year}
                  type={movie.type}
                  averageRating={movie.averageRating}
                  reviewCount={movie.reviewCount}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 FilmRate. Share your movie journey.
          </p>
        </div>
      </footer>
    </div>
  );
}
