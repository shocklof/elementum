# Convenções científicas do Elementum

Este documento registra as decisões científicas, as convenções do projeto e as decisões de interface do Elementum. Ele separa três naturezas de afirmação:

- **[CIÊNCIA]**: fato com fonte verificável. Indica o grau de verificação.
- **[CONVENÇÃO]**: escolha do Elementum. Não é norma científica e pode divergir de outras fontes.
- **[INTERFACE]**: decisão de apresentação.

Data da consolidação: 2026-11-04 (Etapa 2.1 aprovada; implementação na Etapa 2.2).

## 1. Princípios

1. **[CONVENÇÃO]** Todo dado científico cita ao menos uma referência do registro global (`src/data/references.json`), com o local exato na fonte quando possível. Nos dados estruturados com valor, a citação tem papel explícito (`origem` ou `apoio`) e ao menos uma é `origem` incorporável (seção 6).
2. **[CONVENÇÃO]** A Wikipédia e outros projetos Wikimedia não podem ser citados como referência. O schema rejeita esses endereços.
3. **[CONVENÇÃO]** Dados desconhecidos e não aplicáveis são sempre explicitados (`desconhecido`, `nao-aplicavel`). Nunca se usa `null` nem um valor inventado.
4. **[CONVENÇÃO]** Nenhum dado de uma base científica é incorporado enquanto sua licença e as condições de atribuição não forem verificadas e registradas **e** a redistribuição não for confirmada como permitida (ver seção 8). A licença do código (MIT) é independente das licenças dos dados.
5. **[CONVENÇÃO]** Família química e posição na tabela são independentes (seções 2 e 3).
6. **[CONVENÇÃO]** Consultar e citar uma fonte não implica poder redistribuir seus dados. Ausência de autorização encontrada não equivale a proibição expressa, mas também não autoriza a incorporação (seção 8).

## 2. Classificação química (famílias)

### Fatos

- **[CIÊNCIA]** **Definições apresentadas pelo Red Book 2005 (seção IR-3.5):** os grupos são numerados de 1 a 18; os elementos dos grupos 1, 2 e 13–18 (exceto o hidrogênio) são "elementos do grupo principal"; os elementos dos grupos 3–12 são os elementos do bloco d; e os seguintes nomes coletivos são "aprovados pela IUPAC": metais alcalinos (Li–Fr), alcalino-terrosos (Be–Ra), pnictogênios, calcogênios, halogênios, gases nobres (He–Rn, sem o Og, porque a publicação é de 2005), lantanoides (La–Lu), metais terras raras (Sc, Y e os lantanoides) e actinoides (Ac–Lr). _Verificação: lido diretamente no PDF da IUPAC._
- **[CIÊNCIA]** **Convenções e agrupamentos apenas mencionados pelo Red Book:** os elementos do bloco d "também são comumente chamados" de elementos de transição, "embora os elementos do grupo 12 nem sempre sejam incluídos"; os elementos do bloco f "às vezes" são chamados de elementos de transição interna; o lantânio é incluído entre os lantanoides por uso comum; e os grupos podem, se apropriado, ser nomeados pelo primeiro elemento (por exemplo, o grupo do boro). _Verificação: lido diretamente._
- **[CIÊNCIA]** **Conceitos que o Red Book não define:** "metaloides", "metais de pós-transição" e "não metais" como categorias de elementos. Na busca no texto completo, "metaloide" e "pós-transição" não aparecem; "não metal" e "não metálico" aparecem apenas de passagem (em um trecho histórico sobre nomenclatura e em uma frase sobre números de oxidação) e "semimetais", só em uma referência bibliográfica. Isso **não significa** que a IUPAC não reconheça esses conceitos em outras publicações: o Gold Book, por exemplo, não foi lido (verificação pendente).
- **[CIÊNCIA]** Segundo fonte secundária, o Gold Book afirma que o grupo 12 não satisfaz sua definição de elemento de transição. _Verificação: fonte secundária; leitura direta do Gold Book pendente._
- **[CIÊNCIA]** Os seis elementos mais citados como metaloides são B, Si, Ge, As, Sb e Te (Vernon, 2013, _J. Chem. Educ._ 90, 1703; resumos lidos, artigo não lido).

### Convenções adotadas

As dez famílias e seus membros estão em `src/data/families.ts` (`FAMILY_MEMBERS`). A soma é 118.

| Família (id)                                          | n   | Elementos                            | Critério                 |
| ----------------------------------------------------- | --- | ------------------------------------ | ------------------------ |
| Metais alcalinos (`metais-alcalinos`)                 | 6   | Li Na K Rb Cs Fr                     | IUPAC                    |
| Metais alcalino-terrosos (`metais-alcalino-terrosos`) | 6   | Be Mg Ca Sr Ba Ra                    | IUPAC                    |
| Metais do bloco d (`metais-do-bloco-d`)               | 38  | Sc Y; Ti–Zn; Zr–Cd; Hf–Hg; Rf–Cn     | Convenção (posicional)   |
| Metais de pós-transição (`metais-de-pos-transicao`)   | 12  | Al Ga In Sn Tl Pb Bi Po; Nh Fl Mc Lv | Convenção                |
| Semimetais (metaloides) (`semimetais`)                | 6   | B Si Ge As Sb Te                     | Convenção (Vernon, 2013) |
| Não metais (`nao-metais`)                             | 7   | H C N O P S Se                       | Convenção                |
| Halogênios (`halogenios`)                             | 6   | F Cl Br I At Ts                      | IUPAC                    |
| Gases nobres (`gases-nobres`)                         | 7   | He Ne Ar Kr Xe Rn Og                 | IUPAC                    |
| Lantanídeos (`lantanideos`)                           | 15  | La–Lu                                | IUPAC                    |
| Actinídeos (`actinideos`)                             | 15  | Ac–Lr                                | IUPAC                    |

Decisões relacionadas:

- **[CONVENÇÃO] "Metais do bloco d"** inclui Zn, Cd e Hg. O rótulo é posicional e evita a controvérsia sobre o grupo 12. Ele **não** inclui Lu e Lr: embora ocupem o grupo 3 (bloco d), pertencem às famílias de lantanídeos e actinídeos, conforme os nomes coletivos IUPAC (La–Lu e Ac–Lr). A legenda da interface deve registrar essa exceção.
- **[CONVENÇÃO]** O hidrogênio fica na posição do grupo 1, mas na família "não metais" (não é metal alcalino). O astato é halogênio (grupo 17). O polônio é metal de pós-transição.
- **[CONVENÇÃO]** "Semimetais (metaloides)": em física, "semimetal" também designa materiais de outro tipo (ex.: As, Sb e Bi como semimetais de estrutura de bandas). O rótulo duplo evita a ambiguidade.
- **[CONVENÇÃO]** Pnictogênios e calcogênios têm nome IUPAC, mas não são famílias do projeto.

