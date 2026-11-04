import { z } from 'zod';
import { isFamilyId } from './families';
import { ELEMENT_COUNT, elementSchema, type Element } from './schema/element.schema';

export interface Catalog {
  /** Elementos ordenados por número atômico. */
  readonly elements: readonly Element[];
}

export interface Completeness {
  expected: number;
  registered: number;
  missing: number[];
}

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

/**
 * Valida e consolida os arquivos JSON de elementos.
 *
 * @param files mapa `caminho -> conteúdo`, onde o nome do arquivo é o id da família.
 * @throws CatalogError com todos os problemas encontrados.
 */
export function buildCatalog(files: Record<string, unknown>): Catalog {
  const issues: string[] = [];
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

  const numbers = new Map<number, string>();
  const symbols = new Map<string, string>();
  for (const element of elements) {
    const previousNumber = numbers.get(element.atomicNumber);
    if (previousNumber) {
      issues.push(
        `Número atômico ${element.atomicNumber} duplicado (${previousNumber}, ${element.symbol}).`,
      );
    }
    numbers.set(element.atomicNumber, element.symbol);

    const previousSymbol = symbols.get(element.symbol);
    if (previousSymbol) {
      issues.push(`Símbolo ${element.symbol} duplicado.`);
    }
    symbols.set(element.symbol, element.name);
  }

  if (issues.length > 0) throw new CatalogError(issues);

  return { elements: elements.toSorted((a, b) => a.atomicNumber - b.atomicNumber) };
}

export function findElementBySymbol(catalog: Catalog, symbol: string): Element | undefined {
  const wanted = symbol.toLowerCase();
  return catalog.elements.find((element) => element.symbol.toLowerCase() === wanted);
}

export function getCompleteness(catalog: Catalog): Completeness {
  const present = new Set(catalog.elements.map((element) => element.atomicNumber));
  const missing = Array.from({ length: ELEMENT_COUNT }, (_, index) => index + 1).filter(
    (n) => !present.has(n),
  );
  return { expected: ELEMENT_COUNT, registered: present.size, missing };
}

/** Catálogo real da aplicação, carregado de `src/data/elements/*.json`. */
const files = import.meta.glob('./elements/*.json', { eager: true, import: 'default' });

export const catalog: Catalog = buildCatalog(files);
