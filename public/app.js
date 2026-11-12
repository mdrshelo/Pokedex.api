
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

const botaoVerDetalhes = document.getElementById('ver-detalhes');
const botaoFecharDetalhes = document.getElementById('fechar-detalhes');

const fichaCompleta = document.getElementById('ficha-completa');
const alturaPokemon = document.getElementById('altura');
const pesoPokemon = document.getElementById('peso');
const experienciaPokemon = document.getElementById('experiencia');
const habilidadesPokemon = document.getElementById('habilidades');
const atributosPokemon = document.getElementById('atributos');

const nomesAtributos = {
  hp: 'Vida',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defesa especial',
  speed: 'Velocidade'
};

async function carregarDetalhes() {
  if (!pokemonAtual) {
    mostrarMensagem('Selecione um Pokémon primeiro.', true);
    return;
  }

  const identificador = pokemonAtual.numero;

  botaoVerDetalhes.disabled = true;
  botaoVerDetalhes.textContent = 'Carregando ficha...';

  fichaCompleta.hidden = false;
  fichaCompleta.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  habilidadesPokemon.textContent = 'Carregando...';
  atributosPokemon.textContent = 'Carregando...';

  try {
    const resposta = await fetch(
      `/api/pokemons/${identificador}/detalhes`
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || 'Não foi possível carregar os detalhes.');
    }

    // Medidas da PokéAPI: altura em decímetros e peso em hectogramas.
    alturaPokemon.textContent = `${(dados.altura / 10).toFixed(1)} m`;
    pesoPokemon.textContent = `${(dados.peso / 10).toFixed(1)} kg`;

    experienciaPokemon.textContent =
      dados.experiencia ?? 'Não disponível';

    habilidadesPokemon.replaceChildren();

    dados.habilidades.forEach((habilidade) => {
      const etiqueta = document.createElement('span');
      etiqueta.className = 'habilidade';
      etiqueta.textContent = habilidade.replaceAll('-', ' ');
      habilidadesPokemon.appendChild(etiqueta);
    });

    atributosPokemon.replaceChildren();

    dados.atributos.forEach((atributo) => {
      const linha = document.createElement('div');
      linha.className = 'linha-atributo';

      const nome = document.createElement('span');
      nome.className = 'nome-atributo';
      nome.textContent =
        nomesAtributos[atributo.nome] || atributo.nome;

      const fundo = document.createElement('div');
      fundo.className = 'fundo-barra';

      const barra = document.createElement('div');
      barra.className = 'barra-atributo';

      const porcentagem = Math.min(
        (atributo.valor / 255) * 100,
        100
      );

      barra.style.width = `${porcentagem}%`;

      fundo.appendChild(barra);

      const valor = document.createElement('span');
      valor.className = 'valor-atributo';
      valor.textContent = atributo.valor;

      linha.append(nome, fundo, valor);
      atributosPokemon.appendChild(linha);
    });

    mostrarMensagem(`Ficha de ${dados.nome} carregada!`);
  } catch (erro) {
    fichaCompleta.hidden = true;
    mostrarMensagem(erro.message, true);
  } finally {
    botaoVerDetalhes.disabled = false;
    botaoVerDetalhes.textContent = 'Ver ficha completa';
  }
}

botaoVerDetalhes.addEventListener('click', carregarDetalhes);

botaoFecharDetalhes.addEventListener('click', () => {
  fichaCompleta.hidden = true;
});

const campoPokemonA = document.getElementById('pokemon-a');
const campoPokemonB = document.getElementById('pokemon-b');
const botaoComparar = document.getElementById('comparar');

const mensagemComparacao = document.getElementById('mensagem-comparacao');
const resultadoComparacao = document.getElementById('resultado-comparacao');
const barrasComparacao = document.getElementById('barras-comparacao');
const resumoComparacao = document.getElementById('resumo-comparacao');

const nomesComparacao = {
  hp: 'Vida',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defesa especial',
  speed: 'Velocidade'
};

async function obterPokemonComparacao(termo) {
  const resposta = await fetch(
    `/api/pokemons/${encodeURIComponent(termo)}/detalhes`
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || `Não foi possível encontrar ${termo}.`);
  }

  return dados;
}

