import type { Citation } from '@/data/schema/common';
import type { Element } from '@/data/schema/element.schema';
import type { Isotope } from '@/data/schema/isotope.schema';
import type { Reference } from '@/data/schema/reference.schema';

/**
 * Dados SINTÉTICOS usados apenas em testes de infraestrutura.
 * Não representam nenhum elemento real nem dado científico: símbolo "Tt",
 * valores fictícios e fontes inexistentes.
 */

/** Referência sintética incorporável (`usage: dados-incorporados`): origem dos dados de teste. */
export const FIXTURE_REF = 'fonte-de-teste';

/** Referência sintética apenas para citação (`usage: apenas-citacao`). */
export const FIXTURE_CITATION_ONLY_REF = 'fonte-so-citacao';

/*
 * Fábricas (e não constantes) para que cada fixture tenha seus próprios arrays de citações
 * e os testes possam alterar um bloco sem afetar os demais.
 */
/** Citação de dado estruturado: papel explícito `origem`, de referência incorporável. */
const origem = (): Citation[] => [{ ref: FIXTURE_REF, role: 'origem' }];
/** Citação de apoio, de referência apenas para citação. */
const apoio = (): Citation[] => [{ ref: FIXTURE_CITATION_ONLY_REF, role: 'apoio' }];
/** Citação de conteúdo autoral: sem papel. */
const texto = (): Citation[] => [{ ref: FIXTURE_REF }];

/** Referência apenas para citação (padrão dos testes do schema de referências). */
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

/** Referência incorporável: licença verificada e redistribuição permitida (sintética). */
export function makeIncorporableFixtureReference(overrides: Partial<Reference> = {}): Reference {
  return {
    id: FIXTURE_REF,
    kind: 'artigo',
    title: 'Fonte sintética de teste',
    tier: 'compilacao',
    usage: 'dados-incorporados',
    license: {
      status: 'verificada',
      redistribution: 'permitida',
      name: 'Licença sintética de teste',
      termsUrl: 'https://example.org/termos',
      attribution: 'Atribuição sintética de teste.',
      checkedAt: '2026-01-01',
    },
    ...overrides,
  };
}

/** Registro sintético mínimo: uma referência incorporável e uma apenas para citação. */
export function makeFixtureRegistry(): Reference[] {
  return [
    makeIncorporableFixtureReference(),
    makeFixtureReference({ id: FIXTURE_CITATION_ONLY_REF, title: 'Fonte sintética só de citação' }),
  ];
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
      citations: origem(),
    },
    halfLife: { status: 'estavel', provenance: 'experimental', citations: origem() },
    decayModes: [],
    citations: origem(),
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
    atomicMass: { form: 'valor', value: 4, unit: 'u', citations: origem() },
    electronConfiguration: {
      status: 'valor',
      subshells: [{ n: 1, l: 's', electrons: 2 }],
      provenance: 'experimental',
      citations: origem(),
    },
    phase: {
      status: 'valor',
      value: 'gasoso',
      conditions: { temperatureK: 298.15, pressureKPa: 100 },
      provenance: 'experimental',
      citations: origem(),
    },
    physical: {
      density: {
        status: 'valor',
        value: 1,
        unit: 'g/cm³',
        provenance: 'experimental',
        citations: origem(),
      },
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
        citations: origem(),
      },
    },
    appearance: { text: 'Aparência de teste.', citations: texto() },
    discovery: { year: null, discoverers: [], citations: origem() },
    etymology: { text: 'Etimologia de teste.', citations: texto() },
    summary: { text: 'Resumo de teste.', citations: texto() },
    uses: [{ text: 'Uso de teste.', citations: texto() }],
    isotopes: [makeFixtureIsotope()],
    ...overrides,
  };
}

/**
 * Elemento sintético com TODOS os blocos que carregam `citations` preenchidos, inclusive
 * estados `desconhecido` e `nao-aplicavel` com justificativa, citações de apoio, `tier2`,
 * classificação com citações e isótopos com abundância. Usado nos testes de completude.
 */
export function makeFullFixtureElement(overrides: Partial<Element> = {}): Element {
  const base = makeFixtureElement();
  const valor = () => ({ status: 'valor' as const, provenance: 'experimental' as const });
  return {
    ...base,
    classification: {
      status: 'predita',
      note: 'Classificação sintética de teste.',
      citations: [{ ref: FIXTURE_CITATION_ONLY_REF }],
    },
    physical: {
      density: { ...valor(), value: 1, unit: 'g/cm³', citations: origem() },
      meltingPoint: { status: 'desconhecido', reason: 'Nunca medido.', citations: apoio() },
      boilingPoint: { ...valor(), value: 2, unit: 'K', citations: origem() },
    },
    chemical: {
      electronegativityPauling: { ...valor(), value: 1, unit: 'adimensional', citations: origem() },
      covalentRadius: { ...valor(), value: 100, unit: 'pm', citations: origem() },
      vanDerWaalsRadius: {
        status: 'nao-aplicavel',
        reason: 'Não se define para o caso sintético.',
        citations: apoio(),
      },
      firstIonizationEnergy: { ...valor(), value: 10, unit: 'eV', citations: origem() },
      electronAffinity: { ...valor(), value: 1, unit: 'eV', citations: origem() },
      oxidationStates: {
        ...valor(),
        states: [{ value: 0, prevalence: 'comum' }],
        citations: origem(),
      },
    },
    tier2: {
      crystalStructure: { ...valor(), value: 'estrutura sintética', citations: origem() },
      thermalConductivity: { ...valor(), value: 1, unit: 'W/(m·K)', citations: origem() },
      specificHeat: { ...valor(), value: 1, unit: 'J/(g·K)', citations: origem() },
      heatOfFusion: { ...valor(), value: 1, unit: 'kJ/mol', citations: origem() },
      heatOfVaporization: { ...valor(), value: 1, unit: 'kJ/mol', citations: origem() },
      crustalAbundance: { ...valor(), value: 1, unit: 'mg/kg', citations: origem() },
    },
    uses: [
      { text: 'Primeiro uso de teste.', citations: texto() },
      { text: 'Segundo uso de teste.', citations: texto() },
    ],
    isotopes: [
      makeFixtureIsotope({
        massNumber: 4,
        halfLife: { ...valor(), value: 1000, unit: 's', citations: origem() },
        abundance: { ...valor(), value: 0.5, unit: 'fracao', citations: origem() },
        decayModes: [{ mode: 'alfa' }],
        spinParity: '0+',
      }),
      makeFixtureIsotope({ massNumber: 5 }),
    ],
    ...overrides,
  };
}
