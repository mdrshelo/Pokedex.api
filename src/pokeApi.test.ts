
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buscarPokemon } from './pokeApi.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buscarPokemon', () => {
  it('deve retornar os dados resumidos de um Pokémon', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          name: 'bulbasaur',
          types: [
            { type: { name: 'grass' } },
            { type: { name: 'poison' } }
          ],
          sprites: {
            front_default: 'https://exemplo.com/bulbasaur.png'
          }
        }),
        { status: 200 }
      )
    );

    vi.stubGlobal('fetch', fetchMock);

    const pokemon = await buscarPokemon('bulbasaur');

    expect(pokemon).toEqual({
      numero: 1,
      nome: 'bulbasaur',
      tipos: ['grass', 'poison'],
      imagem: 'https://exemplo.com/bulbasaur.png'
    });
  });

  it('deve rejeitar um termo inválido com status 400', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(buscarPokemon('pikachu!')).rejects.toMatchObject({
      status: 400
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('deve retornar status 404 quando o Pokémon não existe', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, { status: 404 })
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      buscarPokemon('pokemon-inexistente')
    ).rejects.toMatchObject({
      status: 404
    });
  });

  it('deve retornar status 503 quando a API não responde', async () => {
    const fetchMock = vi.fn().mockRejectedValue(
      new Error('Falha de conexão')
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(buscarPokemon('mewtwo')).rejects.toMatchObject({
      status: 503
    });
  });

  it('deve reutilizar os dados guardados no cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 999,
          name: 'pokemon-teste-cache',
          types: [{ type: { name: 'normal' } }],
          sprites: { front_default: null }
        }),
        { status: 200 }
      )
    );

    vi.stubGlobal('fetch', fetchMock);

    await buscarPokemon('pokemon-teste-cache');
    await buscarPokemon('pokemon-teste-cache');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
