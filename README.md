# Elementum

Atlas digital e interativo da tabela periódica, com informações científicas sobre os 118 elementos químicos, suas propriedades físicas e químicas e visualizações atômicas.

> **Status:** Etapa 2.2 concluída (convenções científicas, layout, schema e catálogo de dados). Ainda **não há elementos cadastrados**. A tabela interativa, as páginas completas dos elementos, a coleta dos dados e o visualizador atômico serão implementados nas próximas etapas.

## Visão geral

- Interface em português, com identidade visual dark.
- Uma página dedicada para cada elemento.
- Visualizador atômico interativo, com modelo didático de camadas eletrônicas (a implementar).
- Dados armazenados localmente em JSON, sem back-end.
- Referências científicas registradas nos dados e exibidas nas páginas.

As decisões científicas, as convenções do projeto e as decisões de interface estão em [docs/convencoes-cientificas.md](docs/convencoes-cientificas.md).

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
docs/
└── convencoes-cientificas.md   # convenções científicas e decisões de interface
src/
├── app/                # rotas e caminhos de navegação
├── components/
│   └── layout/         # estrutura global (cabeçalho, rodapé, layout)
├── data/
│   ├── elements/       # um JSON por família de elementos
│   ├── schema/         # schemas Zod: comum, referência, isótopo e elemento
│   ├── catalog.ts      # carrega, valida e consulta o catálogo
│   ├── derive.ts       # camadas e configurações derivadas das subcamadas
│   ├── families.ts     # famílias, marcadores e pertinência canônica
│   ├── layout.ts       # posição dos 118 elementos na tabela
│   └── references.json # registro global de referências
├── pages/              # páginas (tabela, elemento, 404)
├── styles/             # tokens de design e estilos base
└── test/               # configuração e fixtures sintéticas de teste
```

### Rotas

| Caminho             | Página                                      |
| ------------------- | ------------------------------------------- |
| `/`                 | Tabela periódica                            |
| `/elemento/:symbol` | Página de um elemento (ex.: `/elemento/Fe`) |
| `*`                 | Página não encontrada                       |

## Dados

### Famílias

Os elementos ficam em `src/data/elements/<familia>.json`, um arquivo por família. O **nome do arquivo é o id da família** (veja [src/data/families.ts](src/data/families.ts)):

`metais-alcalinos`, `metais-alcalino-terrosos`, `metais-do-bloco-d`, `metais-de-pos-transicao`, `semimetais`, `nao-metais`, `halogenios`, `gases-nobres`, `lantanideos`, `actinideos`.

Família química e posição na tabela são independentes. A posição (grupo, período, bloco, linha e coluna) fica **apenas** em [src/data/layout.ts](src/data/layout.ts), que adota o grupo 3 como Sc, Y, Lu e Lr e um bloco f de 14 colunas. Isso é uma **convenção do projeto**, não uma norma da IUPAC.

### Schema

O schema do elemento está em [src/data/schema/element.schema.ts](src/data/schema/element.schema.ts). Principais regras:

- **Estados de cada dado:** `valor`, `desconhecido` ou `nao-aplicavel`. Valores têm proveniência (`experimental`, `calculado` ou `estimado`), unidade padronizada, condições de medição e citações.
- **Rastreabilidade:** cada propriedade cita `{ ref, locator? }`, apontando para o registro global em [src/data/references.json](src/data/references.json).
- **Massa atômica** em três formas: valor, intervalo ou número de massa.
- **Configuração eletrônica** por subcamadas; camadas e strings são derivadas em [src/data/derive.ts](src/data/derive.ts).
- **Isótopos:** todos os naturais conhecidos (primordiais, de cadeias de decaimento e cosmogênicos), sem limite de quantidade; elementos sem isótopos naturais têm até três artificiais representativos. O de maior meia-vida confirmada sempre é incluído.
- **Classificação** `estabelecida` ou `predita`, com nota e citações obrigatórias para elementos de Z ≥ 99.
- Tier 1 (campos obrigatórios, com valor possivelmente desconhecido) e Tier 2 (opcional, só com dado confiável).

O catálogo é validado ao ser carregado: símbolo e número atômico precisam coincidir com o layout, a família com a pertinência canônica, e toda citação com uma referência registrada. Se algo estiver inconsistente, a aplicação e os testes falham com a lista de problemas. Para validar apenas os dados: `npm run validate:data`.

### Referências e licenças

A Wikipédia não pode ser citada. Dados de uma base científica só podem ser incorporados depois que a licença e as condições de atribuição forem verificadas e registradas na referência **e** a redistribuição for confirmada como permitida (`license.redistribution: permitida`). Fontes condicionais, com redistribuição não permitida ou não esclarecida podem ser citadas, mas não fornecem dados incorporados. Veja [docs/convencoes-cientificas.md](docs/convencoes-cientificas.md#8-licenças-e-atribuição-das-bases-científicas).

## Design

Os tokens visuais (cores, tipografia, espaçamento, raios, sombras e movimento) ficam em [src/styles/tokens.css](src/styles/tokens.css). Cada família tem um token de cor próprio (`--color-family-<id>`) e um marcador geométrico exclusivo, para que a cor não seja o único meio de identificação. Estilos de componentes devem usar apenas esses tokens.

## Roadmap

1. ✅ Fundação do projeto.
2. ✅ Convenções científicas, layout, schema e catálogo (Etapa 2.2). Ainda sem dados reais.
3. Verificação de licenças e coleta dos dados científicos dos 118 elementos, com referências.
4. Tabela periódica interativa.
5. Página completa de cada elemento.
6. Visualizador atômico (modelo didático de camadas eletrônicas).

## Licença

O código-fonte original do Elementum está sob a [Licença MIT](LICENSE), Copyright (c) 2026 shocklof.

Dados científicos de terceiros que venham a ser incorporados ao projeto podem ter licenças e condições próprias de uso, redistribuição e atribuição. A licença MIT **não** se aplica a eles, e a licença do código não substitui nem altera as condições de redistribuição das fontes científicas. Cada base é registrada, com sua licença verificada e a redistribuição confirmada como permitida, antes de qualquer incorporação (veja [docs/convencoes-cientificas.md](docs/convencoes-cientificas.md#8-licenças-e-atribuição-das-bases-científicas)). Até o momento, nenhum dado científico foi incorporado.
