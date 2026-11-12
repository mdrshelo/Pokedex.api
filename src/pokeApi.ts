
const URL_BASE = 'https://pokeapi.co/api/v2';
const TEMPO_LIMITE_MS = 5000;
const NOME_VALIDO = /^[a-z0-9-]{1,40}$/;

export interface Pokemon {
  numero: number;
  nome: string;
  tipos: string[];
  imagem: string | null;
}

interface RespostaPokeApi {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  sprites: { front_default: string | null };
}

interface RespostaLista {
  count: number;
  results: { name: string }[];
}

export interface ResultadoLista {
  total: number;
  limite: number;
  offset: number;
  resultados: Pokemon[];
}

const cache = new Map<string, Pokemon>();

export class ErroDaApi extends Error {
  constructor(public readonly status: number, mensagem: string) {
    super(mensagem);
  }
}

function normalizar(termo: string): string {
  const nome = termo.trim().toLowerCase();

  if (!NOME_VALIDO.test(nome)) {
    throw new ErroDaApi(
      400,
      'Pesquisa inválida. Digite um nome ou número de Pokémon.'
    );
  }

  return nome;
}

function resumir(dados: RespostaPokeApi): Pokemon {
  return {
    numero: dados.id,
    nome: dados.name,
    tipos: dados.types.map((t) => t.type.name),
    imagem: dados.sprites.front_default,
  };
}

async function consultarApi(url: string): Promise<Response> {
  try {
    return await fetch(url, {
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
  } catch {
    throw new ErroDaApi(
      503,
      'A PokéAPI não respondeu. Tente novamente em instantes.'
    );
  }
}

export async function buscarPokemon(termo: string): Promise<Pokemon> {
  const nome = normalizar(termo);

  const guardado = cache.get(nome);
  if (guardado) return guardado;

  const resposta = await consultarApi(`${URL_BASE}/pokemon/${nome}`);

  if (resposta.status === 404) {
    throw new ErroDaApi(404, `Pokémon ${nome} não encontrado.`);
  }

  if (!resposta.ok) {
    throw new ErroDaApi(503, 'A PokéAPI está temporariamente indisponível.');
  }

  const dados = (await resposta.json()) as RespostaPokeApi;
  const pokemon = resumir(dados);

  cache.set(nome, pokemon);
  cache.set(String(pokemon.numero), pokemon);

  return pokemon;
}

export async function listarPokemons(
  limite: number,
  offset: number
): Promise<ResultadoLista> {
  if (
    !Number.isInteger(limite) ||
    limite < 1 ||
    limite > 40 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new ErroDaApi(400, 'Parâmetros de paginação inválidos.');
  }

  const resposta = await consultarApi(
    `${URL_BASE}/pokemon?limit=${limite}&offset=${offset}`
  );

  if (!resposta.ok) {
    throw new ErroDaApi(503, 'Não foi possível carregar o catálogo.');
  }

  const dados = (await resposta.json()) as RespostaLista;

  const resultados = await Promise.all(
    dados.results.map((pokemon) => buscarPokemon(pokemon.name))
  );

  return {
    total: dados.count,
    limite,
    offset,
    resultados,
  };
}
