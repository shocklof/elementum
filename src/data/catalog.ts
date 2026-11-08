import { z } from 'zod';
import referencesRegistry from './references.json';
import { checkCitationEligibility } from './citation-eligibility';
import { FAMILY_IDS, FAMILY_MEMBERS, isFamilyId, type FamilyId, getFamily } from './families';
import { ELEMENT_COUNT, LAYOUT } from './layout';
import { elementSchema, type Element } from './schema/element.schema';
import { referenceSchema, type Reference } from './schema/reference.schema';

export interface Catalog {
  /** Elementos ordenados por número atômico. */
  readonly elements: readonly Element[];
  /** Registro global de referências. */
  readonly references: readonly Reference[];
  /** Avisos não fatais (ex.: referências registradas e nunca citadas). */
  readonly warnings: readonly string[];
}

export interface Completeness {
  expected: number;
  registered: number;
  missing: number[];
}

/** Regras externas ao JSON contra as quais o catálogo é conferido. */
export interface CatalogRules {
  /** Número atômico e símbolo esperados (layout). */
  readonly positions: readonly { readonly atomicNumber: number; readonly symbol: string }[];
  /** Pertinência canônica por família. */
  readonly membership: Readonly<Record<FamilyId, readonly number[]>>;
}

export const DEFAULT_RULES: CatalogRules = { positions: LAYOUT, membership: FAMILY_MEMBERS };