### Origem do critério (`basis`)

Cada família declara em `families.ts` se o critério é `iupac` ou `convencao`. Os elementos herdam essa informação da família.

### Classificação dos elementos superpesados

- **[CONVENÇÃO]** Os elementos superpesados permanecem na família correspondente ao seu grupo. Cada elemento carrega `classification.status`:
  - `estabelecida`: a pertinência à família é sustentada por definição IUPAC ou por caracterização química experimental;
  - `predita`: baseada na posição na tabela ou em cálculos, sem confirmação experimental.
- **[CONVENÇÃO]** Todos os elementos com **Z ≥ 99** têm a classificação revisada individualmente. O schema **exige** `classification.note` (evidência e justificativa) e `classification.citations` para eles. Nada presume que todos sejam preditos: tanto `estabelecida` quanto `predita` são aceitas, desde que documentadas.
- **[CONVENÇÃO]** Qualquer elemento `predita` exige nota, mesmo com Z < 99.
- **Pendente:** a revisão individual dos elementos de Z ≥ 99 ainda não foi feita. Ela faz parte da coleta de dados e usa fontes primárias.

## 3. Posicionamento na tabela

Todas as posições ficam em `src/data/layout.ts`, a única fonte de grupo, período, bloco, linha e coluna. Os JSON de elementos **não** repetem esses campos.

```
      1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18
 1    H                                                  He
 2   Li Be                               B  C  N  O  F  Ne
 3   Na Mg                               Al Si P  S  Cl Ar
 4    K Ca Sc Ti  V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr
 5   Rb Sr  Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te  I Xe
 6   Cs Ba Lu Hf Ta  W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn
 7   Fr Ra Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og
 8         La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb
 9         Ac Th Pa  U Np Pu Am Cm Bk Cf Es Fm Md No
```

- **[CONVENÇÃO] O grupo 3 é composto por Sc, Y, Lu e Lr.** Esta é uma convenção do projeto. O bloco f tem 14 colunas (La–Yb e Ac–No), nas linhas 8 e 9, colunas 3–16, e os elementos do bloco f não têm número de grupo.
- **[CIÊNCIA]** A IUPAC discute duas composições para o grupo 3 (Sc-Y-Lu-Lr e Sc-Y-La-Ac); em sua página do Periodic Table ela não declara decisão final. O relatório de Fluck (1988, _Pure Appl. Chem._ 60, 431) e o relatório provisório de Scerri (2021, _Chemistry International_ 43(1), 31–34) favorecem Sc-Y-Lu-Lr; Scerri descreve a escolha como questão de convenção. _Verificação: a página da IUPAC foi lida; os dois relatórios, só por resumos e fontes secundárias._
- **[CIÊNCIA]** Argumentos citados a favor de Lu/Lr: mantém a ordem do número atômico, não divide o bloco d e dá ao bloco f 14 elementos (a capacidade do subnível f). _Verificação: fonte secundária._
- **Trocar a convenção** afeta apenas La, Ac, Lu e Lr no `layout.ts` (e nos testes de contagem de blocos), porque família, grupo e posição são campos independentes.
- **[CIÊNCIA]** Contagens que os testes verificam: períodos 2, 8, 8, 18, 18, 32 e 32; blocos s=14, p=36, d=40 e f=28; 118 posições distintas, nenhuma omitida ou duplicada.
- **[INTERFACE]** O espaço visual entre o corpo principal (linhas 1–7) e as séries f (linhas 8–9) é feito em CSS, sem linha vazia no dado.

## 4. Modelo de dados

```
src/data/
├── layout.ts                  # posições dos 118 elementos
├── families.ts                # famílias, marcadores, pertinência canônica
├── derive.ts                  # camadas e configurações derivadas de subshells
├── references.json            # registro global de referências
├── schema/
│   ├── common.ts              # proveniência, estados, citações, unidades
│   ├── reference.schema.ts
│   ├── isotope.schema.ts
│   └── element.schema.ts
├── elements/<familia>.json    # um arquivo por família; isótopos dentro de cada elemento
└── catalog.ts                 # valida e cruza elementos, layout e referências
```

### Estados de um dado

Toda propriedade do Tier 1 tem um destes estados (campo `status`):

| Estado          | Significado                                                           | Campos                                                                             |
| --------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `valor`         | Valor conhecido.                                                      | `value`, `unit`, `provenance`, `citations` (mín. 1), `uncertainty?`, `conditions?` |
| `desconhecido`  | Nunca determinado, ou sem dado confiável.                             | `reason?`, `citations?`                                                            |
| `nao-aplicavel` | A grandeza não existe ou não se define (ex.: fusão do hélio a 1 atm). | `reason` (obrigatório), `citations?`                                               |

**Proveniência** (`provenance`): `experimental` (medido), `calculado` (cálculo teórico) ou `estimado` (extrapolação, sistemática ou tendência).

### Unidades padronizadas

Os valores são sempre armazenados nestas unidades. A conversão para exibição é responsabilidade da interface.

| Grandeza                        | Unidade        |
| ------------------------------- | -------------- |
| Temperatura                     | `K`            |
| Densidade                       | `g/cm³`        |
| Raios                           | `pm`           |
| Energias (ionização, afinidade) | `eV`           |
| Massa atômica                   | `u`            |
| Tempo (meia-vida)               | `s`            |
| Eletronegatividade (Pauling)    | `adimensional` |
| Abundância isotópica            | `fracao` (0–1) |

### Condições de medição

- **[CIÊNCIA]** **100 kPa (10⁵ Pa = 1 bar)** é a pressão padrão p° recomendada pela IUPAC (_Green Book_, 3ª ed.). _Verificação: passagem lida no PDF da IUPAC._
- **[CONVENÇÃO]** **298,15 K é uma convenção de referência do Elementum, não uma temperatura padrão universal da IUPAC.** No _Green Book_ (3ª ed.), o estado padrão é definido à pressão padrão p°, sem fixar uma temperatura (as tabelas usam a "temperatura escolhida"); 298,15 K é a temperatura usual das tabelas termoquímicas. Não confundir com as "condições padrão para gases" (273,15 K e 100 kPa), que o projeto não usa.
- Estado físico e densidade usam, como referência, **298,15 K e 100 kPa** (`REFERENCE_CONDITIONS`). O campo `phase.conditions` é obrigatório; propriedades como densidade e pontos de fusão e ebulição aceitam `conditions` opcional. Quando um valor depender de condições específicas (temperatura, pressão), elas são registradas em `conditions`.

### Massa atômica

Três formas, como o CIAAW e a IUPAC as apresentam:

