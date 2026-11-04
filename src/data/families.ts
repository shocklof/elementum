/**
 * Famílias de elementos.
 *
 * O `id` de cada família é também o nome do arquivo JSON correspondente em
 * `src/data/elements/<id>.json`. Cada elemento pertence a exatamente uma família.
 */
export const FAMILIES = [
  { id: 'metais-alcalinos', label: 'Metais alcalinos' },
  { id: 'metais-alcalino-terrosos', label: 'Metais alcalino-terrosos' },
  { id: 'metais-de-transicao', label: 'Metais de transição' },
  { id: 'metais-de-pos-transicao', label: 'Metais de pós-transição' },
  { id: 'semimetais', label: 'Semimetais' },
  { id: 'nao-metais', label: 'Não metais' },
  { id: 'halogenios', label: 'Halogênios' },
  { id: 'gases-nobres', label: 'Gases nobres' },
  { id: 'lantanideos', label: 'Lantanídeos' },
  { id: 'actinideos', label: 'Actinídeos' },
] as const;

export type FamilyId = (typeof FAMILIES)[number]['id'];

export const FAMILY_IDS = FAMILIES.map((family) => family.id) as [FamilyId, ...FamilyId[]];

export function isFamilyId(value: string): value is FamilyId {
  return (FAMILY_IDS as readonly string[]).includes(value);
}

export function getFamilyLabel(id: FamilyId): string {
  return FAMILIES.find((family) => family.id === id)?.label ?? id;
}