function mostrarPokemonComparado(pokemon, sufixo) {
  document.getElementById(`imagem-${sufixo}`).src = pokemon.imagem || '';
  document.getElementById(`imagem-${sufixo}`).alt =
    `Imagem de ${pokemon.nome}`;

  document.getElementById(`nome-${sufixo}`).textContent = pokemon.nome;
  document.getElementById(`numero-${sufixo}`).textContent =
    `#${String(pokemon.numero).padStart(3, '0')}`;

  const areaTipos = document.getElementById(`tipos-${sufixo}`);
  areaTipos.replaceChildren(...criarTipos(pokemon.tipos).childNodes);
}

function obterAtributo(pokemon, nome) {
  return pokemon.atributos.find(
    (atributo) => atributo.nome === nome
  )?.valor ?? 0;
}

function criarLinhaComparacao(nome, valorA, valorB) {
  const linha = document.createElement('div');
  linha.className = 'linha-comparacao';

  const titulo = document.createElement('p');
  titulo.className = 'nome-comparacao';
  titulo.textContent = nomesComparacao[nome] || nome;

  const barras = document.createElement('div');
  barras.className = 'barras-duplas';

  const ladoA = document.createElement('div');
  ladoA.className = 'barra-lado primeiro';

  const numeroA = document.createElement('strong');
  numeroA.textContent = valorA;

  const fundoA = document.createElement('div');
  fundoA.className = 'fundo-barra';

  const barraA = document.createElement('div');
  barraA.className = 'barra-atributo';
  barraA.style.width = `${Math.min(valorA / 255 * 100, 100)}%`;

  fundoA.appendChild(barraA);
  ladoA.append(numeroA, fundoA);

  const ladoB = document.createElement('div');
  ladoB.className = 'barra-lado segundo';

  const fundoB = document.createElement('div');
  fundoB.className = 'fundo-barra';

  const barraB = document.createElement('div');
  barraB.className = 'barra-atributo';
  barraB.style.width = `${Math.min(valorB / 255 * 100, 100)}%`;

  fundoB.appendChild(barraB);

  const numeroB = document.createElement('strong');
  numeroB.textContent = valorB;

  ladoB.append(fundoB, numeroB);

  barras.append(ladoA, ladoB);
  linha.append(titulo, barras);

  return linha;
}

function calcularTotal(pokemon) {
  return pokemon.atributos.reduce(
    (total, atributo) => total + atributo.valor,
    0
  );
}

async function compararPokemons() {
  const termoA = campoPokemonA.value.trim().toLowerCase();
  const termoB = campoPokemonB.value.trim().toLowerCase();

  if (!termoA || !termoB) {
    mensagemComparacao.textContent =
      'Preencha os dois campos para comparar.';
    resultadoComparacao.hidden = true;
    return;
  }

  if (termoA === termoB) {
    mensagemComparacao.textContent =
      'Escolha dois Pokémon diferentes.';
    resultadoComparacao.hidden = true;
    return;
  }

  botaoComparar.disabled = true;
  botaoComparar.textContent = 'Comparando...';
  mensagemComparacao.textContent = 'Buscando informações...';
  resultadoComparacao.hidden = true;

  try {
    const [pokemonA, pokemonB] = await Promise.all([
      obterPokemonComparacao(termoA),
      obterPokemonComparacao(termoB)
    ]);

    mostrarPokemonComparado(pokemonA, 'a');
    mostrarPokemonComparado(pokemonB, 'b');

    barrasComparacao.replaceChildren();

    pokemonA.atributos.forEach((atributo) => {
      const valorA = atributo.valor;
      const valorB = obterAtributo(pokemonB, atributo.nome);

      barrasComparacao.appendChild(
        criarLinhaComparacao(atributo.nome, valorA, valorB)
      );
    });

    const totalA = calcularTotal(pokemonA);
    const totalB = calcularTotal(pokemonB);

    let vencedor;

    if (totalA > totalB) {
      vencedor = pokemonA.nome;
    } else if (totalB > totalA) {
      vencedor = pokemonB.nome;
    } else {
      vencedor = 'Empate';
    }

    resumoComparacao.textContent =
      `Total de atributos de ${pokemonA.nome}: ${totalA}. ` +
      `Total de atributos de ${pokemonB.nome}: ${totalB}. ` +
      `Maior total: ${vencedor}.`;

    resultadoComparacao.hidden = false;
    mensagemComparacao.textContent = 'Comparação concluída!';

    resultadoComparacao.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  } catch (erro) {
    mensagemComparacao.textContent = erro.message;
  } finally {
    botaoComparar.disabled = false;
    botaoComparar.textContent = 'Comparar Pokémon';
  }
}

botaoComparar.addEventListener('click', compararPokemons);

campoPokemonA.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') compararPokemons();
});

campoPokemonB.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') compararPokemons();
});

