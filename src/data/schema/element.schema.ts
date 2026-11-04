import { z } from 'zod';
import { FAMILY_IDS } from '../families';
import { ELEMENT_COUNT } from '../layout';
import {
  UNITS,
  citationSchema,
  citationsSchema,
  conditionsSchema,
  property,
  sourcedTextSchema,
  withStatus,
} from './common';
import { MAX_REPRESENTATIVE_ARTIFICIAL_ISOTOPES, isotopeSchema } from './isotope.schema';

/**
 * A partir deste número atômico, a classificação de cada elemento precisa ser
 * revisada individualmente e documentada com nota e citações (decisão do projeto).
 */
export const CLASSIFICATION_REVIEW_MIN_Z = 99;

/* -------------------------------------------------------------------------- */
/* Classificação                                                              */
/* -------------------------------------------------------------------------- */

/**
 * - `estabelecida`: a pertinência à família é sustentada por definição IUPAC ou por
 *   caracterização química experimental;
 * - `predita`: baseada em posição na tabela ou em cálculos, sem confirmação experimental.
 */
export const classificationSchema = z.strictObject({
  status: z.enum(['estabelecida', 'predita']),
  /** Evidência e justificativa. Obrigatória para `predita` e para Z ≥ 99. */
  note: z.string().min(1).optional(),
  citations: z.array(citationSchema).optional(),
});

/* -------------------------------------------------------------------------- */
/* Massa atômica                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Três formas (como o CIAAW e a IUPAC as apresentam):
 * - `valor`: valor padrão com incerteza;
 * - `intervalo`: composição isotópica variável; limites e valor abreviado;
 * - `numero-de-massa`: sem valor padrão; número de massa do nuclídeo de maior
 *   meia-vida confirmada (exibido entre colchetes).
 */
export const atomicMassSchema = z.discriminatedUnion('form', [
  z.strictObject({
    form: z.literal('valor'),
    value: z.number().positive(),
    uncertainty: z.number().nonnegative().optional(),
    unit: z.literal(UNITS.atomicMass),
    citations: citationsSchema,
  }),
  z
    .strictObject({
      form: z.literal('intervalo'),
      lower: z.number().positive(),
      upper: z.number().positive(),
      abridged: z.strictObject({
        value: z.number().positive(),
        uncertainty: z.number().nonnegative().optional(),
      }),
      unit: z.literal(UNITS.atomicMass),
      citations: citationsSchema,
    })
    .refine((mass) => mass.lower < mass.upper, {
      path: ['lower'],
      message: 'O limite inferior deve ser menor que o superior.',
    }),
  z.strictObject({
    form: z.literal('numero-de-massa'),
    massNumber: z.number().int().min(1).max(400),
    citations: citationsSchema,
  }),
]);

/* -------------------------------------------------------------------------- */
/* Configuração eletrônica                                                    */
/* -------------------------------------------------------------------------- */

export const SUBSHELL_CAPACITY = { s: 2, p: 6, d: 10, f: 14 } as const;

export const subshellSchema = z.strictObject({
  n: z.number().int().min(1).max(8),
  l: z.enum(['s', 'p', 'd', 'f']),
  electrons: z.number().int().min(1),
});

/** Estado fundamental do átomo neutro, por subcamadas. Camadas e strings são derivadas (derive.ts). */
const electronConfigurationSchema = withStatus({
  subshells: z.array(subshellSchema).min(1),
});

/* -------------------------------------------------------------------------- */
/* Propriedades                                                               */
/* -------------------------------------------------------------------------- */

const phaseSchema = withStatus({
  value: z.enum(['solido', 'liquido', 'gasoso']),
  /** Condições em que o estado físico vale (referência do projeto: 298,15 K e 100 kPa). */
  conditions: conditionsSchema,
});

const oxidationStatesSchema = withStatus({
  states: z
    .array(
      z.strictObject({
        value: z.number().int().min(-5).max(9),
        /** `condicoes-extremas`: observado só em condições especiais (ex.: fase gasosa, matriz). */
        prevalence: z.enum(['comum', 'raro', 'condicoes-extremas']),
        note: z.string().min(1).optional(),
      }),
    )
    .min(1),
});

