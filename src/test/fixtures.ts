import type { Element } from '@/data/schema/element.schema';

/**
 * Elemento SINTÉTICO usado apenas em testes de infraestrutura.
 * Não representa nenhum elemento real nem dado científico.
 */
export function makeFixtureElement(overrides: Partial<Element> = {}): Element {
  const sourceIds = ['fonte-de-teste'];
  return {
    atomicNumber: 2,
    symbol: 'Tt',
    name: 'Teste',
    family: 'gases-nobres',
    group: 18,
    period: 1,
    block: 's',
    tablePosition: { row: 1, column: 18 },
    atomicMass: { value: 1, kind: 'convencional', unit: 'u', sourceIds },
    electronConfiguration: { full: '1s2', condensed: '1s2', shells: [2], sourceIds },
    phase: { value: 'gasoso', sourceIds },
    physical: {
      density: { value: 1, unit: 'g/cm³', isEstimated: false, sourceIds },
      meltingPoint: null,
      boilingPoint: null,
    },
    chemical: {
      electronegativity: null,
      atomicRadius: null,
      firstIonizationEnergy: null,
      oxidationStates: { values: [0], sourceIds },
    },
    discovery: { year: null, discoverers: [], sourceIds },
    etymology: { text: 'Texto de teste.', sourceIds },
    summary: { text: 'Resumo de teste.', sourceIds },
    uses: [{ text: 'Uso de teste.', sourceIds }],
    references: [
      {
        id: 'fonte-de-teste',
        kind: 'site-institucional',
        title: 'Fonte sintética de teste',
        url: 'https://example.org/',
        accessedAt: '2026-01-01',
      },
    ],
    ...overrides,
  };
}