- `valor`: valor padrão com incerteza;
- `intervalo`: composição isotópica variável; `lower`, `upper` e valor abreviado;
- `numero-de-massa`: sem valor padrão; número de massa do nuclídeo de maior meia-vida confirmada (exibido entre colchetes). O isótopo correspondente precisa constar em `isotopes`.

**[CIÊNCIA]** Em 2024, o CIAAW lista intervalo para 14 elementos (H, Li, B, C, N, O, Mg, Si, S, Cl, Ar, Br, Tl e Pb) e nenhum valor padrão para 34 (Tc, Pm, Po–Ac e Np–Og); Th, Pa e U têm valor. A IUPAC indica o número de massa entre colchetes para os elementos sem valor. _Verificação: CIAAW e IUPAC lidos diretamente._

### Configuração eletrônica

- O estado fundamental é guardado como **subcamadas** (`{ n, l, electrons }`). Camadas (K, L, M…), configuração completa e condensada são **derivadas** em `derive.ts`.
- **[CONVENÇÃO]** As subcamadas são exibidas na ordem de Madelung (n + l crescente; empate por n): `[Ar] 4s² 3d⁶`.
- O schema confere: soma dos elétrons igual a Z, capacidade de cada subcamada (s=2, p=6, d=10, f=14), subcamada existente (l < n) e ausência de repetição.

### Propriedades

- **Tier 1** (campo obrigatório nos 118; o valor pode ser `desconhecido` ou `nao-aplicavel`): nomes (pt e en), classificação, massa atômica, configuração eletrônica, estado físico, densidade, pontos de fusão e ebulição, eletronegatividade de Pauling, raio covalente, raio de van der Waals, primeira energia de ionização, afinidade eletrônica, estados de oxidação, aparência, descoberta, etimologia, resumo, usos e isótopos.
- **Tier 2** (opcional, apenas com dado confiável; campo `tier2`): estrutura cristalina, condutividade térmica (`W/(m·K)`), calor específico (`J/(g·K)`), calores de fusão e vaporização (`kJ/mol`) e abundância na crosta (`mg/kg`). As unidades do Tier 2 foram fixadas na Etapa 2.2 e podem ser revistas.
- **Raios:** raio covalente e raio de van der Waals são propriedades separadas. **[CIÊNCIA]** Cordero et al. (2008) cobre raios covalentes só até Z=96; os demais ficam `desconhecido`. _Verificação: resumo lido._ O **raio de van der Waals continua Tier 1**, mas pode ser `desconhecido`. **[CONVENÇÃO]** Conjuntos de raios de fontes diferentes têm métodos e escalas incompatíveis (compilados, calculados ou derivados de estruturas cristalinas) e **não se misturam num mesmo campo** (por exemplo, os de Bondi, Mantina e Alvarez); valores ausentes não são preenchidos por interpolação sem justificativa científica documentada. A fonte do raio de van der Waals ainda não foi definida. Os valores de Alvarez (2013), CC BY-NC 3.0, **não serão incorporados**, porque a restrição não comercial conflita com a política de dados (seção 8).
- **Estados de oxidação:** vão de −5 a +9, cada um com `prevalence` (`comum`, `raro` ou `condicoes-extremas`). **[CIÊNCIA]** O estado +9 é conhecido só para o cátion [IrO₄]⁺ em fase gasosa (Wang et al., _Nature_ 2014), sem sal isolado; por isso é `condicoes-extremas`. Os limites do schema são faixas de sanidade; cada valor precisa de evidência.

## 5. Isótopos

Cada elemento tem a lista `isotopes` (mínimo 1). A quantidade depende da regra de seleção abaixo: **não há limite para isótopos naturais**, e elementos **sem** isótopos naturais conhecidos têm **no máximo três** isótopos artificiais representativos.

**Regra de seleção [CONVENÇÃO]:**

1. **Elementos com isótopos naturais conhecidos:** incluir todos os isótopos naturais conhecidos, considerando os **primordiais**, os provenientes de **cadeias naturais de decaimento** e os **cosmogênicos** (`origin`: `primordial`, `cadeia-de-decaimento`, `cosmogenico`). **Não há limite artificial** para a quantidade; ela resulta da coleta e da validação científica.
2. **Elementos sem isótopos naturais conhecidos:** incluir **até três** isótopos artificiais representativos (`origin: artificial`, `selection: representativo`), priorizando os de maior meia-vida confirmada. O limite conta cada entrada de `isotopes`, inclusive isômeros.
3. **Sempre incluir o isótopo de maior meia-vida confirmada.** Ele define o número de massa entre colchetes dos elementos sem massa atômica padrão.

**O que o schema valida** (em `element.schema.ts`):

- sem isótopos naturais: no máximo 3 isótopos artificiais (`MAX_REPRESENTATIVE_ARTIFICIAL_ISOTOPES`);
- com isótopos naturais: nenhum limite para os naturais. O único artificial admitido é o de maior meia-vida confirmada, quando este não for natural, marcado como `selection: maior-meia-vida`. Isótopo `representativo` é reservado a elementos sem naturais;
- quando a massa atômica é `numero-de-massa`, o isótopo correspondente precisa constar em `isotopes`.

A escolha do isótopo de maior meia-vida confirmada em si (qual é ele) é conferida na coleta de dados, com a fonte avaliada; o schema não compara meias-vidas entre isótopos.

**Cada isótopo registra:** número de massa, isômero (se houver), origem, motivo da inclusão (`selection`), massa atômica, meia-vida (valor em segundos, `estavel` ou `desconhecido`), abundância natural (só para naturais, fração 0–1), modos de decaimento com ramificação, spin-paridade e citações.

**Fontes:**

- **[CIÊNCIA]** NUBASE2020 (Kondev et al., _Chin. Phys. C_ 45, 030001, 2021) traz 3.340 estados fundamentais e 1.938 isômeros com meia-vida ≥ 100 ns, e marca valores obtidos por sistemática. Até onde foi possível verificar, é a edição publicada mais recente; uma próxima edição aparece em apresentações como plano, sem anúncio oficial encontrado. _Verificação: resumo e metadados lidos._
- ENSDF/IAEA (mantido pelo NNDC, distribuído também pela IAEA, com atualização mensal) para atualização e verificação. _Verificação: a licença e o formato de citação ainda não foram confirmados._
- **[CIÊNCIA]** Estimativa de tamanho: 286 nuclídeos primordiais (fontes divergem na divisão entre estáveis e radioativos), cerca de 44 em cadeias de decaimento e alguns cosmogênicos, num total de aproximadamente 339 a 350 nuclídeos naturais. _Verificação: apenas fontes secundárias; contagens não confirmadas._
- Abundâncias isotópicas e pesos atômicos: IUPAC/CIAAW (Meija et al. 2016, _Pure Appl. Chem._ 88, 293; CIAAW, tabela de 2024).

