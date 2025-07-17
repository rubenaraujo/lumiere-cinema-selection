# Lumiere - Descobrir Filmes e Séries de Qualidade

Uma aplicação web estática para descobrir filmes, séries e mini-séries de alta qualidade usando a API da TMDb.

## Funcionalidades

- **Filtragem inteligente**: Selecione tipo de conteúdo (filme/série), géneros, intervalo de datas e idioma
- **Sugestões de qualidade**: Conteúdo com pontuação mínima de 7.0 e número significativo de avaliações
- **Sugestões aleatórias**: Descubra conteúdo novo com base nos seus filtros
- **Detalhes completos**: Veja sinopse, elenco, avaliações e informações técnicas
- **Design responsivo**: Interface otimizada para desktop e mobile
- **Tema escuro**: Design cinematográfico elegante

## Tecnologias Utilizadas

- React 18 com TypeScript
- Tailwind CSS para estilização
- Shadcn/ui para componentes
- TMDb API para dados de filmes e séries
- Vite para build e desenvolvimento

## Configuração

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Execute o projeto: `npm run dev`

A aplicação já está configurada com uma chave API da TMDb para uso imediato.

## Deploy

Este projeto está configurado para deploy estático no GitHub Pages:

1. Build o projeto: `npm run build`
2. Deploy a pasta `dist` para o GitHub Pages

## Licença

Este projeto foi desenvolvido por Ruben Araujo.

## Nota sobre a API

A aplicação utiliza a API da TMDb para obter dados de filmes e séries. Os dados são obtidos diretamente da TMDb sem armazenamento em servidor próprio.