// MovieDetail.tsx is used to display detailed information about a specific movie or TV show,
// including its reviews. Users can read existing reviews, write new ones, and edit or delete their own reviews.
// TODO: Implement a like/dislike feature for reviews.

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Film, Tv } from "lucide-react";
import { Header } from "@/components/Header";
import { StarRating } from "@/components/StarRating";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Movie {
  id: string;
  title: string;
  description: string | null;
  release_year: number | null;
  poster_url: string | null;
  type: "movie" | "tv";
}

interface Review {
  id: string;
  rating: number;
  content: string;
  user_id: string;
  created_at: string;
  username: string;
}

// Main component for movie detail page
export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  const userReview = reviews.find((r) => r.user_id === user?.id);

  useEffect(() => {
    if (id) {
      fetchMovieAndReviews();
    }
  }, [id]);

  // Fetch movie details and the available reviews
  const fetchMovieAndReviews = async () => {
    try {
      const { data: movieData, error: movieError } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .single();

      if (movieError) throw movieError;
      setMovie({ ...movieData, type: movieData.type as "movie" | "tv" });

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          content,
          user_id,
          created_at
        `)
        .eq("movie_id", id)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch usernames for reviews
      const userIds = [...new Set(reviewsData?.map((r) => r.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const usernameMap = new Map(
        profilesData?.map((p) => [p.user_id, p.username]) || []
      );

      const reviewsWithUsernames: Review[] = (reviewsData || []).map((r) => ({
        ...r,
        username: usernameMap.get(r.user_id) || "Anonymous",
      }));

      setReviews(reviewsWithUsernames);
    } catch (error) {
      console.error("Error fetching movie:", error);
      toast({
        title: "Error",
        description: "Failed to load movie details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle submission of a new review
  const handleSubmitReview = async (rating: number, content: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to write a review.",
        variant: "destructive",
      });
      return;
    }

    // if the user is logged in, submit the review
    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        rating,
        content,
        user_id: user.id,
        movie_id: id,
      });

      // Handle unique constraint violation (user can only review once)
      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already reviewed",
            description: "You've already reviewed this title. Edit your existing review instead.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Review submitted!",
          description: "Your review has been posted.",
        });
        fetchMovieAndReviews();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle editing an existing review
  // Attempts to update the review in the database
  const handleEditReview = async (reviewId: string, rating: number, content: string) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ rating, content })
        .eq("id", reviewId);

      if (error) throw error;

      toast({
        title: "Review updated",
        description: "Your changes have been saved.",
      });
      fetchMovieAndReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      toast({
        title: "Error",
        description: "Failed to update review.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a review
  // Attempts to remove the review from the database
  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

      if (error) throw error;

      toast({
        title: "Review deleted",
        description: "Your review has been removed.",
      });
      fetchMovieAndReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "Failed to delete review.",
        variant: "destructive",
      });
    }
  };

  // How the page looks while it loads
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // If no movie is found with the given ID
  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Movie not found</h1>
          <Button asChild className="mt-4">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Main render of the movie detail page
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        {/* Movie Details */}
        <div className="grid gap-8 md:grid-cols-[300px_1fr] animate-fade-in">
          <div className="overflow-hidden rounded-lg">
            <img
              src={movie.poster_url || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop"}
              alt={movie.title}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="gap-1">
                {movie.type === "tv" ? (
                  <>
                    <Tv className="h-3 w-3" /> TV Show
                  </>
                ) : (
                  <>
                    <Film className="h-3 w-3" /> Movie
                  </>
                )}
              </Badge>
              {movie.release_year && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {movie.release_year}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              {movie.title}
            </h1>

            {averageRating !== null && (
              <div className="flex items-center gap-3">
                <StarRating rating={Math.round(averageRating)} size="lg" />
                <span className="text-lg font-medium text-foreground">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}

            {movie.description && (
              <p className="text-foreground/80 leading-relaxed max-w-2xl">
                {movie.description}
              </p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Reviews</h2>

          {/* Write Review Form */}
          {user && !userReview && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-foreground mb-4">Write a Review</h3>
              <ReviewForm onSubmit={handleSubmitReview} isLoading={submitting} />
            </div>
          )}

          {!user && (
            <div className="mb-8 rounded-lg border border-border bg-card p-6 text-center">
              <p className="text-muted-foreground mb-4">Sign in to write a review</p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            // No Reviews Message
            <div className="text-center py-12 rounded-lg border border-border bg-card">
              <p className="text-muted-foreground">
                No reviews yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            // Reviews List
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  rating={review.rating}
                  content={review.content}
                  createdAt={review.created_at}
                  username={review.username}
                  isOwner={user?.id === review.user_id}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 FilmRate Share your movie journey.
          </p>
        </div>
      </footer>
    </div>
  );
}