Cada citação registra edição e data de acesso (campos `edition` e `retrievedAt` da referência).

## 6. Referências

O registro global fica em `src/data/references.json`. Cada referência tem:

| Campo                                                         | Descrição                                                                           |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `id`                                                          | Identificador em kebab-case, usado nas citações.                                    |
| `kind`                                                        | Base de dados, artigo, livro, norma IUPAC, relatório técnico ou site institucional. |
| `title`, `authors`, `publisher`, `year`, `doi`, `isbn`, `url` | Identificação da fonte.                                                             |
| `edition`, `retrievedAt`                                      | Edição consultada e data da consulta (obrigatória para bases e sites).              |
| `tier`                                                        | `primaria`, `compilacao` ou `secundaria`.                                           |
| `usage`                                                       | `dados-incorporados` ou `apenas-citacao`.                                           |
| `license`                                                     | Licença consultada, redistribuição e restrições (seção 8).                          |

Cada dado cita `{ ref, role?, locator? }`, com o local exato (tabela, página, entrada). O catálogo valida que toda citação aponta para uma referência registrada, avisa sobre referências registradas e nunca citadas e aplica a elegibilidade bibliográfica descrita abaixo.

### Papéis das citações e elegibilidade bibliográfica

**[CONVENÇÃO]** O campo `role` de uma citação é opcional no schema (compatibilidade), mas o catálogo o exige nos dados estruturados com valor. Há dois papéis:

| Papel    | Significado                                                                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `origem` | A fonte de onde o dado estruturado foi tomado. **Só referências `usage: dados-incorporados` podem ser origem.**                                                            |
| `apoio`  | Fonte que corrobora, verifica ou fundamenta, sem ser a origem do dado (por exemplo, uma verificação cruzada). Aceita referências `dados-incorporados` ou `apenas-citacao`. |

O critério de elegibilidade é `reference.usage`, e não `license.redistribution`. As regras de licenciamento continuam validadas no schema de referências (uma referência `dados-incorporados` exige licença verificada e redistribuição permitida) e **não são repetidas** na validação das citações.

**Regras por categoria:**

| Categoria (caminhos)                                                                                                                                                                                                                                                                                                                                                                                  | Papel                     | Regras                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dado estruturado com valor:** `atomicMass`; `electronConfiguration`, `phase`, `physical.*`, `chemical.*` (inclui `oxidationStates`) e `tier2.*` no estado `valor`; no isótopo, `atomicMass`, `halfLife` (`valor` ou `estavel`) e `abundance`; as citações do próprio isótopo (cobrem `massNumber`, `isomer`, `origin`, `selection`, `decayModes` e `spinParity`); `discovery` (ano e descobridores) | Explícito em toda citação | Ao menos uma `origem`; toda `origem` é `dados-incorporados`; `apoio` livre; múltiplas origens permitidas; bloco só de `apoio` é rejeitado; citação sem papel é rejeitada |
| **Estado `desconhecido` ou `nao-aplicavel`**                                                                                                                                                                                                                                                                                                                                                          | Opcional                  | Citações opcionais, como justificativa; podem ser `apenas-citacao`; `origem` não se aplica (não há valor incorporado); aceita `apoio` ou nenhum papel                    |
| **Conteúdo autoral:** `appearance`, `etymology`, `summary`, `uses[]` e `classification`                                                                                                                                                                                                                                                                                                               | Não exigido               | Qualquer `usage`; se houver papel, só `apoio`; nunca `origem`                                                                                                            |
| `names`, `symbol`, `atomicNumber`, `family` e layout                                                                                                                                                                                                                                                                                                                                                  | Sem citações              | Regras inalteradas                                                                                                                                                       |

**Origem de dados × fundamentação autoral.** Uma _origem_ é a fonte de onde um valor estruturado é tomado para o JSON; por isso exige uma fonte incorporável. A _fundamentação autoral_ é a base bibliográfica de um texto ou de um juízo escrito pelo projeto (descrição, etimologia, classificação); pode citar uma fonte `apenas-citacao`, e isso não autoriza copiar texto nem tabelas dessa fonte. A elegibilidade bibliográfica verifica o enquadramento da fonte; **não** mede a validade científica do conteúdo nem a autoria.

**Como a validação funciona.** Ela roda em `buildCatalog`, depois da checagem de existência das referências. O percurso (`src/data/citation-eligibility.ts`) preserva o caminho completo de cada bloco de citações, e a tabela `CITATION_PATH_CATEGORIES` classifica cada caminho como dado, estado (valor ou justificativa) ou conteúdo autoral. As mensagens de erro trazem o elemento, o caminho, a referência, o papel e o `usage` encontrado. **Falha segura:** um caminho com `citations` que não esteja na tabela é um erro, nunca é presumido como conteúdo autoral. Testes comparam a tabela, nos dois sentidos, com os caminhos `citations` do próprio schema e de um elemento sintético completo, de modo que um campo novo com citações não escapa da validação.

**Limitações (fatos sobre a validação atual):**

- **Textos livres e notas.** Não há detecção de números ou afirmações factuais dentro de textos autorais nem de campos `note` sem citações próprias (por exemplo, notas de estados de oxidação, de decaimento e de condições, e a nota da classificação). Dados ou afirmações reproduzidos de uma fonte em texto ou nota continuam sujeitos à **política editorial** e à atribuição adequada; não há heurística automática.
- **Proveniência transitiva.** A validação não verifica se uma fonte incorporável compilou dados de outra com licença diferente. É uma questão editorial e jurídica, fora do alcance do código.
- **Intenção declarada.** `role: origem` declara que o valor veio daquela fonte; a validação não confere isso. A responsabilidade editorial por reproduzir apenas dados rastreáveis, sem copiar tabelas inteiras, permanece com o mantenedor.
- **Onde roda.** A regra é aplicada no catálogo. O `elementSchema` usado isoladamente (fora de `buildCatalog`) não a aplica.
- **`locator`.** Continua texto livre.

## 7. Decisões de interface (a implementar nas próximas etapas)

