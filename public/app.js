
const campoPesquisa = document.getElementById('termo');
const botaoBuscar = document.getElementById('buscar');
const mensagem = document.getElementById('mensagem');

const resultado = document.getElementById('resultado');
const nomePokemon = document.getElementById('nome');
const imagemPokemon = document.getElementById('imagem');
const numeroPokemon = document.getElementById('numero');
const tiposPokemon = document.getElementById('tipos');
const botaoFavoritar = document.getElementById('favoritar');

const listaPokemons = document.getElementById('lista-pokemons');
const listaFavoritos = document.getElementById('lista-favoritos');
const filtroTipo = document.getElementById('filtro-tipo');

const botaoAnterior = document.getElementById('anterior');
const botaoProximo = document.getElementById('proximo');
const textoPagina = document.getElementById('pagina');
const contador = document.getElementById('contador');

const LIMITE = 20;
const CHAVE_FAVORITOS = 'pokedex-favoritos';

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

let pokemonAtual = null;
let catalogoAtual = [];
let favoritos = carregarFavoritos();
let offsetAtual = 0;
let totalPokemons = 0;

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
  localStorage.setItem(
    CHAVE_FAVORITOS,
    JSON.stringify(favoritos)
  );
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle('erro', erro);
}

function criarTipos(tipos) {
  const area = document.createElement('div');
  area.className = 'tipos';

  tipos.forEach((tipo) => {
    const etiqueta = document.createElement('span');

    etiqueta.className = 'tipo';
    etiqueta.textContent = tipo;
    etiqueta.style.backgroundColor = coresTipos[tipo] || '#777777';

    area.appendChild(etiqueta);
  });

  return area;
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

  tiposPokemon.replaceChildren(
    ...criarTipos(pokemon.tipos).childNodes
  );

  atualizarBotaoFavorito();
  resultado.hidden = false;
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

function alternarFavorito(pokemon) {
  const existe = favoritos.some(
    (item) => item.numero === pokemon.numero
  );

  if (existe) {
    favoritos = favoritos.filter(
      (item) => item.numero !== pokemon.numero
    );

    mostrarMensagem(`${pokemon.nome} removido dos favoritos.`);
  } else {
    favoritos.push(pokemon);
    mostrarMensagem(`${pokemon.nome} adicionado aos favoritos!`);
  }

  salvarFavoritos();
  renderizarFavoritos();
  atualizarBotaoFavorito();
}

function criarCard(pokemon) {
  const card = document.createElement('article');
  card.className = 'card-pokemon';

  const abrir = document.createElement('button');
  abrir.type = 'button';
  abrir.className = 'abrir-pokemon';
  abrir.setAttribute('aria-label', `Ver detalhes de ${pokemon.nome}`);

  const imagem = document.createElement('img');
  imagem.src = pokemon.imagem || '';
  imagem.alt = `Imagem de ${pokemon.nome}`;
  imagem.loading = 'lazy';

  const nome = document.createElement('h3');
  nome.textContent = pokemon.nome;

  const numero = document.createElement('small');
  numero.textContent =
    `#${String(pokemon.numero).padStart(3, '0')}`;

  abrir.append(imagem, nome, numero);
  abrir.appendChild(criarTipos(pokemon.tipos));

  abrir.addEventListener('click', () => {
    exibirPokemon(pokemon);
    mostrarMensagem(`${pokemon.nome} selecionado.`);
    resultado.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  });

  const favorito = document.createElement('button');
  favorito.type = 'button';
  favorito.className = 'botao-favorito';

  const jaSalvo = favoritos.some(
    (item) => item.numero === pokemon.numero
  );

  favorito.textContent = jaSalvo ? '★ Favorito' : '☆ Favoritar';

  favorito.addEventListener('click', () => {
    alternarFavorito(pokemon);
    renderizarCatalogo();
  });

  card.append(abrir, favorito);

  return card;
}

function renderizarCatalogo() {
  listaPokemons.replaceChildren();

  const tipoSelecionado = filtroTipo.value;

  const filtrados = tipoSelecionado
    ? catalogoAtual.filter(
        (pokemon) => pokemon.tipos.includes(tipoSelecionado)
      )
    : catalogoAtual;

  if (filtrados.length === 0) {
    const vazio = document.createElement('p');
    vazio.className = 'vazio';
    vazio.textContent =
      'Nenhum Pokémon deste tipo nesta página. Tente outra página ou filtro.';

    listaPokemons.appendChild(vazio);
    return;
  }

  filtrados.forEach((pokemon) => {
    listaPokemons.appendChild(criarCard(pokemon));
  });
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
    const card = criarCard(pokemon);
    listaFavoritos.appendChild(card);
  });
}

async function carregarCatalogo() {
  listaPokemons.replaceChildren();

  const carregando = document.createElement('p');
  carregando.className = 'vazio';
  carregando.textContent = 'Carregando Pokémon...';
  listaPokemons.appendChild(carregando);

  botaoAnterior.disabled = true;
  botaoProximo.disabled = true;
  contador.textContent = 'Carregando...';

  try {
    const resposta = await fetch(
      `/api/pokemons?limit=${LIMITE}&offset=${offsetAtual}`
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Erro ao carregar o catálogo.');
    }

    catalogoAtual = dados.resultados;
    totalPokemons = dados.total;

    const paginaAtual = Math.floor(offsetAtual / LIMITE) + 1;
    const totalPaginas = Math.ceil(totalPokemons / LIMITE);

    textoPagina.textContent =
      `Página ${paginaAtual} de ${totalPaginas}`;

    contador.textContent =
      `${totalPokemons.toLocaleString('pt-BR')} Pokémon disponíveis`;

    botaoAnterior.disabled = offsetAtual === 0;
    botaoProximo.disabled = offsetAtual + LIMITE >= totalPokemons;

    renderizarCatalogo();
  } catch (erro) {
    listaPokemons.replaceChildren();

    const aviso = document.createElement('p');
    aviso.className = 'vazio';
    aviso.textContent = erro.message;

    listaPokemons.appendChild(aviso);
    contador.textContent = 'Catálogo indisponível';
    mostrarMensagem('Não foi possível carregar o catálogo.', true);
  }
}

async function buscarPokemon() {
  const termo = campoPesquisa.value.trim().toLowerCase();

  if (!termo) {
    mostrarMensagem('Digite o nome ou número de um Pokémon.', true);
    campoPesquisa.focus();
    return;
  }

  botaoBuscar.disabled = true;
  botaoBuscar.textContent = 'Buscando...';

  try {
    const resposta = await fetch(
      `/api/pokemons/${encodeURIComponent(termo)}`
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Pokémon não encontrado.');
    }

    exibirPokemon(dados);
    mostrarMensagem('Pokémon encontrado com sucesso!');

    resultado.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    botaoBuscar.disabled = false;
    botaoBuscar.textContent = 'Pesquisar';
  }
}

botaoBuscar.addEventListener('click', buscarPokemon);

campoPesquisa.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    buscarPokemon();
  }
});

botaoFavoritar.addEventListener('click', () => {
  if (pokemonAtual) {
    alternarFavorito(pokemonAtual);
  }
});

botaoAnterior.addEventListener('click', () => {
  if (offsetAtual >= LIMITE) {
    offsetAtual -= LIMITE;
    carregarCatalogo();
  }
});

botaoProximo.addEventListener('click', () => {
  if (offsetAtual + LIMITE < totalPokemons) {
    offsetAtual += LIMITE;
    carregarCatalogo();
  }
});

filtroTipo.addEventListener('change', renderizarCatalogo);

renderizarFavoritos();
carregarCatalogo();
