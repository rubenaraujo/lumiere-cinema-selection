import { Film } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-primary">
            <Film className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Lumiere
          </h1>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Descobrir conteúdo de qualidade
        </div>
      </div>
    </header>
  );
};

export default Header;