- **[INTERFACE]** As dez cores das famílias são mantidas (`src/styles/tokens.css`). Análise: o contraste de cada cor contra a superfície escura é de 6,1:1 a 11,2:1; na simulação de daltonismo (matrizes de Machado et al., 2009, usadas de memória, resultado indicativo), alguns pares ficam quase indistinguíveis. Por isso a cor não é o único meio de informação (WCAG 1.4.1).
- **[INTERFACE] Marcadores geométricos** exclusivos por família (`marker` em `families.ts`): círculo (alcalinos), quadrado (alcalino-terrosos), losango (bloco d), triângulo (pós-transição), hexágono (semimetais), cruz (não metais), triângulo invertido (halogênios), estrela (gases nobres), semicírculo (lantanídeos) e barra (actinídeos). Os formatos finais serão validados visualmente.
- **[INTERFACE]** Legenda clicável e filtros por família; famílias não selecionadas ficam esmaecidas (`--opacity-dimmed`).
- **[INTERFACE]** Classificação `predita`: borda tracejada, hachura suave e "?" no canto com texto alternativo (`--border-predicted-style`, `--hatch-predicted`).
- **[INTERFACE]** Valores `calculado` ou `estimado` aparecem com prefixo "~" e selo textual. Valores `desconhecido` aparecem como "—" com o selo "Desconhecido" (`--color-unknown`); `nao-aplicavel` aparece como "Não se aplica" com o motivo.
- **[INTERFACE]** Responsividade: tabela completa no desktop (≥ 1200 px), grade reduzida em larguras médias, e lista por família no celular (< 600 px), com opção de ver a tabela completa. Base: WCAG 2.2, critérios 1.4.1, 1.4.11 e 2.5.8 (alvos de 24×24 px), verificados no site do W3C.

## 8. Licenças e atribuição das bases científicas

### Licença do código × licenças dos dados

**[CONVENÇÃO]** O código-fonte original do Elementum está sob a licença MIT (arquivo `LICENSE`). A MIT **não** se aplica aos dados científicos de terceiros: cada fonte mantém suas próprias condições de uso, redistribuição e atribuição, e a licença do código não as substitui nem as altera.

### Licença consultada × redistribuição permitida

**[CONVENÇÃO]** Consultar a licença de uma fonte não autoriza a redistribuição de seus dados. São dois registros distintos em `license`:

- `status`: se os termos foram consultados e registrados (`verificada`, `pendente` ou `nao-aplicavel`);
- `redistribution`: se a redistribuição dos dados em JSON é permitida.

Uma licença pode estar `verificada` e, ainda assim, não permitir a redistribuição (por exemplo, "todos os direitos reservados").

**Estados de `redistribution`:**

| Estado            | Significado                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `permitida`       | A redistribuição dos dados em JSON é permitida, sem restrições além da atribuição.                                                                           |
| `condicional`     | Permitida apenas sob as restrições registradas em `restrictions` (ou descritas em `note`).                                                                   |
| `nao-permitida`   | Proibida de forma expressa pelos termos da fonte.                                                                                                            |
| `nao-esclarecida` | Nenhuma autorização foi encontrada, mas também não há proibição expressa. **Ausência de autorização não é proibição**, e também não autoriza a incorporação. |

**Restrições (`restrictions`):**

| Restrição                | Significado                                             |
| ------------------------ | ------------------------------------------------------- |
| `nao-comercial`          | Proíbe uso comercial (ex.: CC BY-NC).                   |
| `sem-derivados`          | Proíbe obras derivadas (ex.: CC BY-ND).                 |
| `compartilhamento-igual` | Derivados devem manter a mesma licença (ex.: CC BY-SA). |
| `uso-educacional`        | Uso livre apenas para fins educacionais.                |
| `contato-comercial`      | Uso comercial exige contato com o titular dos direitos. |

A atribuição exigida pela fonte (`attribution`) não é uma restrição: continua obrigatória mesmo quando a redistribuição é `permitida`.

### Regra de bloqueio

O schema impõe as regras abaixo (`src/data/schema/reference.schema.ts`):

- Uma referência com `usage: dados-incorporados` só é aceita com `license.status: verificada` (que exige `name`, `termsUrl`, `attribution` e `checkedAt`) **e** `license.redistribution: permitida`.
- `condicional`, `nao-permitida`, `nao-esclarecida` e a ausência do campo são **rejeitados** para dados incorporados. Uma fonte condicional pode continuar registrada e ser citada (`usage: apenas-citacao`), mas não fornece dados incorporados sem uma **decisão específica documentada**; o schema não abre exceção automática.
- Referências `apenas-citacao` não exigem verificação de licença e são aceitas em qualquer estado de redistribuição.
- Coerência da licença: `permitida` não admite restrições (com restrições, use `condicional`); `condicional` exige ao menos uma restrição ou uma nota explicando a condição; as restrições não se repetem.

### Conceitos: licença consultada, permissão de redistribuição e condições de uso

**[CONVENÇÃO]** São três coisas distintas, registradas em campos distintos de `license`:

| Conceito                        | Pergunta que responde                                                    | Campos                                                                                | Exemplo                                                           |
| ------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Licença consultada**          | Os termos da fonte foram lidos e registrados?                            | `status` (`verificada`, `pendente`, `nao-aplicavel`), `name`, `termsUrl`, `checkedAt` | Termos lidos no site oficial, com a data da leitura.              |
| **Permissão de redistribuição** | Os dados podem ser redistribuídos no JSON público do projeto?            | `redistribution`                                                                      | `permitida`, `condicional`, `nao-permitida` ou `nao-esclarecida`. |
| **Condições de uso**            | Sob quais condições (restrições e atribuição) os dados podem ser usados? | `restrictions`, `attribution`, `note`                                                 | Uso educacional; atribuição a autores, título, periódico e DOI.   |

### Política padrão de dados

**[CONVENÇÃO]** Decisões aprovadas, que valem para qualquer fonte:

- Uma fonte pode ser consultada e citada sem que seus dados possam ser redistribuídos.
- Dados incorporados exigem autorização explícita, ou claramente documentada, de redistribuição (`redistribution: permitida`).
- Licenças com restrição não comercial, sem derivados ou de compartilhamento pela mesma licença (NC, ND e SA) não entram na política padrão de dados. Fontes com `nao-comercial`, `sem-derivados` ou `compartilhamento-igual` são, no máximo, `condicional` e não são incorporadas sem uma decisão específica documentada.
- Ausência de autorização não equivale a proibição expressa: a fonte fica `nao-esclarecida`, pode ser consultada e citada, mas não é incorporada até esclarecimento formal.
- Não se copiam tabelas inteiras sem direitos claros. Quando a incorporação for permitida, preferem-se valores individuais rastreáveis, com `locator` (tabela, página ou entrada).

### Matriz das fontes auditadas

Resultado da auditoria independente da Etapa 2.3B.1 (2026-11-05). Coluna **Ev.** (evidência): **L** = lido diretamente na fonte oficial ou na publicação; **E** = trecho indexado, porque a leitura direta foi bloqueada (HTTP 403 ou desafio anti-robô); **N** = licença não verificada.

