import type { Element } from '@/data/schema/element.schema';
import type { Isotope } from '@/data/schema/isotope.schema';
import type { Reference } from '@/data/schema/reference.schema';

/**
 * Dados SINTÉTICOS usados apenas em testes de infraestrutura.
 * Não representam nenhum elemento real nem dado científico: símbolo "Tt",
 * valores fictícios e fonte inexistente.
 */

export const FIXTURE_REF = 'fonte-de-teste';
const citations = [{ ref: FIXTURE_REF }];

export function makeFixtureReference(overrides: Partial<Reference> = {}): Reference {
  return {
    id: FIXTURE_REF,
    kind: 'livro',
    title: 'Fonte sintética de teste',
    tier: 'primaria',
    usage: 'apenas-citacao',
    license: { status: 'nao-aplicavel' },
    ...overrides,
  };
}

export function makeFixtureIsotope(overrides: Partial<Isotope> = {}): Isotope {
  return {
    massNumber: 4,
    origin: 'primordial',
    selection: 'natural',
    atomicMass: {
      status: 'valor',
      value: 4,
      unit: 'u',
      provenance: 'experimental',
      citations,
    },
    halfLife: { status: 'estavel', provenance: 'experimental', citations },
    decayModes: [],
    citations,
    ...overrides,
  };
}

export function makeFixtureElement(overrides: Partial<Element> = {}): Element {
  return {
    atomicNumber: 2,
    symbol: 'Tt',
    names: { pt: 'Teste', en: 'Test' },
    family: 'gases-nobres',
    classification: { status: 'estabelecida' },
    atomicMass: { form: 'valor', value: 4, unit: 'u', citations },
    electronConfiguration: {
      status: 'valor',
      subshells: [{ n: 1, l: 's', electrons: 2 }],
      provenance: 'experimental',
      citations,
    },
    phase: {
      status: 'valor',
      value: 'gasoso',
      conditions: { temperatureK: 298.15, pressureKPa: 100 },
      provenance: 'experimental',
      citations,
    },
    physical: {
      density: { status: 'valor', value: 1, unit: 'g/cm³', provenance: 'experimental', citations },
      meltingPoint: { status: 'nao-aplicavel', reason: 'Valor fictício de teste.' },
      boilingPoint: { status: 'desconhecido' },
    },
    chemical: {
      electronegativityPauling: { status: 'desconhecido' },
      covalentRadius: { status: 'desconhecido' },
      vanDerWaalsRadius: { status: 'desconhecido' },
      firstIonizationEnergy: { status: 'desconhecido' },
      electronAffinity: { status: 'desconhecido' },
      oxidationStates: {
        status: 'valor',
        states: [{ value: 0, prevalence: 'comum' }],
        provenance: 'experimental',
        citations,
      },
    },
    appearance: { text: 'Aparência de teste.', citations },
    discovery: { year: null, discoverers: [], citations },
    etymology: { text: 'Etimologia de teste.', citations },
    summary: { text: 'Resumo de teste.', citations },
    uses: [{ text: 'Uso de teste.', citations }],
    isotopes: [makeFixtureIsotope()],
    ...overrides,
  };
}
