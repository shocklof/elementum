/**
 * Layout da tabela periódica: única fonte de grupo, período, bloco e posição
 * visual dos 118 elementos.
 *
 * CONVENÇÃO DO PROJETO (não é norma da IUPAC): o grupo 3 é composto por
 * Sc, Y, Lu e Lr, e o bloco f tem 14 colunas (La–Yb e Ac–No). A IUPAC discute
 * as duas composições possíveis (Sc-Y-Lu-Lr e Sc-Y-La-Ac) e, até onde foi possível
 * verificar, não declara decisão final. Ver docs/convencoes-cientificas.md.
 *
 * Família química e posição são independentes: Lu e Lr ocupam o grupo 3 (bloco d),
 * mas pertencem às famílias lantanídeos e actinídeos (nomes coletivos IUPAC).
 *
 * Grade: linhas 1–7 formam o corpo principal; as linhas 8 (lantanídeos) e 9
 * (actinídeos) são as séries f, nas colunas 3–16. O espaço visual entre o corpo
 * principal e as séries f é responsabilidade da interface.
 */

export type Block = 's' | 'p' | 'd' | 'f';

export interface ElementPosition {
  readonly atomicNumber: number;
  readonly symbol: string;
  /** Grupo IUPAC (1–18). `null` para os elementos do bloco f (sem grupo). */
  readonly group: number | null;
  readonly period: number;
  readonly block: Block;
  /** Linha da grade (1–9). */
  readonly row: number;
  /** Coluna da grade (1–18). */
  readonly column: number;
}

export const ELEMENT_COUNT = 118;
export const GRID_ROWS = 9;
export const GRID_COLUMNS = 18;

type LayoutRow = readonly [
  atomicNumber: number,
  symbol: string,
  group: number | null,
  period: number,
  block: Block,
  row: number,
  column: number,
];

