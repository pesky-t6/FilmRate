import { Link } from "react-router-dom";
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";

interface MovieCardProps {
  id: string;
  title: string;
  posterUrl: string | null;
  releaseYear: number | null;
  type: "movie" | "tv";
  averageRating: number | null;
  reviewCount: number;
}

export function MovieCard({
  id,
  title,
  posterUrl,
  releaseYear,
  type,
  averageRating,
  reviewCount,
}: MovieCardProps) {
  return (
    <Link
      to={`/movie/${id}`}
      className="group block animate-fade-in"
    >
      <div className="relative overflow-hidden rounded-lg bg-card border border-border transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={posterUrl || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop"}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Badge 
            variant="secondary" 
            className="mb-2 text-xs uppercase tracking-wider"
          >
            {type === "tv" ? "TV Show" : "Movie"}
          </Badge>
          
          <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
            {title}
          </h3>
          
          {releaseYear && (
            <p className="text-sm text-muted-foreground mb-2">{releaseYear}</p>
          )}
          
          <div className="flex items-center gap-2">
            {averageRating !== null ? (
              <>
                <StarRating rating={Math.round(averageRating)} size="sm" />
                <span className="text-sm text-muted-foreground">
                  ({reviewCount})
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No reviews yet</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
