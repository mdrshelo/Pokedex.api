
# Pokédex

Uma aplicação web para pesquisar Pokémon utilizando a PokéAPI, desenvolvida com TypeScript, Node.js, Express, HTML, CSS e JavaScript.

## Funcionalidades

- Pesquisa de Pokémon por nome ou número.
- Exibição do número, nome, tipos e imagem.
- Consulta à PokéAPI através de um servidor local.
- Cache em memória para pesquisas já realizadas.
- Tratamento de erros e tempo limite de requisição.
- Pokémon aleatório.
- Sistema de favoritos com armazenamento no navegador.
- Cores diferentes para os tipos de Pokémon.

## Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- HTML5
- CSS3
- JavaScript
- PokéAPI
- Vitest

## Como executar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o servidor:

   ```bash
   npm run dev
   ```

3. Acesse no navegador:

   http://localhost:3000

## Testes

Execute os testes automatizados:

```bash
npm test
```

Para verificar a compilação TypeScript:

```bash
npm run build
```

## Rota da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/pokemons/:termo` | Busca Pokémon por nome ou número |

## Respostas da API

A aplicação retorna:

- `200`: Pokémon encontrado.
- `400`: termo de pesquisa inválido.
- `404`: Pokémon não encontrado.
- `503`: serviço externo indisponível.
- `500`: erro interno do servidor.

## Estrutura do projeto

```text
pokedex/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── src/
│   ├── pokeApi.ts
│   ├── pokeApi.test.ts
│   └── server.ts
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Fonte dos dados

Os dados dos Pokémon são obtidos através da [PokéAPI](https://pokeapi.co/).
