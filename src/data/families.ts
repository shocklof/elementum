/**
 * Famílias de elementos.
 *
 * O `id` de cada família é também o nome do arquivo JSON correspondente em
 * `src/data/elements/<id>.json`. Cada elemento pertence a exatamente uma família.
 *
 * Família (classificação química) é independente da posição na tabela, que fica
 * em `layout.ts`. Ver docs/convencoes-cientificas.md.
 */

/** Silhuetas dos marcadores geométricos, exclusivas por família (acessibilidade: WCAG 1.4.1). */
export const FAMILY_MARKERS = [
  'circulo',
  'quadrado',
  'losango',
  'triangulo',
  'hexagono',
  'cruz',
  'triangulo-invertido',
  'estrela',
  'semicirculo',
  'barra',
] as const;

export type FamilyMarker = (typeof FAMILY_MARKERS)[number];

/**
 * Origem do critério de classificação da família:
 * - `iupac`: nome coletivo ou critério definido pela IUPAC;
 * - `convencao`: sem definição IUPAC; convenção do Elementum documentada.
 */
export type ClassificationBasis = 'iupac' | 'convencao';

export const FAMILIES = [
  { id: 'metais-alcalinos', label: 'Metais alcalinos', marker: 'circulo', basis: 'iupac' },
  {
    id: 'metais-alcalino-terrosos',
    label: 'Metais alcalino-terrosos',
    marker: 'quadrado',
    basis: 'iupac',
  },
  { id: 'metais-do-bloco-d', label: 'Metais do bloco d', marker: 'losango', basis: 'convencao' },
  {
    id: 'metais-de-pos-transicao',
    label: 'Metais de pós-transição',
    marker: 'triangulo',
    basis: 'convencao',
  },
  { id: 'semimetais', label: 'Semimetais (metaloides)', marker: 'hexagono', basis: 'convencao' },
  { id: 'nao-metais', label: 'Não metais', marker: 'cruz', basis: 'convencao' },
  { id: 'halogenios', label: 'Halogênios', marker: 'triangulo-invertido', basis: 'iupac' },
  { id: 'gases-nobres', label: 'Gases nobres', marker: 'estrela', basis: 'iupac' },
  { id: 'lantanideos', label: 'Lantanídeos', marker: 'semicirculo', basis: 'iupac' },
  { id: 'actinideos', label: 'Actinídeos', marker: 'barra', basis: 'iupac' },
] as const satisfies readonly {
  id: string;
  label: string;
  marker: FamilyMarker;
  basis: ClassificationBasis;
}[];

export type FamilyId = (typeof FAMILIES)[number]['id'];

export const FAMILY_IDS = FAMILIES.map((family) => family.id) as [FamilyId, ...FamilyId[]];

export function isFamilyId(value: string): value is FamilyId {
  return (FAMILY_IDS as readonly string[]).includes(value);
}

export function getFamily(id: FamilyId) {
  const family = FAMILIES.find((candidate) => candidate.id === id);
  if (!family) throw new Error(`Família desconhecida: ${id}`);
  return family;
}

export function getFamilyLabel(id: FamilyId): string {
  return getFamily(id).label;
}

/** Variável CSS com a cor da família (definida em src/styles/tokens.css). */
export function getFamilyColorVar(id: FamilyId): string {
  return `var(--color-family-${id})`;
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

/**
 * Pertinência canônica por família (números atômicos). É uma convenção do projeto:
 * ver docs/convencoes-cientificas.md.
 *
 * - "Metais do bloco d" é um critério posicional (grupos 3–12, incluindo Zn, Cd e Hg),
 *   mas Lu e Lr, embora ocupem o grupo 3, pertencem a lantanídeos e actinídeos.
 * - Elementos superpesados ficam na família do seu grupo; a evidência de cada um
 *   é registrada em `classification` (estabelecida ou predita).
 */
export const FAMILY_MEMBERS: Readonly<Record<FamilyId, readonly number[]>> = {
  'metais-alcalinos': [3, 11, 19, 37, 55, 87],
  'metais-alcalino-terrosos': [4, 12, 20, 38, 56, 88],
  'metais-do-bloco-d': [
    21,
    ...range(22, 30),
    39,
    ...range(40, 48),
    ...range(72, 80),
    ...range(104, 112),
  ],
  'metais-de-pos-transicao': [13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116],
  semimetais: [5, 14, 32, 33, 51, 52],
  'nao-metais': [1, 6, 7, 8, 15, 16, 34],
  halogenios: [9, 17, 35, 53, 85, 117],
  'gases-nobres': [2, 10, 18, 36, 54, 86, 118],
  lantanideos: range(57, 71),
  actinideos: range(89, 103),
};
