import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Convenções de unidades e condições (convenções do Elementum)                */
/* -------------------------------------------------------------------------- */

/** Unidades canônicas do Tier 1. Valores são sempre armazenados nestas unidades. */
export const UNITS = {
  temperature: 'K',
  density: 'g/cm³',
  length: 'pm',
  energy: 'eV',
  atomicMass: 'u',
  time: 's',
  dimensionless: 'adimensional',
  fraction: 'fracao',
} as const;

/**
 * Condições de referência adotadas pelo projeto para estado físico e densidade
 * (convenção do Elementum, a confirmar com a IUPAC na coleta de dados).
 */
export const REFERENCE_CONDITIONS = { temperatureK: 298.15, pressureKPa: 100 } as const;

/* -------------------------------------------------------------------------- */
/* Identificadores, proveniência e citações                                   */
/* -------------------------------------------------------------------------- */

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use um identificador em kebab-case.');

/**
 * Como o valor foi obtido:
 * - `experimental`: medido;
 * - `calculado`: obtido por cálculo teórico (ex.: química quântica relativística);
 * - `estimado`: extrapolação, sistemática ou tendência empírica.
 */
export const provenanceSchema = z.enum(['experimental', 'calculado', 'estimado']);

/** Citação rastreável: referência do registro global e, opcionalmente, o local exato. */
export const citationSchema = z.strictObject({
  ref: slugSchema,
  /** Ex.: "Tabela 3", "p. 14-12", "entrada Z=26". */
  locator: z.string().min(1).optional(),
});

export const citationsSchema = z
  .array(citationSchema)
  .min(1, 'Todo dado científico precisa de ao menos uma citação.');

export const conditionsSchema = z.strictObject({
  temperatureK: z.number().positive().optional(),
  pressureKPa: z.number().positive().optional(),
  note: z.string().min(1).optional(),
});

export type Provenance = z.infer<typeof provenanceSchema>;
export type Citation = z.infer<typeof citationSchema>;
export type Conditions = z.infer<typeof conditionsSchema>;

/* -------------------------------------------------------------------------- */
/* Estados de um dado: valor, desconhecido ou não aplicável                   */
/* -------------------------------------------------------------------------- */

/** Valor conhecido (com proveniência e citações) além dos campos específicos de `shape`. */
export function valueMember<S extends z.ZodRawShape>(shape: S) {
  return z.strictObject({
    status: z.literal('valor'),
    ...shape,
    provenance: provenanceSchema,
    citations: citationsSchema,
  });
}

/** Nunca foi determinado (ou não há dado confiável). */
export const unknownMember = z.strictObject({
  status: z.literal('desconhecido'),
  reason: z.string().min(1).optional(),
  citations: z.array(citationSchema).optional(),
});

/** A grandeza não existe ou não se define para o caso (ex.: ponto de fusão do hélio a 1 atm). */
export const notApplicableMember = z.strictObject({
  status: z.literal('nao-aplicavel'),
  reason: z.string().min(1, 'Explique por que a grandeza não se aplica.'),
  citations: z.array(citationSchema).optional(),
});

/** Dado que pode ser `valor`, `desconhecido` ou `nao-aplicavel`. */
export function withStatus<S extends z.ZodRawShape>(shape: S) {
  return z.discriminatedUnion('status', [valueMember(shape), unknownMember, notApplicableMember]);
}

/** Grandeza com unidade fixa, incerteza opcional e condições de medição. */
export function property<const U extends string>(unit: U, value: z.ZodNumber = z.number()) {
  return withStatus({
    value,
    unit: z.literal(unit),
    uncertainty: z.number().nonnegative().optional(),
    conditions: conditionsSchema.optional(),
  });
}

/** Texto em português com citações. */
export const sourcedTextSchema = z.strictObject({
  text: z.string().min(1),
  citations: citationsSchema,
});