| Fonte (obra)                                                                                           | Termos consultados                                                                                                                                                                       | `redistribution`  | `restrictions`                                    | Situação no projeto                                                              | Ev. |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------- | -------------------------------------------------------------------------------- | --- |
| **NUBASE2020**, artigo (Kondev et al., _Chin. Phys. C_ 45, 030001, 2021; doi:10.1088/1674-1137/abddae) | CC BY 3.0, na página da editora (IOPscience). A cópia do PDF hospedada pela IAEA não traz a frase de licença.                                                                            | `permitida`       | nenhuma                                           | **Elegível** para incorporação, com atribuição                                   | L   |
| **AME2020 (II)**, artigo (Wang et al., _Chin. Phys. C_ 45, 030003, 2021; doi:10.1088/1674-1137/abddaf) | CC BY 3.0, na primeira página do PDF e na página da editora.                                                                                                                             | `permitida`       | nenhuma                                           | **Elegível** para incorporação, com atribuição                                   | L   |
| **Arquivos ASCII do AMDC** (NUBASE2020 e tabelas AME2020)                                              | A página do AMDC não declara licença e pede que se citem "os artigos originais", não os arquivos.                                                                                        | `nao-esclarecida` | nenhuma                                           | Consulta e citação; **aguarda esclarecimento**                                   | L   |
| **CIAAW** (site, tabelas de pesos atômicos e abundâncias)                                              | Impressum: © CIAAW e IUPAC; uso livre para fins educacionais; reprodução e distribuição eletrônica sem permissão formal, com atribuição; uso comercial exige contato com o Secretariado. | `condicional`     | `uso-educacional`, `contato-comercial`            | Sem incorporação automática; **aguarda esclarecimento**                          | L   |
| **ENSDF** (NNDC/IAEA)                                                                                  | Foram identificadas políticas de **citação** e de **apresentação**; nenhuma licença ou autorização de redistribuição. Os Termos de Uso gerais da IAEA só foram lidos por trechos.        | `nao-esclarecida` | nenhuma                                           | Consulta e citação; **aguarda esclarecimento**                                   | L/E |
| **NIST Atomic Spectra Database** (SRD 78, versão 5.12)                                                 | A página oficial declara os dados protegidos por direitos autorais do Departamento de Comércio dos EUA, "all rights reserved". Nenhuma autorização de redistribuição foi localizada.     | `nao-esclarecida` | nenhuma                                           | Consulta e citação; **aguarda esclarecimento**                                   | L   |
| **IUPAC Gold Book**                                                                                    | Indicada, por trechos indexados, como CC BY-SA 4.0 por termo, com licenciamento comercial à parte; **verificação direta pendente**.                                                      | `condicional`     | `compartilhamento-igual`, `contato-comercial`     | Apenas consulta e citação; **não incorporar por enquanto**                       | E   |
| **IUPAC Red Book 2005**                                                                                | © IUPAC 2005, todos os direitos reservados; só "fair dealing"; a reprodução exige autorização escrita prévia (a página de direitos indica a Royal Society of Chemistry, editora).        | `condicional` ¹   | nenhuma estruturada (condição descrita em `note`) | Apenas consulta e citação bibliográfica; **sem reprodução de textos ou tabelas** | L   |
| Relatórios técnicos IUPAC/CIAAW na _Pure Appl. Chem._ (ex.: Prohaska et al. 2022) ²                    | CC BY-NC-ND 4.0.                                                                                                                                                                         | `condicional`     | `nao-comercial`, `sem-derivados`                  | Apenas consulta e citação                                                        | L   |
| Alvarez (2013), raios de van der Waals, _Dalton Trans._ 42, 8617 (doi:10.1039/C3DT50599E)              | CC BY-NC 3.0 Unported.                                                                                                                                                                   | `condicional`     | `nao-comercial`                                   | Apenas consulta e citação; **valores não incorporados**                          | L   |
| Bondi (1964), raios de van der Waals, _J. Phys. Chem._ 68, 441 (doi:10.1021/j100785a001) ²             | Licença **individual** não verificada (editora: ACS).                                                                                                                                    | `nao-esclarecida` | nenhuma                                           | Consulta e citação; **aguarda verificação individual**                           | N   |
| Mantina et al. (2009), raios de van der Waals, _J. Phys. Chem. A_ 113, 5806 (doi:10.1021/jp8111556) ²  | Licença **individual** não verificada (editora: ACS).                                                                                                                                    | `nao-esclarecida` | nenhuma                                           | Consulta e citação; **aguarda verificação individual**                           | N   |
| Cordero et al. (2008), raios covalentes, _Dalton Trans._, 2832 (doi:10.1039/b801115j) ²                | Licença **individual** não verificada (editora: RSC).                                                                                                                                    | `nao-esclarecida` | nenhuma                                           | Consulta e citação; **aguarda verificação individual**                           | N   |

¹ Estado aprovado: `condicional`, porque a exigência de autorização prévia não equivale necessariamente a uma proibição absoluta de redistribuição. Os valores de `restrictions` não têm um item correspondente, e nenhuma restrição estruturada foi inventada; a condição é descrita em `note`: "a reprodução de conteúdo protegido exige autorização escrita prévia da detentora dos direitos". Situação no Elementum: apenas consulta e citação bibliográfica, sem reprodução de textos ou tabelas.

² Linhas acrescentadas por aplicação das regras aprovadas (NC/ND e `nao-esclarecida`) e mantidas por decisão do mantenedor. As três publicações de raios (Bondi, Mantina e Cordero) são tratadas **individualmente**: têm editoras e termos próprios, e nenhuma licença comum pode ser presumida.

**Cuidados na leitura da matriz:**

- A CC BY 3.0 do artigo NUBASE2020 e a do artigo AME2020 (II) valem para esses artigos e **não se estendem** a outras partes do AME2020 (como a parte I, cuja licença não foi verificada diretamente) nem aos arquivos ASCII ou externos do AMDC.
- No CIAAW, o alcance exato dos termos sobre todas as tabelas e conjuntos de dados precisa ser esclarecido; por isso a fonte é `condicional` e **sem incorporação automática**.
- O NIST ASD é `nao-esclarecida`, e **não** `nao-permitida`: a fonte declara direitos reservados, mas nenhuma proibição expressa de redistribuir valores foi localizada, nem autorização.

### O que pode ser incorporado

- **Elegíveis (com atribuição):** o conteúdo dos artigos NUBASE2020 e AME2020 (II), sob CC BY 3.0. **Elegível não significa incorporado:** nenhum dado foi coletado. Ao coletar, registram-se valores individuais com `locator`, sem copiar a tabela inteira.
- **Apenas consulta e citação:** IUPAC Gold Book, IUPAC Red Book (citação bibliográfica, sem reprodução de textos ou tabelas), relatórios da _Pure Appl. Chem._ (CC BY-NC-ND) e Alvarez (2013).
- **Aguardam esclarecimento (podem ser consultadas e citadas, não incorporadas):** arquivos ASCII do AMDC, CIAAW, ENSDF, NIST ASD e as licenças individuais, pendentes, de Bondi, Mantina e Cordero.

