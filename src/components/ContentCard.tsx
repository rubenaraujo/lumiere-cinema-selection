import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, ExternalLink, Star, Users, Play, User } from "lucide-react";

interface ContentCardProps {
  content: {
    id: number;
    title: string;
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
    created_by?: { id: number; name: string; }[];
    production_companies?: { id: number; name: string; }[];
  };
  contentType: string;
  genres: { id: number; name: string; }[];
}

const ContentCard = ({ content, contentType, genres }: ContentCardProps) => {
  const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
  const backdropBaseUrl = "https://image.tmdb.org/t/p/w1280";
  
  const releaseDate = content.release_date || content.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";
  
  const contentGenres = content.genre_ids
    .map(id => genres.find(g => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3);

  const tmdbUrl = `https://www.themoviedb.org/${contentType}/${content.id}`;
  const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(content.title + ' trailer')}`;
  
  const creators = content.created_by?.slice(0, 2) || 
    content.production_companies?.slice(0, 2) || [];

  return (
    <Card className="w-full max-w-4xl shadow-card overflow-hidden">
      {/* Backdrop Image */}
      {content.backdrop_path && (
        <div 
          className="h-48 bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${backdropBaseUrl}${content.backdrop_path})`
          }}
        >
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
              {content.title}
            </h1>
            <div className="flex items-center gap-4 text-white/90 text-sm">
              {year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {year}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                {content.vote_average.toFixed(1)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {content.vote_count.toLocaleString()} votos
              </div>
            </div>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Poster */}
          <div className="md:col-span-1">
            {content.poster_path ? (
              <img
                src={`${imageBaseUrl}${content.poster_path}`}
                alt={content.title}
                className="w-full rounded-lg shadow-soft"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Content Details */}
          <div className="md:col-span-2 space-y-4">
            {/* Title for mobile (hidden on desktop where it's in backdrop) */}
            {!content.backdrop_path && (
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {content.title}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  {year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {year}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {content.vote_average.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {content.vote_count.toLocaleString()} votos
                  </div>
                </div>
              </div>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {contentGenres.map((genre, index) => (
                <Badge key={index} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Overview */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Sinopse</h3>
              <p className="text-muted-foreground leading-relaxed">
                {content.overview || "Sinopse não disponível."}
              </p>
            </div>

            {/* Creator Info */}
            {creators.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {contentType === 'movie' ? 'Produção' : 'Criado por'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {creators.map((creator, index) => (
                    <Badge key={index} variant="outline">
                      {creator.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-foreground">Idioma Original</span>
                <p className="text-sm text-muted-foreground">{content.original_language.toUpperCase()}</p>
              </div>
              {creators.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-foreground">
                    {contentType === 'movie' ? 'Produção' : 'Criador'}
                  </span>
                  <p className="text-sm text-muted-foreground">{creators[0].name}</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button
                size="lg"
                className="w-full"
                onClick={() => window.open(trailerUrl, '_blank')}
              >
                <Play className="w-4 h-4 mr-2" />
                Ver Trailer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentCard;