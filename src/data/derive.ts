import type { Subshell } from './schema/element.schema';

/**
 * Derivações a partir da configuração eletrônica por subcamadas.
 *
 * Convenção do projeto: subcamadas são exibidas na ordem de Madelung
 * (n + l crescente; empate por n crescente), como em ... 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p ...
 */

type Letter = Subshell['l'];

const L_VALUE: Record<Letter, number> = { s: 0, p: 1, d: 2, f: 3 };
const LETTERS: readonly Letter[] = ['s', 'p', 'd', 'f'];
const CAPACITY: Record<Letter, number> = { s: 2, p: 6, d: 10, f: 14 };

/** Rótulos das camadas, de n = 1 a n = 7. */
export const SHELL_LABELS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'] as const;

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

export function compareMadelung(
  a: Pick<Subshell, 'n' | 'l'>,
  b: Pick<Subshell, 'n' | 'l'>,
): number {
  const byNPlusL = a.n + L_VALUE[a.l] - (b.n + L_VALUE[b.l]);
  return byNPlusL !== 0 ? byNPlusL : a.n - b.n;
}

export function sortMadelung(subshells: readonly Subshell[]): Subshell[] {
  return [...subshells].sort(compareMadelung);
}

export function totalElectrons(subshells: readonly Subshell[]): number {
  return subshells.reduce((sum, subshell) => sum + subshell.electrons, 0);
}

/** Elétrons por camada: o índice 0 é a camada K (n = 1). */
export function deriveShells(subshells: readonly Subshell[]): number[] {
  const highest = Math.max(0, ...subshells.map((subshell) => subshell.n));
  const shells = Array.from({ length: highest }, () => 0);
  for (const subshell of subshells) {
    shells[subshell.n - 1] = (shells[subshell.n - 1] ?? 0) + subshell.electrons;
  }
  return shells;
}

/**
 * Preenchimento idealizado pela regra de Madelung (sem exceções).
 * NÃO representa a configuração real dos elementos: serve de núcleo de gás nobre
 * e de apoio a testes.
 */
export function madelungFill(electrons: number): Subshell[] {
  const order: Pick<Subshell, 'n' | 'l'>[] = [];
  for (let n = 1; n <= 7; n += 1) {
    for (const l of LETTERS) {
      if (L_VALUE[l] <= n - 1) order.push({ n, l });
    }
  }
  order.sort(compareMadelung);

  const result: Subshell[] = [];
  let remaining = electrons;
  for (const { n, l } of order) {
    if (remaining <= 0) break;
    const placed = Math.min(CAPACITY[l], remaining);
    result.push({ n, l, electrons: placed });
    remaining -= placed;
  }
  return result;
}

const NOBLE_GAS_CORES = [
  { symbol: 'Rn', electrons: 86 },
  { symbol: 'Xe', electrons: 54 },
  { symbol: 'Kr', electrons: 36 },
  { symbol: 'Ar', electrons: 18 },
  { symbol: 'Ne', electrons: 10 },
  { symbol: 'He', electrons: 2 },
] as const;

const keyOf = (subshell: Pick<Subshell, 'n' | 'l'>) => `${subshell.n}${subshell.l}`;

function formatSubshell(subshell: Subshell, superscript: boolean): string {
  const count = superscript
    ? String(subshell.electrons).replace(/\d/g, (digit) => SUPERSCRIPTS[digit] ?? digit)
    : String(subshell.electrons);
  return `${subshell.n}${subshell.l}${count}`;
}

export interface FormatOptions {
  /** Expoentes em Unicode (padrão: `true`). Com `false`, usa dígitos simples (ex.: "2p6"). */
  superscript?: boolean;
}

/** Configuração completa, ex.: "1s² 2s² 2p⁶". */
export function formatFullConfiguration(
  subshells: readonly Subshell[],
  options: FormatOptions = {},
): string {
  const superscript = options.superscript ?? true;
  return sortMadelung(subshells)
    .map((subshell) => formatSubshell(subshell, superscript))
    .join(' ');
}

/**
 * Configuração condensada com o núcleo do maior gás nobre contido na configuração,
 * ex.: "[Ne] 3s² 3p⁶". Sem núcleo possível (Z ≤ 2), devolve a configuração completa.
 */
export function formatCondensedConfiguration(
  subshells: readonly Subshell[],
  options: FormatOptions = {},
): string {
  const superscript = options.superscript ?? true;
  const total = totalElectrons(subshells);
  const byKey = new Map(subshells.map((subshell) => [keyOf(subshell), subshell]));

  for (const core of NOBLE_GAS_CORES) {
    if (core.electrons >= total) continue;
    const coreSubshells = madelungFill(core.electrons);
    const contained = coreSubshells.every(
      (coreSubshell) => byKey.get(keyOf(coreSubshell))?.electrons === coreSubshell.electrons,
    );
    if (!contained) continue;

    const coreKeys = new Set(coreSubshells.map(keyOf));
    const rest = sortMadelung(subshells.filter((subshell) => !coreKeys.has(keyOf(subshell))));
    const tail = rest.map((subshell) => formatSubshell(subshell, superscript));
    return [`[${core.symbol}]`, ...tail].join(' ');
  }
  return formatFullConfiguration(subshells, options);
}