### Atribuição exigida

| Fonte                     | Condição de atribuição                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NUBASE2020 e AME2020 (II) | CC BY 3.0: manter a atribuição aos autores, o título da obra, a citação do periódico e o DOI. O AMDC pede citar os artigos originais, e não os arquivos.                                                |
| CIAAW                     | Reconhecimento da fonte "com referência completa"; o símbolo ©, o nome IUPAC ou CIAAW e o ano devem estar visíveis (impressum).                                                                         |
| ENSDF                     | Orientação de **citação**, não licença: até 10 nuclídeos, citar a avaliação da cadeia de massa na _Nuclear Data Sheets_; acima disso, citar o banco com a data de consulta.                             |
| NIST ASD                  | Citação recomendada: Kramida, A., Ralchenko, Yu., Reader, J. and NIST ASD Team (2024). _NIST Atomic Spectra Database_ (versão 5.12). doi:10.18434/T4W30F. O NIST pede que se credite o NIST como fonte. |

### Esclarecimentos pendentes

**Nenhum contato foi realizado.** Contatar ou não, e quando, é decisão do mantenedor. Os canais abaixo são institucionais; dados de pessoas não são registrados neste repositório. Enquanto não houver resposta formal, as fontes continuam como na matriz.

| Instituição   | O que precisa ser esclarecido                                                                                     | Fontes afetadas               | Canal institucional identificado                                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AMDC**      | Licença dos arquivos ASCII e permissão para redistribuir valores deles extraídos.                                 | Arquivos NUBASE2020 e AME2020 | Sites oficiais <http://amdc.impcas.ac.cn/> e <https://www-nds.iaea.org/amdc/>. **Contato específico não identificado na auditoria.**                                               |
| **CIAAW**     | Alcance dos termos (uso educacional e distribuição eletrônica) sobre tabelas e dados; condições de uso comercial. | CIAAW                         | Secretariado do CIAAW, indicado no impressum: <https://www.ciaaw.org/impressum.htm>.                                                                                               |
| **NNDC/IAEA** | Licença e condições de redistribuição do ENSDF.                                                                   | ENSDF                         | Páginas oficiais <https://www.nndc.bnl.gov/ensdf/> e da IAEA. **Contato específico não identificado na auditoria.**                                                                |
| **NIST**      | Permissão para transcrever ou redistribuir valores do ASD (SRD 78) e termos de licença do programa SRD.           | NIST ASD                      | Suporte do ASD, indicado em <https://www.nist.gov/pml/atomic-spectra-database>. A página do programa SRD com os termos de licença **não carregou** (erro 404) durante a auditoria. |

Depois de um esclarecimento formal, a decisão deve ser documentada e só então o registro da fonte (`redistribution`, `restrictions`) é atualizado.

### Lacunas de evidência da auditoria

O que não pôde ser registrado com segurança:

- **Gold Book:** a licença (CC BY-SA 4.0) e a regra de licenciamento comercial foram indicadas por trechos indexados dos próprios termos, porque a leitura direta foi bloqueada; **verificação direta pendente**.
- **Termos de Uso da IAEA:** consulta direta incompleta; as informações vêm de trechos indexados.
- **AME2020 (I)** (doi:10.1088/1674-1137/abddb0): licença **não verificada diretamente**. **AME2020 (II):** CC BY 3.0 verificada diretamente, sem estender essa licença a outras partes ou arquivos.
- **Arquivos ASCII do AMDC:** nenhuma licença declarada foi encontrada, e a redistribuição é `nao-esclarecida`; isso não prova que não exista licença.
- **CIAAW:** o impressum não cita tabelas ou conjuntos de dados, e seu aviso de copyright (2007–2022) é anterior à tabela de 2024.
- **ENSDF e NIST ASD:** os documentos de política localizados tratam de citação e apresentação; a página do programa SRD do NIST não carregou.
- **Bondi, Mantina e Cordero:** licenças **individuais** pendentes; não se presume licença comum.
- **Canais de contato** do AMDC e do NNDC/IAEA: não identificados.
- **Red Book:** estado `condicional` aprovado; a exigência de autorização escrita prévia não foi interpretada como proibição absoluta, e os enums de `restrictions` não têm item correspondente (a condição fica em `note`).
- Nada disto é aconselhamento jurídico. O direito sobre bases de dados e a diferença entre fatos e sua apresentação variam por jurisdição.

### Registro em `references.json`

**Estado atual (Etapa 2.3C.2):** o registro contém **duas referências**, ambas artigos de acesso aberto sob CC BY 3.0. Duas referências foram cadastradas, mas **nenhum dado de elemento foi incorporado**: os JSON de famílias continuam vazios, e as referências ainda não são citadas por nenhum elemento (o catálogo emite dois avisos "registrada, mas nunca citada").

| `id`                | Obra                                                                        | DOI                        |
| ------------------- | --------------------------------------------------------------------------- | -------------------------- |
| `nubase2020-artigo` | NUBASE2020 (Kondev et al., _Chin. Phys. C_ 45(3), artigo 030001, 2021)      | `10.1088/1674-1137/abddae` |
| `ame2020-ii-artigo` | AME2020, parte II (Wang et al., _Chin. Phys. C_ 45(3), artigo 030003, 2021) | `10.1088/1674-1137/abddaf` |

Nas duas: `kind: artigo`, `tier: compilacao`, `usage: dados-incorporados`, `publisher: IOP Publishing`, e `license` com `status: verificada`, `redistribution: permitida` (sem `restrictions`), `name: CC BY 3.0`, `termsUrl`, `attribution` (referência bibliográfica completa, link da licença e a exigência de identificar modificações), `checkedAt: 2026-11-07` e `note` (copyright e escopo da licença).

- **Verificação de 2026-11-07:** nas páginas da editora (IOPscience) foram lidos a licença, o acesso aberto e o copyright, que coincidem com o registro. O link da licença nas páginas é `http://creativecommons.org/licenses/by/3.0`; o registro usa a mesma licença em HTTPS (`https://creativecommons.org/licenses/by/3.0/`).
- **Autores:** os nomes seguem as formas publicadas em cada artigo (por exemplo, "M. Wang" no NUBASE2020 e "Meng Wang" no AME2020 II).
- **Escopo individual:** a autorização **não se estende** aos arquivos ASCII do AMDC, ao AME2020 (parte I) nem a outras publicações relacionadas; as notas das duas referências registram isso.
- **Trava de política:** `src/data/references.registry.test.ts` falha se qualquer outra referência for `dados-incorporados`. Incluir uma nova fonte exige atualizar esse teste e a política desta seção de forma deliberada.

