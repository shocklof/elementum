import type { Reference } from './schema/reference.schema';

/**
 * Elegibilidade bibliográfica das citações de um elemento.
 *
 * A elegibilidade depende da categoria do bloco que carrega as citações e do papel de cada
 * citação (`origem` ou `apoio`). O critério da referência é `usage` (não `license`): as regras
 * de licenciamento já são validadas em reference.schema.ts e não são repetidas aqui.
 *
 * Regras (docs/convencoes-cientificas.md, seção 6):
 * - bloco de **dado estruturado com valor**: toda citação tem papel explícito, ao menos uma é
 *   `origem`, e toda `origem` é `usage: dados-incorporados`. `apoio` aceita qualquer `usage`;
 * - bloco `desconhecido` ou `nao-aplicavel`: citações opcionais; podem usar `apenas-citacao`;
 *   o papel `origem` não se aplica;
 * - conteúdo **autoral** (textos e classificação): qualquer `usage`; o papel `origem` não se aplica.
 *
 * Falha segura: um caminho com `citations` que não esteja em CITATION_PATH_CATEGORIES é um
 * erro, nunca é assumido como conteúdo autoral.
 */

export type CitationPath = readonly (string | number)[];
export type ReferenceUsage = Reference['usage'];

/**
 * Categoria de um caminho com `citations`:
 * - `dado`: dado estruturado, sempre com valor (ex.: `atomicMass`, `discovery`, citações do isótopo);
 * - `estado`: bloco com `status`; `valor`/`estavel` é dado estruturado, `desconhecido` e
 *   `nao-aplicavel` são justificativas;
 * - `autoral`: texto ou classificação redigidos pelo projeto.
 */
export type CitationCategory = 'dado' | 'estado' | 'autoral';

/** Natureza efetiva de um bloco, depois de resolver o `status` das categorias `estado`. */
export type CitationBlockKind = 'dado' | 'justificativa' | 'autoral';

/**
 * Classificação explícita de todos os caminhos com `citations` do `elementSchema`.
 * As chaves usam a notação do JSON Schema (`isotopes[].atomicMass`, `uses[]`).
 * Um teste garante que esta tabela coincide com os caminhos do schema nos dois sentidos.
 */
export const CITATION_PATH_CATEGORIES: Readonly<Record<string, CitationCategory>> = {
  /* Dados estruturados */
  atomicMass: 'dado',
  discovery: 'dado',
  'isotopes[]': 'dado',

  /* Blocos com estado (valor, desconhecido ou não aplicável) */
  electronConfiguration: 'estado',
  phase: 'estado',
  'physical.density': 'estado',
  'physical.meltingPoint': 'estado',
  'physical.boilingPoint': 'estado',
  'chemical.electronegativityPauling': 'estado',
  'chemical.covalentRadius': 'estado',
  'chemical.vanDerWaalsRadius': 'estado',
  'chemical.firstIonizationEnergy': 'estado',
  'chemical.electronAffinity': 'estado',
  'chemical.oxidationStates': 'estado',
  'tier2.crystalStructure': 'estado',
  'tier2.thermalConductivity': 'estado',
  'tier2.specificHeat': 'estado',
  'tier2.heatOfFusion': 'estado',
  'tier2.heatOfVaporization': 'estado',
  'tier2.crustalAbundance': 'estado',
  'isotopes[].atomicMass': 'estado',
  'isotopes[].halfLife': 'estado',
  'isotopes[].abundance': 'estado',

  /* Conteúdo autoral */
  appearance: 'autoral',
  etymology: 'autoral',
  summary: 'autoral',
  'uses[]': 'autoral',
  classification: 'autoral',
};

/** Bloco que carrega uma lista `citations`. */
export interface CitationBlock {
  /** Caminho do objeto que contém `citations`, a partir da raiz do elemento. */
  readonly path: CitationPath;
  /** Objeto que contém `citations` (dá acesso ao `status` do bloco). */
  readonly container: Readonly<Record<string, unknown>>;
  readonly citations: readonly unknown[];
}

/**
 * Percorre o valor e devolve todos os blocos que têm uma lista `citations`, com o caminho
 * completo. Blocos aninhados são todos devolvidos (ex.: o isótopo e a massa do isótopo).
 */
export function collectCitationBlocks(node: unknown, path: CitationPath = []): CitationBlock[] {
  if (Array.isArray(node)) {
    return node.flatMap((item, index) => collectCitationBlocks(item, [...path, index]));
  }
  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>;
    const blocks: CitationBlock[] = [];
    if (Array.isArray(record.citations)) {
      blocks.push({ path, container: record, citations: record.citations });
    }
    for (const [key, value] of Object.entries(record)) {
      if (key === 'citations') continue;
      blocks.push(...collectCitationBlocks(value, [...path, key]));
    }
    return blocks;
  }
  return [];
}

