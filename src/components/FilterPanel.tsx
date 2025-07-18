import { useState } from "react";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import ContentTypeSelector from "./ContentTypeSelector";
import AdvancedFilters from "./AdvancedFilters";

interface FilterPanelProps {
  onFiltersChange: (filters: any) => void;
  onGetSuggestion: () => void;
  isLoading: boolean;
}

const FilterPanel = ({ onFiltersChange, onGetSuggestion, isLoading }: FilterPanelProps) => {
  const [contentType, setContentType] = useState("movie");
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [language, setLanguage] = useState("en");

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
    setLanguage("en");
    updateFilters("movie", [], "", "", "en");
  };

  const handleContentTypeChange = (value: string) => {
    setContentType(value);
    updateFilters(value, selectedGenres, yearFrom, yearTo, language);
  };

  const handleGenreChange = (genreId: number, checked: boolean) => {
    const newSelectedGenres = checked
      ? [...selectedGenres, genreId]
      : selectedGenres.filter(id => id !== genreId);
    
    setSelectedGenres(newSelectedGenres);
    updateFilters(contentType, newSelectedGenres, yearFrom, yearTo, language);
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
    <div className="w-full max-w-md space-y-4">
      {/* Content Type Selector - Outside filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de conteúdo</label>
        <ContentTypeSelector 
          value={contentType} 
          onChange={handleContentTypeChange} 
        />
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        selectedGenres={selectedGenres}
        yearFrom={yearFrom}
        yearTo={yearTo}
        language={language}
        onGenreChange={handleGenreChange}
        onYearFromChange={handleYearFromChange}
        onYearToChange={handleYearToChange}
        onLanguageChange={handleLanguageChange}
        onReset={handleReset}
      />

      {/* Suggestion Button */}
      <Button 
        variant="spotlight" 
        size="lg" 
        className="w-full"
        onClick={onGetSuggestion}
        disabled={isLoading}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {isLoading ? "A sugerir..." : "Sugerir conteúdo"}
      </Button>
    </div>
  );
};

export default FilterPanel;