**Convenção de identificação (`id`):** `<fonte>-<tipo>`, em kebab-case (por exemplo, `nubase2020-artigo`), em que o tipo corresponde ao `kind` da referência. Uma publicação e um arquivo de dados da mesma fonte são referências distintas, com `id` distintos. Os `id` são **imutáveis**: um `id` nunca é reaproveitado com outro significado. Uma nova edição de uma fonte recebe um novo `id`, e a anterior permanece registrada, para não perder a rastreabilidade das citações existentes.

**Convenção de `locator`:** o `locator` é texto livre, como no schema atual (só se exige que não seja vazio); o schema não o estrutura. Recomenda-se uma descrição precisa o bastante para localizar o valor na fonte, com o que for aplicável: tabela e seu número; página ou identificador da página; entrada, linha ou seção; e a legenda ou o contexto necessário. Formato sugerido: `Tabela <número>; página <identificador>; entrada <nuclídeo ou linha>`.

**Próximos registros:** as demais fontes da matriz só entram quando forem citadas, como `usage: apenas-citacao`, com o estado de redistribuição e as restrições da matriz; `condicional` exige restrição ou nota (o Red Book, por exemplo, usa `note`). A proteção do catálogo contra o uso, como origem de dados, de referências não incorporáveis foi implementada na Etapa 2.3C.3 (veja "Papéis das citações e elegibilidade bibliográfica", na seção 6).

## 9. Limitações da verificação científica

A auditoria da Etapa 2.3B.1 leu diretamente a seção IR-3.5 do Red Book 2005 (com busca no texto completo) e as passagens sobre pressão e estado padrão do Green Book, 3ª ed., a partir de texto extraído dos PDFs da IUPAC. Continuam sem leitura direta o Gold Book, o relatório de Scerri (2021) e parte dos artigos sobre química de elementos superpesados (acesso bloqueado ou restrito). As afirmações que dependem deles estão marcadas como "fonte secundária". Itens sem confirmação em fonte primária:

- o texto do Gold Book (inclusive a definição de elemento de transição e os termos de licença);
- conteúdo do relatório de Scerri;
- a classificação individual de cada elemento de Z ≥ 99;
- a contagem exata de isótopos naturais;
- a data da adoção de 100 kPa como pressão padrão pela IUPAC (1982), que consta em trechos do Gold Book sem leitura direta;
- a fonte e a licença dos raios de van der Waals (nenhum conjunto foi escolhido; as licenças individuais de Bondi, Mantina e Cordero estão pendentes);
- as licenças e condições pendentes do AMDC (arquivos), do CIAAW (alcance), do ENSDF e do NIST ASD, e as demais lacunas de licenciamento (seção 8).

Esses itens devem ser resolvidos na coleta de dados, antes de entrarem como fatos nos JSON.

## 10. Fontes consultadas

- IUPAC, Periodic Table of the Elements (versão de 4 de maio de 2022): <https://iupac.org/what-we-do/periodic-table-of-elements/> (lida).
- CIAAW, Standard Atomic Weights: <https://ciaaw.org/atomic-weights.htm> e <https://ciaaw.org/abridged-atomic-weights.htm> (lidas).
- Prohaska et al. (2022), Standard atomic weights of the elements 2021, _Pure Appl. Chem._ 94, 573 (metadados).
- Meija et al. (2016), Isotopic compositions of the elements 2013, _Pure Appl. Chem._ 88, 293 (metadados).
- Kondev et al. (2021), The NUBASE2020 evaluation of nuclear physics properties, _Chin. Phys. C_ 45, 030001 (resumo).
- Scerri (2021), Provisional report on discussions on group 3 of the periodic table, _Chemistry International_ 43(1), 31–34 (metadados).
- Fluck (1988), _Pure Appl. Chem._ 60(3), 431–436 (citado apenas por fonte secundária; título e texto não verificados).
- Vernon (2013), Which elements are metalloids?, _J. Chem. Educ._ 90, 1703 (resumos).
- Cordero et al. (2008), Covalent radii revisited, _Dalton Trans._, <https://dx.doi.org/10.1039/b801115j> (metadados).
- Wang et al. (2014), Identification of an iridium-containing compound with a formal oxidation state of IX, _Nature_ (resumos).
- W3C, WCAG 2.2: critérios 1.4.1, 1.4.11 e 2.5.8 (lidos).

### Fontes da auditoria de licenças (Etapa 2.3B.1)

- CIAAW, impressum: <https://www.ciaaw.org/impressum.htm> (lido).
- Kondev et al. (2021), NUBASE2020, página da editora: <https://iopscience.iop.org/article/10.1088/1674-1137/abddae> (lida); página do AMDC: <http://amdc.impcas.ac.cn/web/nubase_en.html> (lida).
- Wang et al. (2021), AME2020 (II), página da editora: <https://iopscience.iop.org/article/10.1088/1674-1137/abddaf> (lida); PDF hospedado pela IAEA (lido).
- ENSDF: <https://www.nndc.bnl.gov/ensdf/>, diretrizes de citação <https://www.nndc.bnl.gov/ensdf/citations.pdf> e políticas de apresentação <https://www.nndc.bnl.gov/nds/docs/NDSPolicies.pdf> (lidas). Termos de Uso da IAEA: <https://iaea.org/about/disclaimer> (só por trechos indexados).
- NIST ASD: <https://www.nist.gov/pml/atomic-spectra-database>, histórico e citação <http://physics.nist.gov/PhysRefData/ASD/Html/verhist.shtml>, declarações de copyright <https://www.nist.gov/open/copyright-fair-use-and-licensing-statements-srd-data-software-and-technical-series-publications> (lidas).
- IUPAC, _Nomenclature of Inorganic Chemistry_ (Red Book), Recomendações 2005, ISBN 0-85404-438-8 (PDF; seção IR-3.5 e página de direitos lidas, mais busca no texto completo). IUPAC, _Quantities, Units and Symbols in Physical Chemistry_ (Green Book), 3ª ed. (PDF; passagens sobre pressão e estado padrão lidas). Gold Book: <https://goldbook.iupac.org/> (só por trechos indexados; verificação direta pendente).
- Prohaska et al. (2022), _Pure Appl. Chem._ 94, 573, doi:10.1515/pac-2019-0603 (primeiras páginas lidas em cópia de repositório).
- Alvarez (2013), _Dalton Trans._ 42, 8617, doi:10.1039/C3DT50599E (lido em cópia de acesso aberto do repositório da Universitat de Barcelona).