/** Caminho normalizado, sem índices (`isotopes[].atomicMass`), como em CITATION_PATH_CATEGORIES. */
export function normalizeCitationPath(path: CitationPath): string {
  let normalized = '';
  for (const segment of path) {
    if (typeof segment === 'number') normalized += '[]';
    else normalized += normalized ? `.${segment}` : segment;
  }
  return normalized;
}

/** Caminho legível, com índices (`isotopes[2].atomicMass`), para mensagens de erro. */
export function formatCitationPath(path: CitationPath): string {
  let formatted = '';
  for (const segment of path) {
    if (typeof segment === 'number') formatted += `[${segment}]`;
    else formatted += formatted ? `.${segment}` : segment;
  }
  return formatted;
}

/** Natureza efetiva do bloco, ou `undefined` se o `status` de um bloco com estado não é reconhecido. */
export function resolveBlockKind(
  category: CitationCategory,
  container: Readonly<Record<string, unknown>>,
): CitationBlockKind | undefined {
  if (category === 'dado') return 'dado';
  if (category === 'autoral') return 'autoral';
  switch (container.status) {
    case 'valor':
    case 'estavel':
      return 'dado';
    case 'desconhecido':
    case 'nao-aplicavel':
      return 'justificativa';
    default:
      return undefined;
  }
}

function readCitation(raw: unknown): { ref: string; role: string | undefined } {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    ref: typeof record.ref === 'string' ? record.ref : '',
    role: typeof record.role === 'string' ? record.role : undefined,
  };
}

/**
 * Confere a elegibilidade bibliográfica das citações de um elemento.
 *
 * Deve ser chamada depois da validação de existência das referências: citações a referências
 * inexistentes são ignoradas aqui, porque já foram reportadas.
 *
 * @param element elemento (já validado pelo `elementSchema`).
 * @param usageByRef `usage` de cada referência registrada.
 * @param label prefixo das mensagens (normalmente o símbolo do elemento).
 * @returns mensagens de erro, vazio quando tudo é elegível.
 */
export function checkCitationEligibility(
  element: unknown,
  usageByRef: ReadonlyMap<string, ReferenceUsage>,
  label: string,
): string[] {
  const issues: string[] = [];

  for (const block of collectCitationBlocks(element)) {
    const where = formatCitationPath(block.path);
    const category = CITATION_PATH_CATEGORIES[normalizeCitationPath(block.path)];

    if (category === undefined) {
      issues.push(
        `${label}: ${where}.citations: caminho de citação sem categoria de elegibilidade; classifique-o em CITATION_PATH_CATEGORIES (src/data/citation-eligibility.ts).`,
      );
      continue;
    }

    const kind = resolveBlockKind(category, block.container);
    if (kind === undefined) {
      issues.push(
        `${label}: ${where}: bloco com status "${String(block.container.status)}" não reconhecido; não foi possível aplicar a elegibilidade das citações.`,
      );
      continue;
    }

    let considered = 0;
    let hasOrigin = false;
    let blockIssues = 0;
    const refs: string[] = [];

    block.citations.forEach((raw, index) => {
      const { ref, role } = readCitation(raw);
      const usage = usageByRef.get(ref);
      if (usage === undefined) return; // referência inexistente: já reportada
      considered += 1;
      refs.push(ref);
      const at = `${where}.citations[${index}]`;
      const detail = `[ref=${ref}; role=${role ?? 'ausente'}; usage=${usage}]`;

      if (kind === 'dado') {
        if (role === undefined) {
          issues.push(
            `${label}: ${at}: citação de dado estruturado sem papel explícito; use role "origem" ou "apoio" ${detail}`,
          );
          blockIssues += 1;
        } else if (role === 'origem') {
          if (usage === 'dados-incorporados') hasOrigin = true;
          else {
            issues.push(
              `${label}: ${at}: a referência só pode ser origem de dado estruturado se for "dados-incorporados" ${detail}`,
            );
            blockIssues += 1;
          }
        }
        return;
      }

      if (role === 'origem') {
        const subject =
          kind === 'autoral' ? 'conteúdo autoral' : 'estado desconhecido ou não aplicável';
        issues.push(
          `${label}: ${at}: o papel "origem" não se aplica a ${subject}; use "apoio" ou omita o papel ${detail}`,
        );
      }
    });

    // Sem origem: só reporta quando não há outro problema no bloco que já oriente a correção.
    if (
      kind === 'dado' &&
      !hasOrigin &&
      blockIssues === 0 &&
      (considered > 0 || block.citations.length === 0)
    ) {
      issues.push(
        `${label}: ${where}: bloco de dado estruturado sem citação com papel "origem"; exige ao menos uma origem "dados-incorporados" [refs=${refs.join(', ') || 'nenhuma'}]`,
      );
    }
  }

  return issues;
}
