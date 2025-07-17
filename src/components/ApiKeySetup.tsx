import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Key, ExternalLink, Info } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeySetup = ({ onApiKeySet }: ApiKeySetupProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsLoading(true);
    
    // Test the API key
    try {
      const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${apiKey}`);
      if (response.ok) {
        onApiKeySet(apiKey);
      } else {
        alert("Chave de API inválida. Verifique se a chave está correta.");
      }
    } catch (error) {
      alert("Erro ao validar a chave de API. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-primary">
            <Key className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Configurar API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Para usar o Lumiere, você precisa de uma chave de API gratuita da TMDb.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Como obter sua chave de API:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Acesse o site da TMDb e crie uma conta</li>
                <li>Vá para as configurações da sua conta</li>
                <li>Clique em "API" e solicite uma chave</li>
                <li>Cole a chave abaixo</li>
              </ol>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.open('https://www.themoviedb.org/settings/api', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Obter chave de API da TMDb
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Chave de API da TMDb</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Cole sua chave de API aqui"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              variant="spotlight" 
              size="lg" 
              className="w-full"
              disabled={isLoading || !apiKey.trim()}
            >
              {isLoading ? "Validando..." : "Confirmar"}
            </Button>
          </form>

          <div className="text-xs text-muted-foreground text-center">
            A chave é armazenada apenas no seu navegador e não é enviada para nenhum servidor.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeySetup;