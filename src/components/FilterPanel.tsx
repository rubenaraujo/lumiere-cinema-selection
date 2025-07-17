import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Filter, RotateCcw } from "lucide-react";

interface FilterPanelProps {
  onFiltersChange: (filters: any) => void;
  onGetSuggestion: () => void;
  isLoading: boolean;
}

const genres = [
  { id: 28, name: "Ação" },
  { id: 35, name: "Comédia" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Terror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Ficção científica" },
  { id: 53, name: "Thriller" },
  { id: 16, name: "Animação" },
  { id: 12, name: "Aventura" },
  { id: 14, name: "Fantasia" },
  { id: 36, name: "História" },
  { id: 10402, name: "Música" },
  { id: 9648, name: "Mistério" },
  { id: 10751, name: "Família" },
  { id: 10752, name: "Guerra" },
  { id: 37, name: "Western" }
];

const languages = [
  { code: "pt", name: "Português" },
  { code: "en", name: "Inglês" },
  { code: "es", name: "Espanhol" },
  { code: "fr", name: "Francês" },
  { code: "de", name: "Alemão" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "Japonês" },
  { code: "ko", name: "Coreano" },
];

const FilterPanel = ({ onFiltersChange, onGetSuggestion, isLoading }: FilterPanelProps) => {
  const [contentType, setContentType] = useState("movie");
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [language, setLanguage] = useState("");

  const handleGenreChange = (genreId: number, checked: boolean) => {
    const newSelectedGenres = checked
      ? [...selectedGenres, genreId]
      : selectedGenres.filter(id => id !== genreId);
    
    setSelectedGenres(newSelectedGenres);
    updateFilters(contentType, newSelectedGenres, yearFrom, yearTo, language);
  };

  const updateFilters = (type: string, genres: number[], from: string, to: string, lang: string) => {
    onFiltersChange({
      contentType: type,
      genres,
      yearFrom: from,
      yearTo: to,
      language: lang
    });
  };

  const handleReset = () => {
    setContentType("movie");
    setSelectedGenres([]);
    setYearFrom("");
    setYearTo("");
    setLanguage("");
    updateFilters("movie", [], "", "", "");
  };

  const handleContentTypeChange = (value: string) => {
    setContentType(value);
    updateFilters(value, selectedGenres, yearFrom, yearTo, language);
  };

  const handleYearFromChange = (value: string) => {
    setYearFrom(value);
    updateFilters(contentType, selectedGenres, value, yearTo, language);
  };

  const handleYearToChange = (value: string) => {
    setYearTo(value);
    updateFilters(contentType, selectedGenres, yearFrom, value, language);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    updateFilters(contentType, selectedGenres, yearFrom, yearTo, value);
  };

  return (
    <Card className="w-full max-w-md shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Type */}
        <div className="space-y-2">
          <Label htmlFor="content-type">Tipo de conteúdo</Label>
          <Select value={contentType} onValueChange={handleContentTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="movie">Filmes</SelectItem>
              <SelectItem value="tv">Séries</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Genres */}
        <div className="space-y-3">
          <Label>Géneros</Label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {genres.map((genre) => (
              <div key={genre.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`genre-${genre.id}`}
                  checked={selectedGenres.includes(genre.id)}
                  onCheckedChange={(checked) => handleGenreChange(genre.id, checked as boolean)}
                />
                <Label 
                  htmlFor={`genre-${genre.id}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {genre.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Year Range */}
        <div className="space-y-2">
          <Label>Ano de lançamento</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="year-from" className="text-xs text-muted-foreground">De</Label>
              <Input
                id="year-from"
                type="number"
                placeholder="1990"
                value={yearFrom}
                onChange={(e) => handleYearFromChange(e.target.value)}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <Label htmlFor="year-to" className="text-xs text-muted-foreground">Até</Label>
              <Input
                id="year-to"
                type="number"
                placeholder={new Date().getFullYear().toString()}
                value={yearTo}
                onChange={(e) => handleYearToChange(e.target.value)}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Qualquer idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Qualquer idioma</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            variant="spotlight" 
            size="lg" 
            className="w-full"
            onClick={onGetSuggestion}
            disabled={isLoading}
          >
            {isLoading ? "A sugerir..." : "Sugerir conteúdo"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;