import { Button } from "./ui/button";
import { Film, Tv, Clock } from "lucide-react";

interface ContentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ContentTypeSelector = ({ value, onChange }: ContentTypeSelectorProps) => {
  const options = [
    { value: "movie", label: "Filmes", icon: Film },
    { value: "tv", label: "Séries", icon: Tv },
  ];

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <Button
            key={option.value}
            variant={value === option.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onChange(option.value)}
            className="flex-1 gap-2"
          >
            <Icon className="w-4 h-4" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
};

export default ContentTypeSelector;