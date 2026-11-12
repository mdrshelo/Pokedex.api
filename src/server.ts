
import express, {
    type NextFunction,
    type Request,
    type Response,
  } from 'express';
  
  import path from 'node:path';
  
  import {
    buscarPokemon,
    buscarDetalhesPokemon,
    listarPokemons,
    ErroDaApi,
  } from './pokeApi.js';
  
  const PORTA = Number(process.env.PORT ?? 3000);
  const app = express();
  
  app.use(express.static(path.join(import.meta.dirname, '..', 'public')));
  
  // Catálogo
  app.get('/api/pokemons', async (req: Request, res: Response) => {
    const limite = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);
  
    const catalogo = await listarPokemons(limite, offset);
    res.status(200).json(catalogo);
  });
  
  // Detalhes completos de um Pokémon
  app.get(
    '/api/pokemons/:termo/detalhes',
    async (req: Request<{ termo: string }>, res: Response) => {
      const detalhes = await buscarDetalhesPokemon(req.params.termo);
      res.status(200).json(detalhes);
    }
  );
  
  // Pesquisa resumida
  app.get(
    '/api/pokemons/:termo',
    async (req: Request<{ termo: string }>, res: Response) => {
      const pokemon = await buscarPokemon(req.params.termo);
      res.status(200).json(pokemon);
    }
  );
  
  // Rota inexistente
  app.use('/api', (req: Request, res: Response) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
  });
  
  // Tratamento de erros
  app.use(
    (
      erro: unknown,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      if (res.headersSent) {
        next(erro);
        return;
      }
  
      if (erro instanceof ErroDaApi) {
        res.status(erro.status).json({ erro: erro.message });
        return;
      }
  
      console.error(erro);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  );
  
  app.listen(PORTA, () => {
    console.log(`Pokédex em http://localhost:${PORTA}`);
  });
  