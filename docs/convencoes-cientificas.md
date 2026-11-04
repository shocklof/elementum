# Convenções científicas do Elementum

Este documento registra as decisões científicas, as convenções do projeto e as decisões de interface do Elementum. Ele separa três naturezas de afirmação:

- **[CIÊNCIA]**: fato com fonte verificável. Indica o grau de verificação.
- **[CONVENÇÃO]**: escolha do Elementum. Não é norma científica e pode divergir de outras fontes.
- **[INTERFACE]**: decisão de apresentação.

Data da consolidação: 2026-11-04 (Etapa 2.1 aprovada; implementação na Etapa 2.2).

## 1. Princípios

1. **[CONVENÇÃO]** Todo dado científico cita ao menos uma referência do registro global (`src/data/references.json`), com o local exato na fonte quando possível.
2. **[CONVENÇÃO]** A Wikipédia e outros projetos Wikimedia não podem ser citados como referência. O schema rejeita esses endereços.
3. **[CONVENÇÃO]** Dados desconhecidos e não aplicáveis são sempre explicitados (`desconhecido`, `nao-aplicavel`). Nunca se usa `null` nem um valor inventado.
4. **[CONVENÇÃO]** Nenhum dado de uma base científica é incorporado enquanto sua licença e as condições de atribuição não forem verificadas e registradas (ver seção 8).
5. **[CONVENÇÃO]** Família química e posição na tabela são independentes (seções 2 e 3).

## 2. Classificação química (famílias)

### Fatos

- **[CIÊNCIA]** A IUPAC define nomes coletivos para alguns grupos: metais alcalinos (grupo 1, exceto H), alcalino-terrosos (grupo 2), halogênios (grupo 17), gases nobres (grupo 18), lantanoides (La–Lu) e actinoides (Ac–Lr). _Verificação: via fontes secundárias; o texto do Red Book 2005 não pôde ser lido diretamente._
- **[CIÊNCIA]** A IUPAC não define "metais de pós-transição", "metaloides" nem "não metais". _Verificação: via fonte secundária._
- **[CIÊNCIA]** O Red Book considera o bloco d como os grupos 3–12, "embora o grupo 12 nem sempre seja incluído". O Gold Book afirma que o grupo 12 não satisfaz sua definição de elemento de transição. _Verificação: via fonte secundária._
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

- **[CONVENÇÃO]** Estado físico e densidade usam, como referência, **298,15 K e 100 kPa** (`REFERENCE_CONDITIONS`). _Esta referência deve ser confirmada com a IUPAC na coleta de dados._ O campo `phase.conditions` é obrigatório; propriedades como densidade e pontos de fusão e ebulição aceitam `conditions` opcional.

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
- **Raios:** raio covalente e raio de van der Waals são propriedades separadas. **[CIÊNCIA]** Cordero et al. (2008) cobre raios covalentes só até Z=96; os demais ficam `desconhecido`. _Verificação: resumo lido._ A fonte do raio de van der Waals ainda precisa ser definida.
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
| `license`                                                     | Verificação de licença (seção 8).                                                   |

Cada dado cita `{ ref, locator? }`, com o local exato (tabela, página, entrada). O catálogo valida que toda citação aponta para uma referência registrada e avisa sobre referências registradas e nunca citadas.

## 7. Decisões de interface (a implementar nas próximas etapas)

- **[INTERFACE]** As dez cores das famílias são mantidas (`src/styles/tokens.css`). Análise: o contraste de cada cor contra a superfície escura é de 6,1:1 a 11,2:1; na simulação de daltonismo (matrizes de Machado et al., 2009, usadas de memória, resultado indicativo), alguns pares ficam quase indistinguíveis. Por isso a cor não é o único meio de informação (WCAG 1.4.1).
- **[INTERFACE] Marcadores geométricos** exclusivos por família (`marker` em `families.ts`): círculo (alcalinos), quadrado (alcalino-terrosos), losango (bloco d), triângulo (pós-transição), hexágono (semimetais), cruz (não metais), triângulo invertido (halogênios), estrela (gases nobres), semicírculo (lantanídeos) e barra (actinídeos). Os formatos finais serão validados visualmente.
- **[INTERFACE]** Legenda clicável e filtros por família; famílias não selecionadas ficam esmaecidas (`--opacity-dimmed`).
- **[INTERFACE]** Classificação `predita`: borda tracejada, hachura suave e "?" no canto com texto alternativo (`--border-predicted-style`, `--hatch-predicted`).
- **[INTERFACE]** Valores `calculado` ou `estimado` aparecem com prefixo "~" e selo textual. Valores `desconhecido` aparecem como "—" com o selo "Desconhecido" (`--color-unknown`); `nao-aplicavel` aparece como "Não se aplica" com o motivo.
- **[INTERFACE]** Responsividade: tabela completa no desktop (≥ 1200 px), grade reduzida em larguras médias, e lista por família no celular (< 600 px), com opção de ver a tabela completa. Base: WCAG 2.2, critérios 1.4.1, 1.4.11 e 2.5.8 (alvos de 24×24 px), verificados no site do W3C.

## 8. Licenças e atribuição das bases científicas

**[CONVENÇÃO]** Antes de incorporar dados de qualquer base, é obrigatório verificar e registrar a licença e as condições de atribuição. O schema impõe a regra:

- Uma referência com `usage: dados-incorporados` só é aceita com `license.status: verificada`, que exige `name`, `termsUrl`, `attribution` e `checkedAt`.
- Licença `pendente` bloqueia a incorporação. Referências `apenas-citacao` não exigem verificação.

**Estado atual: nenhuma licença foi verificada.** Candidatas à coleta (todas com licença **pendente**):

| Base                                                           | Uso previsto                         | Licença / atribuição |
| -------------------------------------------------------------- | ------------------------------------ | -------------------- |
| CIAAW (pesos atômicos, abundâncias)                            | Massa atômica, composição isotópica  | Pendente             |
| NUBASE2020 / AME2020                                           | Isótopos, massas, meias-vidas        | Pendente             |
| ENSDF (NNDC/IAEA)                                              | Verificação de dados nucleares       | Pendente             |
| NIST Atomic Spectra Database                                   | Configurações, energias de ionização | Pendente             |
| Fontes de raios, eletronegatividade e pontos de fusão/ebulição | A definir                            | Pendente             |

## 9. Limitações da verificação científica

Não foi possível ler diretamente o texto do Red Book 2005, o do Gold Book, o relatório de Scerri (2021) nem os artigos sobre química de elementos superpesados (acesso bloqueado ou arquivos ilegíveis). As afirmações que dependem deles estão marcadas como "fonte secundária". Itens sem confirmação em fonte primária:

- seções exatas do Red Book e o texto do Gold Book;
- conteúdo do relatório de Scerri;
- a classificação individual de cada elemento de Z ≥ 99;
- a contagem exata de isótopos naturais;
- as condições de referência da IUPAC (298,15 K e 100 kPa são convenção do projeto);
- a fonte do raio de van der Waals;
- a licença e a citação do ENSDF e das demais bases.

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