export class CatalogError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Catálogo de elementos inválido:\n- ${issues.join('\n- ')}`);
    this.name = 'CatalogError';
    this.issues = issues;
  }
}

function familyFromPath(path: string): string {
  return (path.split('/').pop() ?? path).replace(/\.json$/, '');
}

/** Coleta os ids de referência de todas as `citations` de um valor (recursivamente). */
export function collectCitationRefs(node: unknown): string[] {
  if (Array.isArray(node)) return node.flatMap(collectCitationRefs);
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, value]) => {
      if (key === 'citations' && Array.isArray(value)) {
        return value.flatMap((citation) =>
          citation && typeof citation === 'object' && 'ref' in citation
            ? [String(citation.ref)]
            : [],
        );
      }
      return collectCitationRefs(value);
    });
  }
  return [];
}

/**
 * Valida e consolida os arquivos JSON de elementos e o registro de referências.
 *
 * @param files mapa `caminho -> conteúdo`, onde o nome do arquivo é o id da família.
 * @param referencesInput conteúdo do registro global de referências.
 * @param rules layout e pertinência contra os quais conferir (padrão: os do projeto).
 * @throws CatalogError com todos os problemas encontrados.
 */
export function buildCatalog(
  files: Record<string, unknown>,
  referencesInput: unknown = [],
  rules: CatalogRules = DEFAULT_RULES,
): Catalog {
  const issues: string[] = [];
  const warnings: string[] = [];

  /* Referências */
  let references: Reference[] = [];
  const parsedReferences = z.array(referenceSchema).safeParse(referencesInput);
  if (parsedReferences.success) {
    references = parsedReferences.data;
    const ids = new Set<string>();
    for (const reference of references) {
      if (ids.has(reference.id)) issues.push(`Referência "${reference.id}" duplicada no registro.`);
      ids.add(reference.id);
    }
  } else {
    for (const issue of parsedReferences.error.issues) {
      issues.push(`references.json [${issue.path.join('.')}]: ${issue.message}`);
    }
  }

  /* Elementos */
  const elements: Element[] = [];
  for (const [path, content] of Object.entries(files)) {
    const familyId = familyFromPath(path);
    if (!isFamilyId(familyId)) {
      issues.push(`${path}: nome de arquivo não corresponde a nenhuma família conhecida.`);
      continue;
    }

    const parsed = z.array(elementSchema).safeParse(content);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        issues.push(`${path} [${issue.path.join('.')}]: ${issue.message}`);
      }
      continue;
    }

    for (const element of parsed.data) {
      if (element.family !== familyId) {
        issues.push(
          `${path}: ${element.symbol} declara a família "${element.family}", mas está em "${familyId}".`,
        );
      }
      elements.push(element);
    }
  }

  /* Coerência com layout e pertinência canônica */
  const symbolByNumber = new Map(
    rules.positions.map((position) => [position.atomicNumber, position.symbol]),
  );
  const familyByNumber = new Map<number, FamilyId>();
  for (const familyId of FAMILY_IDS) {
    for (const atomicNumber of rules.membership[familyId])
      familyByNumber.set(atomicNumber, familyId);
  }

  const numbers = new Map<number, string>();
  const symbols = new Set<string>();
  for (const element of elements) {
    const expectedSymbol = symbolByNumber.get(element.atomicNumber);
    if (expectedSymbol === undefined) {
      issues.push(
        `${element.symbol}: o número atômico ${element.atomicNumber} não existe no layout.`,
      );
    } else if (expectedSymbol !== element.symbol) {
      issues.push(
        `Z=${element.atomicNumber}: símbolo "${element.symbol}" difere do layout ("${expectedSymbol}").`,
      );
    }

    const expectedFamily = familyByNumber.get(element.atomicNumber);
    if (expectedFamily && expectedFamily !== element.family) {
      issues.push(
        `${element.symbol}: pertence à família "${getFamily(expectedFamily).id}" pela convenção do projeto, mas declara "${element.family}".`,
      );
    }

    const previous = numbers.get(element.atomicNumber);
    if (previous) {
      issues.push(
        `Número atômico ${element.atomicNumber} duplicado (${previous}, ${element.symbol}).`,
      );
    }
    numbers.set(element.atomicNumber, element.symbol);

    if (symbols.has(element.symbol)) issues.push(`Símbolo ${element.symbol} duplicado.`);
    symbols.add(element.symbol);
  }

  /* Citações */
  const known = new Set(references.map((reference) => reference.id));
  const used = new Set<string>();
  for (const element of elements) {
    for (const ref of new Set(collectCitationRefs(element))) {
      used.add(ref);
      if (!known.has(ref)) {
        issues.push(
          `${element.symbol}: cita a referência "${ref}", que não está no registro global.`,
        );
      }
    }
  }
  for (const reference of references) {
    if (!used.has(reference.id)) {
      warnings.push(`Referência "${reference.id}" registrada, mas nunca citada.`);
    }
  }

  /* Elegibilidade bibliográfica: papel das citações × `usage` da referência (após a existência) */
  const usageByRef = new Map(references.map((reference) => [reference.id, reference.usage]));
  for (const element of elements) {
    issues.push(...checkCitationEligibility(element, usageByRef, element.symbol));
  }

  if (issues.length > 0) throw new CatalogError(issues);

  return {
    elements: elements.toSorted((a, b) => a.atomicNumber - b.atomicNumber),
    references,
    warnings,
  };
}

export function findElementBySymbol(catalog: Catalog, symbol: string): Element | undefined {
  const wanted = symbol.toLowerCase();
  return catalog.elements.find((element) => element.symbol.toLowerCase() === wanted);
}

export function findReference(catalog: Catalog, id: string): Reference | undefined {
  return catalog.references.find((reference) => reference.id === id);
}

export function getCompleteness(catalog: Catalog): Completeness {
  const present = new Set(catalog.elements.map((element) => element.atomicNumber));
  const missing = Array.from({ length: ELEMENT_COUNT }, (_, index) => index + 1).filter(
    (n) => !present.has(n),
  );
  return { expected: ELEMENT_COUNT, registered: present.size, missing };
}

/** Catálogo real da aplicação, carregado de `src/data/elements/*.json` e `src/data/references.json`. */
const files = import.meta.glob('./elements/*.json', { eager: true, import: 'default' });

export const catalog: Catalog = buildCatalog(files, referencesRegistry);
