import { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import Header from "./Header";
import FilterPanel from "./FilterPanel";
import ContentCard from "./ContentCard";
import Footer from "./Footer";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Sparkles } from "lucide-react";
import { 
  getRandomSuggestion, 
  getGenres, 
  type ContentItem, 
  type Filters 
} from "../services/tmdb";

const LumiereApp = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState<{ id: number; name: string; }[]>([]);
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    contentType: 'movie',
    genres: [],
    yearFrom: '',
    yearTo: '',
    language: 'en',
    minRating: 7
  });

  useEffect(() => {
    // Load genres for both movies and TV shows on app start
    const loadGenres = async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([
          getGenres('movie'),
          getGenres('tv')
        ]);
        
        // Merge and deduplicate genres
        const allGenres = [...movieGenres, ...tvGenres];
        const uniqueGenres = allGenres.filter((genre, index, self) => 
          index === self.findIndex(g => g.id === genre.id)
        );
        
        setGenres(uniqueGenres);
      } catch (error) {
        console.error('Error loading genres:', error);
        toast({
          title: "Erro ao carregar géneros",
          description: "Não foi possível carregar a lista de géneros.",
          variant: "destructive",
        });
      }
    };

    loadGenres();
  }, [toast]);

  const handleFiltersChange = (filters: Filters) => {
    setCurrentFilters(filters);
    // Clear current content when filters change
    setContent(null);
  };

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    try {
      const suggestion = await getRandomSuggestion(currentFilters);
      
      if (suggestion) {
        setContent(suggestion);
        toast({
          title: "Nova sugestão!",
          description: `${suggestion.title} foi sugerido para ti.`,
        });
      } else {
        toast({
          title: "Nenhuma sugestão encontrada",
          description: "Tente ajustar os filtros para encontrar mais conteúdo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error getting suggestion:', error);
      toast({
        title: "Erro ao buscar sugestão",
        description: "Tente novamente em alguns momentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              onFiltersChange={handleFiltersChange}
              onGetSuggestion={handleGetSuggestion}
              isLoading={isLoading}
            />
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {content ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Sugestão para ti
                </h2>
                
                <ContentCard
                  content={content}
                  contentType={currentFilters.contentType}
                  genres={genres}
                />
              </div>
            ) : (
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Pronto para descobrir algo incrível?
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Configura os filtros ao lado e clica em "Sugerir conteúdo" para descobrir 
                    filmes, séries e mini-séries de alta qualidade personalizados para ti.
                  </p>
                  <Button
                    variant="spotlight"
                    size="lg"
                    onClick={handleGetSuggestion}
                    disabled={isLoading}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLoading ? "A sugerir..." : "Começar agora"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LumiereApp;