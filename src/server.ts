
import express, {
    type NextFunction,
    type Request,
    type Response,
  } from 'express';
  
  import path from 'node:path';
  
  import { buscarPokemon, ErroDaApi } from './pokeApi.js';
  
  const PORTA = Number(process.env.PORT ?? 3000);
  
  const app = express();
  
  // Entrega os arquivos da página (HTML, CSS e JavaScript)
  app.use(express.static(path.join(import.meta.dirname, '..', 'public')));
  
  // Rota para buscar um Pokémon
  app.get(
    '/api/pokemons/:termo',
    async (req: Request<{ termo: string }>, res: Response) => {
      const pokemon = await buscarPokemon(req.params.termo);
  
      res.status(200).json(pokemon);
    }
  );
  
  // Rota para endereços da API que não existem
  app.use('/api', (req: Request, res: Response) => {
    res.status(404).json({
      erro: 'Rota não encontrada',
    });
  });
  
  // Tratamento geral de erros
  app.use(
    (
      erro: unknown,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      if (erro instanceof ErroDaApi) {
        res.status(erro.status).json({
          erro: erro.message,
        });
  
        return;
      }
  
      console.error(erro);
  
      res.status(500).json({
        erro: 'Erro interno do servidor',
      });
    }
  );
  
  // Inicia o servidor
  app.listen(PORTA, () => {
    console.log(`Pokédex em http://localhost:${PORTA}`);
  });
  