const LAYOUT_ROWS: readonly LayoutRow[] = [
  [1, 'H', 1, 1, 's', 1, 1],
  [2, 'He', 18, 1, 's', 1, 18],
  [3, 'Li', 1, 2, 's', 2, 1],
  [4, 'Be', 2, 2, 's', 2, 2],
  [5, 'B', 13, 2, 'p', 2, 13],
  [6, 'C', 14, 2, 'p', 2, 14],
  [7, 'N', 15, 2, 'p', 2, 15],
  [8, 'O', 16, 2, 'p', 2, 16],
  [9, 'F', 17, 2, 'p', 2, 17],
  [10, 'Ne', 18, 2, 'p', 2, 18],
  [11, 'Na', 1, 3, 's', 3, 1],
  [12, 'Mg', 2, 3, 's', 3, 2],
  [13, 'Al', 13, 3, 'p', 3, 13],
  [14, 'Si', 14, 3, 'p', 3, 14],
  [15, 'P', 15, 3, 'p', 3, 15],
  [16, 'S', 16, 3, 'p', 3, 16],
  [17, 'Cl', 17, 3, 'p', 3, 17],
  [18, 'Ar', 18, 3, 'p', 3, 18],
  [19, 'K', 1, 4, 's', 4, 1],
  [20, 'Ca', 2, 4, 's', 4, 2],
  [21, 'Sc', 3, 4, 'd', 4, 3],
  [22, 'Ti', 4, 4, 'd', 4, 4],
  [23, 'V', 5, 4, 'd', 4, 5],
  [24, 'Cr', 6, 4, 'd', 4, 6],
  [25, 'Mn', 7, 4, 'd', 4, 7],
  [26, 'Fe', 8, 4, 'd', 4, 8],
  [27, 'Co', 9, 4, 'd', 4, 9],
  [28, 'Ni', 10, 4, 'd', 4, 10],
  [29, 'Cu', 11, 4, 'd', 4, 11],
  [30, 'Zn', 12, 4, 'd', 4, 12],
  [31, 'Ga', 13, 4, 'p', 4, 13],
  [32, 'Ge', 14, 4, 'p', 4, 14],
  [33, 'As', 15, 4, 'p', 4, 15],
  [34, 'Se', 16, 4, 'p', 4, 16],
  [35, 'Br', 17, 4, 'p', 4, 17],
  [36, 'Kr', 18, 4, 'p', 4, 18],
  [37, 'Rb', 1, 5, 's', 5, 1],
  [38, 'Sr', 2, 5, 's', 5, 2],
  [39, 'Y', 3, 5, 'd', 5, 3],
  [40, 'Zr', 4, 5, 'd', 5, 4],
  [41, 'Nb', 5, 5, 'd', 5, 5],
  [42, 'Mo', 6, 5, 'd', 5, 6],
  [43, 'Tc', 7, 5, 'd', 5, 7],
  [44, 'Ru', 8, 5, 'd', 5, 8],
  [45, 'Rh', 9, 5, 'd', 5, 9],
  [46, 'Pd', 10, 5, 'd', 5, 10],
  [47, 'Ag', 11, 5, 'd', 5, 11],
  [48, 'Cd', 12, 5, 'd', 5, 12],
  [49, 'In', 13, 5, 'p', 5, 13],
  [50, 'Sn', 14, 5, 'p', 5, 14],
  [51, 'Sb', 15, 5, 'p', 5, 15],
  [52, 'Te', 16, 5, 'p', 5, 16],
  [53, 'I', 17, 5, 'p', 5, 17],
  [54, 'Xe', 18, 5, 'p', 5, 18],
  [55, 'Cs', 1, 6, 's', 6, 1],
  [56, 'Ba', 2, 6, 's', 6, 2],
  [57, 'La', null, 6, 'f', 8, 3],
  [58, 'Ce', null, 6, 'f', 8, 4],
  [59, 'Pr', null, 6, 'f', 8, 5],
  [60, 'Nd', null, 6, 'f', 8, 6],
  [61, 'Pm', null, 6, 'f', 8, 7],
  [62, 'Sm', null, 6, 'f', 8, 8],
  [63, 'Eu', null, 6, 'f', 8, 9],
  [64, 'Gd', null, 6, 'f', 8, 10],
  [65, 'Tb', null, 6, 'f', 8, 11],
  [66, 'Dy', null, 6, 'f', 8, 12],
  [67, 'Ho', null, 6, 'f', 8, 13],
  [68, 'Er', null, 6, 'f', 8, 14],
  [69, 'Tm', null, 6, 'f', 8, 15],
  [70, 'Yb', null, 6, 'f', 8, 16],
  [71, 'Lu', 3, 6, 'd', 6, 3],
  [72, 'Hf', 4, 6, 'd', 6, 4],
  [73, 'Ta', 5, 6, 'd', 6, 5],
  [74, 'W', 6, 6, 'd', 6, 6],
  [75, 'Re', 7, 6, 'd', 6, 7],
  [76, 'Os', 8, 6, 'd', 6, 8],
  [77, 'Ir', 9, 6, 'd', 6, 9],
  [78, 'Pt', 10, 6, 'd', 6, 10],
  [79, 'Au', 11, 6, 'd', 6, 11],
  [80, 'Hg', 12, 6, 'd', 6, 12],
  [81, 'Tl', 13, 6, 'p', 6, 13],
  [82, 'Pb', 14, 6, 'p', 6, 14],
  [83, 'Bi', 15, 6, 'p', 6, 15],
  [84, 'Po', 16, 6, 'p', 6, 16],
  [85, 'At', 17, 6, 'p', 6, 17],
  [86, 'Rn', 18, 6, 'p', 6, 18],
  [87, 'Fr', 1, 7, 's', 7, 1],
  [88, 'Ra', 2, 7, 's', 7, 2],
  [89, 'Ac', null, 7, 'f', 9, 3],
  [90, 'Th', null, 7, 'f', 9, 4],
  [91, 'Pa', null, 7, 'f', 9, 5],
  [92, 'U', null, 7, 'f', 9, 6],
  [93, 'Np', null, 7, 'f', 9, 7],
  [94, 'Pu', null, 7, 'f', 9, 8],
  [95, 'Am', null, 7, 'f', 9, 9],
  [96, 'Cm', null, 7, 'f', 9, 10],
  [97, 'Bk', null, 7, 'f', 9, 11],
  [98, 'Cf', null, 7, 'f', 9, 12],
  [99, 'Es', null, 7, 'f', 9, 13],
  [100, 'Fm', null, 7, 'f', 9, 14],
  [101, 'Md', null, 7, 'f', 9, 15],
  [102, 'No', null, 7, 'f', 9, 16],
  [103, 'Lr', 3, 7, 'd', 7, 3],
  [104, 'Rf', 4, 7, 'd', 7, 4],
  [105, 'Db', 5, 7, 'd', 7, 5],
  [106, 'Sg', 6, 7, 'd', 7, 6],
  [107, 'Bh', 7, 7, 'd', 7, 7],
  [108, 'Hs', 8, 7, 'd', 7, 8],
  [109, 'Mt', 9, 7, 'd', 7, 9],
  [110, 'Ds', 10, 7, 'd', 7, 10],
  [111, 'Rg', 11, 7, 'd', 7, 11],
  [112, 'Cn', 12, 7, 'd', 7, 12],
  [113, 'Nh', 13, 7, 'p', 7, 13],
  [114, 'Fl', 14, 7, 'p', 7, 14],
  [115, 'Mc', 15, 7, 'p', 7, 15],
  [116, 'Lv', 16, 7, 'p', 7, 16],
  [117, 'Ts', 17, 7, 'p', 7, 17],
  [118, 'Og', 18, 7, 'p', 7, 18],
];

export const LAYOUT: readonly ElementPosition[] = LAYOUT_ROWS.map(
  ([atomicNumber, symbol, group, period, block, row, column]) => ({
    atomicNumber,
    symbol,
    group,
    period,
    block,
    row,
    column,
  }),
);

const byNumber = new Map(LAYOUT.map((position) => [position.atomicNumber, position]));
const bySymbol = new Map(LAYOUT.map((position) => [position.symbol.toLowerCase(), position]));
const byCell = new Map(LAYOUT.map((position) => [`${position.row}:${position.column}`, position]));

export function getPosition(atomicNumber: number): ElementPosition | undefined {
  return byNumber.get(atomicNumber);
}

/** Busca por símbolo, ignorando maiúsculas e minúsculas. */
export function getPositionBySymbol(symbol: string): ElementPosition | undefined {
  return bySymbol.get(symbol.toLowerCase());
}

export function getElementAt(row: number, column: number): ElementPosition | undefined {
  return byCell.get(`${row}:${column}`);
}