const positive = z.number().positive();

/** Propriedades do Tier 2: opcionais, incluídas quando houver dado confiável. */
const tier2Schema = z.strictObject({
  crystalStructure: withStatus({
    value: z.string().min(1),
    conditions: conditionsSchema.optional(),
  }).optional(),
  thermalConductivity: property('W/(m·K)', positive).optional(),
  specificHeat: property('J/(g·K)', positive).optional(),
  heatOfFusion: property('kJ/mol', positive).optional(),
  heatOfVaporization: property('kJ/mol', positive).optional(),
  crustalAbundance: property('mg/kg', z.number().nonnegative()).optional(),
});

/* -------------------------------------------------------------------------- */
/* Elemento                                                                   */
/* -------------------------------------------------------------------------- */

export const elementSchema = z
  .strictObject({
    atomicNumber: z.number().int().min(1).max(ELEMENT_COUNT),
    symbol: z.string().regex(/^[A-Z][a-z]{0,2}$/, 'Símbolo químico inválido.'),
    names: z.strictObject({ pt: z.string().min(1), en: z.string().min(1) }),

    family: z.enum(FAMILY_IDS),
    classification: classificationSchema,

    atomicMass: atomicMassSchema,
    electronConfiguration: electronConfigurationSchema,
    phase: phaseSchema,

    physical: z.strictObject({
      density: property(UNITS.density, positive),
      meltingPoint: property(UNITS.temperature, positive),
      boilingPoint: property(UNITS.temperature, positive),
    }),

    chemical: z.strictObject({
      /** Escala de Pauling. */
      electronegativityPauling: property(UNITS.dimensionless, z.number().nonnegative()),
      covalentRadius: property(UNITS.length, positive),
      vanDerWaalsRadius: property(UNITS.length, positive),
      firstIonizationEnergy: property(UNITS.energy, positive),
      electronAffinity: property(UNITS.energy),
      oxidationStates: oxidationStatesSchema,
    }),

    tier2: tier2Schema.optional(),

    appearance: sourcedTextSchema,
    discovery: z.strictObject({
      /** `null` para elementos conhecidos desde a Antiguidade. */
      year: z.number().int().min(1600).max(2100).nullable(),
      discoverers: z.array(z.string().min(1)),
      note: z.string().min(1).optional(),
      citations: citationsSchema,
    }),
    etymology: sourcedTextSchema,
    summary: sourcedTextSchema,
    uses: z.array(sourcedTextSchema),

    isotopes: z.array(isotopeSchema).min(1),
  })
  .superRefine((element, ctx) => {
    /* Classificação */
    const { classification } = element;
    if (classification.status === 'predita' && !classification.note) {
      ctx.addIssue({
        code: 'custom',
        path: ['classification', 'note'],
        message: 'Classificação "predita" exige uma nota com a base da previsão.',
      });
    }
    if (element.atomicNumber >= CLASSIFICATION_REVIEW_MIN_Z) {
      if (!classification.note) {
        ctx.addIssue({
          code: 'custom',
          path: ['classification', 'note'],
          message: `Elementos com Z ≥ ${CLASSIFICATION_REVIEW_MIN_Z} exigem nota de classificação.`,
        });
      }
      if (!classification.citations || classification.citations.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['classification', 'citations'],
          message: `Elementos com Z ≥ ${CLASSIFICATION_REVIEW_MIN_Z} exigem citações da evidência de classificação.`,
        });
      }
    }

    /* Configuração eletrônica */
    const config = element.electronConfiguration;
    if (config.status === 'valor') {
      const seen = new Set<string>();
      let total = 0;
      config.subshells.forEach((subshell, index) => {
        total += subshell.electrons;
        const key = `${subshell.n}${subshell.l}`;
        if (seen.has(key)) {
          ctx.addIssue({
            code: 'custom',
            path: ['electronConfiguration', 'subshells', index],
            message: `Subcamada ${key} repetida.`,
          });
        }
        seen.add(key);

        const letterIndex = { s: 0, p: 1, d: 2, f: 3 }[subshell.l];
        if (letterIndex > subshell.n - 1) {
          ctx.addIssue({
            code: 'custom',
            path: ['electronConfiguration', 'subshells', index, 'l'],
            message: `A subcamada ${key} não existe (l deve ser menor que n).`,
          });
        }
        if (subshell.electrons > SUBSHELL_CAPACITY[subshell.l]) {
          ctx.addIssue({
            code: 'custom',
            path: ['electronConfiguration', 'subshells', index, 'electrons'],
            message: `A subcamada ${key} comporta no máximo ${SUBSHELL_CAPACITY[subshell.l]} elétrons.`,
          });
        }
      });
      if (total !== element.atomicNumber) {
        ctx.addIssue({
          code: 'custom',
          path: ['electronConfiguration', 'subshells'],
          message: `A soma dos elétrons (${total}) deve ser igual ao número atômico (${element.atomicNumber}).`,
        });
      }
    }

    /* Isótopos */
    const seenIsotopes = new Set<string>();
    element.isotopes.forEach((isotope, index) => {
      const key = `${isotope.massNumber}${isotope.isomer ?? ''}`;
      if (seenIsotopes.has(key)) {
        ctx.addIssue({
          code: 'custom',
          path: ['isotopes', index],
          message: `Isótopo ${element.symbol}-${key} repetido.`,
        });
      }
      seenIsotopes.add(key);
      if (isotope.massNumber < element.atomicNumber) {
        ctx.addIssue({
          code: 'custom',
          path: ['isotopes', index, 'massNumber'],
          message: `O número de massa (${isotope.massNumber}) não pode ser menor que o número atômico (${element.atomicNumber}).`,
        });
      }
    });

    /*
     * Quantidade de isótopos:
     * - naturais: sem limite;
     * - sem isótopos naturais: até MAX_REPRESENTATIVE_ARTIFICIAL_ISOTOPES artificiais;
     * - com isótopos naturais: o único artificial admitido é o de maior meia-vida confirmada.
     */
    const hasNatural = element.isotopes.some((isotope) => isotope.origin !== 'artificial');
    const artificialIndexes = element.isotopes.flatMap((isotope, index) =>
      isotope.origin === 'artificial' ? [index] : [],
    );
    if (!hasNatural) {
      if (artificialIndexes.length > MAX_REPRESENTATIVE_ARTIFICIAL_ISOTOPES) {
        ctx.addIssue({
          code: 'custom',
          path: ['isotopes'],
          message: `Elemento sem isótopos naturais admite no máximo ${MAX_REPRESENTATIVE_ARTIFICIAL_ISOTOPES} isótopos artificiais representativos (há ${artificialIndexes.length}).`,
        });
      }
    } else {
      artificialIndexes.forEach((index, order) => {
        const isotope = element.isotopes[index];
        if (isotope?.selection !== 'maior-meia-vida') {
          ctx.addIssue({
            code: 'custom',
            path: ['isotopes', index, 'selection'],
            message:
              'Elemento com isótopos naturais só admite um isótopo artificial: o de maior meia-vida confirmada (selection "maior-meia-vida").',
          });
        } else if (order > 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['isotopes', index],
            message:
              'Elemento com isótopos naturais admite no máximo um isótopo artificial (o de maior meia-vida confirmada).',
          });
        }
      });
    }

    /* O número de massa entre colchetes deve corresponder a um isótopo registrado. */
    if (element.atomicMass.form === 'numero-de-massa') {
      const { massNumber } = element.atomicMass;
      const registered = element.isotopes.some(
        (isotope) => isotope.massNumber === massNumber && !isotope.isomer,
      );
      if (!registered) {
        ctx.addIssue({
          code: 'custom',
          path: ['atomicMass', 'massNumber'],
          message: `O isótopo ${element.symbol}-${massNumber} (maior meia-vida) deve constar em "isotopes".`,
        });
      }
    }
  });

export type Element = z.infer<typeof elementSchema>;
export type Classification = z.infer<typeof classificationSchema>;
export type AtomicMass = z.infer<typeof atomicMassSchema>;
export type Subshell = z.infer<typeof subshellSchema>;
