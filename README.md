# Elementum

Atlas digital e interativo da tabela periódica, com informações científicas sobre os 118 elementos químicos, suas propriedades físicas e químicas e visualizações atômicas.

> **Status:** Etapa 1 concluída (fundação do projeto). A tabela interativa, as páginas dos elementos, os dados científicos e o visualizador atômico ainda serão implementados.

## Visão geral

- Interface em português, com identidade visual dark.
- Uma página dedicada para cada elemento.
- Visualizador atômico interativo, com modelo didático de camadas eletrônicas (a implementar).
- Dados armazenados localmente em JSON, sem back-end.
- Referências científicas registradas nos dados e exibidas nas páginas.

## Requisitos

- **Node.js 24.20.0** (versão registrada em [.nvmrc](.nvmrc); `engines` em [package.json](package.json) exige `>=24.20.0`).
- **npm** (acompanha o Node).

```bash
nvm use        # opcional: seleciona a versão do .nvmrc
npm install
```

## Scripts

| Comando                 | Descrição                                        |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Servidor de desenvolvimento (Vite)               |
| `npm run build`         | Checagem de tipos e build de produção em `dist/` |
| `npm run preview`       | Serve localmente o build de produção             |
| `npm run typecheck`     | Checagem de tipos (TypeScript)                   |
| `npm run lint`          | Análise estática (ESLint)                        |
| `npm run format`        | Formata o código (Prettier)                      |
| `npm run format:check`  | Verifica a formatação sem alterar arquivos       |
| `npm test`              | Executa os testes uma vez (Vitest)               |
| `npm run test:watch`    | Executa os testes em modo observação             |
| `npm run validate:data` | Executa apenas os testes da camada de dados      |

## Stack

- [React](https://react.dev) 19 + [TypeScript](https://www.typescriptlang.org) (modo estrito)
- [Vite](https://vite.dev) 8
- [React Router](https://reactrouter.com) 8
- [Zod](https://zod.dev) 4 para validação dos dados
- [Lucide React](https://lucide.dev) para ícones
- CSS moderno com variáveis (tokens de design próprios)
- [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com)
- ESLint + Prettier

## Estrutura do projeto

```
src/
├── app/               # rotas e caminhos de navegação
├── components/
│   └── layout/        # estrutura global (cabeçalho, rodapé, layout)
├── data/
│   ├── elements/      # um JSON por família de elementos
│   ├── schema/        # schema Zod e tipos centralizados
│   ├── catalog.ts     # carrega, valida e consulta o catálogo
│   └── families.ts    # famílias de elementos
├── pages/             # páginas (tabela, elemento, 404)
├── styles/            # tokens de design e estilos base
└── test/              # configuração e fixtures de teste
```

### Rotas

| Caminho             | Página                                      |
| ------------------- | ------------------------------------------- |
| `/`                 | Tabela periódica                            |
| `/elemento/:symbol` | Página de um elemento (ex.: `/elemento/Fe`) |
| `*`                 | Página não encontrada                       |

## Dados

Os elementos ficam em `src/data/elements/<familia>.json`, um arquivo por família. O **nome do arquivo é o id da família** (veja [src/data/families.ts](src/data/families.ts)):

`metais-alcalinos`, `metais-alcalino-terrosos`, `metais-de-transicao`, `metais-de-pos-transicao`, `semimetais`, `nao-metais`, `halogenios`, `gases-nobres`, `lantanideos`, `actinideos`.

Cada arquivo é um array de elementos que deve obedecer ao schema em [src/data/schema/element.schema.ts](src/data/schema/element.schema.ts). A validação garante, entre outras regras:

- número atômico entre 1 e 118, sem repetição de número ou símbolo;
- a família declarada no elemento coincide com a do arquivo;
- a soma dos elétrons por camada é igual ao número atômico;
- **todo dado científico cita ao menos uma referência**, e cada `sourceIds` aponta para uma referência declarada em `references` do próprio elemento;
- valores estimados (ex.: elementos superpesados) são marcados com `isEstimated`, e valores desconhecidos são `null`.

Os arquivos de família estão vazios (`[]`) nesta etapa. O catálogo é validado ao ser carregado; se um JSON estiver inconsistente, a aplicação e os testes falham com a lista de problemas. Para validar apenas os dados: `npm run validate:data`.

## Design

Os tokens visuais (cores, tipografia, espaçamento, raios, sombras e movimento) ficam em [src/styles/tokens.css](src/styles/tokens.css). Cada família de elementos tem um token de cor próprio (`--color-family-<id>`). Estilos de componentes devem usar apenas esses tokens.

## Roadmap

1. ✅ Fundação do projeto (esta etapa).
2. Cadastro dos dados científicos dos 118 elementos, com referências.
3. Tabela periódica interativa.
4. Página completa de cada elemento.
5. Visualizador atômico (modelo didático de camadas eletrônicas).
