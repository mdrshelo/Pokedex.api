
const campoPesquisa = document.getElementById('termo');
const botaoBuscar = document.getElementById('buscar');
const botaoAleatorio = document.getElementById('aleatorio');
const botaoFavoritar = document.getElementById('favoritar');

const mensagem = document.getElementById('mensagem');
const resultado = document.getElementById('resultado');
const nomePokemon = document.getElementById('nome');
const imagemPokemon = document.getElementById('imagem');
const numeroPokemon = document.getElementById('numero');
const tiposPokemon = document.getElementById('tipos');
const listaFavoritos = document.getElementById('lista-favoritos');

const CHAVE_FAVORITOS = 'pokedex-favoritos';

let pokemonAtual = null;
let favoritos = carregarFavoritos();

const coresTipos = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD'
};

async function buscarPokemon(termo) {
  const pesquisa = termo.trim().toLowerCase();

  if (!pesquisa) {
    mostrarMensagem('Digite o nome ou número de um Pokémon.', true);
    campoPesquisa.focus();
    return;
  }

  botaoBuscar.disabled = true;
  botaoBuscar.textContent = 'Buscando...';
  botaoAleatorio.disabled = true;
  resultado.hidden = true;
  mostrarMensagem('Consultando a PokéAPI...');

  try {
    const resposta = await fetch(
      `/api/pokemons/${encodeURIComponent(pesquisa)}`
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Pokémon não encontrado.');
    }

    exibirPokemon(dados);
    mostrarMensagem('Pokémon encontrado com sucesso!');
  } catch (erro) {
    resultado.hidden = true;
    pokemonAtual = null;
    mostrarMensagem(
      erro.message || 'Não foi possível conectar ao servidor.',
      true
    );
  } finally {
    botaoBuscar.disabled = false;
    botaoBuscar.textContent = 'Buscar';
    botaoAleatorio.disabled = false;
  }
}

function exibirPokemon(pokemon) {
  pokemonAtual = pokemon;

  nomePokemon.textContent =
    pokemon.nome.charAt(0).toUpperCase() + pokemon.nome.slice(1);

  numeroPokemon.textContent =
    `#${String(pokemon.numero).padStart(3, '0')}`;

  if (pokemon.imagem) {
    imagemPokemon.src = pokemon.imagem;
    imagemPokemon.alt = `Imagem de ${pokemon.nome}`;
    imagemPokemon.hidden = false;
  } else {
    imagemPokemon.removeAttribute('src');
    imagemPokemon.alt = '';
    imagemPokemon.hidden = true;
  }

  tiposPokemon.replaceChildren();

  pokemon.tipos.forEach((tipo) => {
    const etiqueta = document.createElement('span');
    etiqueta.className = 'tipo';
    etiqueta.textContent = tipo;
    etiqueta.style.backgroundColor = coresTipos[tipo] || '#777777';
    tiposPokemon.appendChild(etiqueta);
  });

  atualizarBotaoFavorito();
  resultado.hidden = false;
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle('erro', erro);
}

function carregarFavoritos() {
  try {
    const dados = JSON.parse(
      localStorage.getItem(CHAVE_FAVORITOS) || '[]'
    );

    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarFavoritos() {
  localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos));
}

function atualizarBotaoFavorito() {
  if (!pokemonAtual) return;

  const salvo = favoritos.some(
    (pokemon) => pokemon.numero === pokemonAtual.numero
  );

  botaoFavoritar.textContent = salvo
    ? '★ Remover dos favoritos'
    : '☆ Adicionar aos favoritos';
}

function alternarFavorito() {
  if (!pokemonAtual) return;

  const existe = favoritos.some(
    (pokemon) => pokemon.numero === pokemonAtual.numero
  );

  if (existe) {
    favoritos = favoritos.filter(
      (pokemon) => pokemon.numero !== pokemonAtual.numero
    );

    mostrarMensagem('Pokémon removido dos favoritos.');
  } else {
    favoritos.push(pokemonAtual);
    mostrarMensagem('Pokémon adicionado aos favoritos!');
  }

  salvarFavoritos();
  atualizarBotaoFavorito();
  renderizarFavoritos();
}

function renderizarFavoritos() {
  listaFavoritos.replaceChildren();

  if (favoritos.length === 0) {
    const vazio = document.createElement('p');
    vazio.className = 'vazio';
    vazio.textContent = 'Você ainda não tem favoritos.';
    listaFavoritos.appendChild(vazio);
    return;
  }

  favoritos.forEach((pokemon) => {
    const card = document.createElement('article');
    card.className = 'favorito-card';

    const abrir = document.createElement('button');
    abrir.type = 'button';
    abrir.className = 'favorito-card';
    abrir.setAttribute('aria-label', `Abrir ${pokemon.nome}`);

    const imagem = document.createElement('img');
    imagem.src = pokemon.imagem || '';
    imagem.alt = `Imagem de ${pokemon.nome}`;

    const nome = document.createElement('strong');
    nome.textContent = pokemon.nome;

    const numero = document.createElement('small');
    numero.textContent = `#${pokemon.numero}`;

    abrir.append(imagem, nome, numero);

    abrir.addEventListener('click', () => {
      campoPesquisa.value = pokemon.nome;
      exibirPokemon(pokemon);
      mostrarMensagem('Pokémon carregado dos seus favoritos.');
      resultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.textContent = 'Remover';
    remover.className = 'botao-favorito';

    remover.addEventListener('click', () => {
      favoritos = favoritos.filter(
        (item) => item.numero !== pokemon.numero
      );

      salvarFavoritos();
      renderizarFavoritos();
      atualizarBotaoFavorito();
      mostrarMensagem(`${pokemon.nome} removido dos favoritos.`);
    });

    card.append(abrir, remover);
    listaFavoritos.appendChild(card);
  });
}

function buscarAleatorio() {
  const numero = Math.floor(Math.random() * 1025) + 1;
  campoPesquisa.value = numero;
  buscarPokemon(String(numero));
}

botaoBuscar.addEventListener('click', () => {
  buscarPokemon(campoPesquisa.value);
});

campoPesquisa.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    buscarPokemon(campoPesquisa.value);
  }
});

botaoAleatorio.addEventListener('click', buscarAleatorio);
botaoFavoritar.addEventListener('click', alternarFavorito);

renderizarFavoritos();
