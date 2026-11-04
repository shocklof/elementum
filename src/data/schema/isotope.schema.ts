import { z } from 'zod';
import {
  UNITS,
  citationsSchema,
  property,
  provenanceSchema,
  unknownMember,
  valueMember,
} from './common';

/**
 * Isótopos de um elemento.
 *
 * Regra de seleção (ver docs/convencoes-cientificas.md):
 * - elementos com isótopos naturais conhecidos: todos os naturais, sem limite de quantidade;
 * - elementos sem isótopos naturais conhecidos: até MAX_REPRESENTATIVE_ARTIFICIAL_ISOTOPES
 *   isótopos artificiais representativos, priorizando os de maior meia-vida confirmada;
 * - o isótopo de maior meia-vida confirmada sempre é incluído.
 *
 * As regras que dependem do conjunto de isótopos de um elemento são validadas em
 * element.schema.ts.
 */

/** Máximo de isótopos artificiais em um elemento sem isótopos naturais conhecidos. */
export const MAX_REPRESENTATIVE_ARTIFICIAL_ISOTOPES = 3;

export const decayModeSchema = z.enum([
  'alfa',
  'beta-menos',
  'beta-mais',
  'captura-eletronica',
  'fissao-espontanea',
  'transicao-isomerica',
  'emissao-de-proton',
  'emissao-de-neutron',
  'duplo-beta-menos',
  'duplo-beta-mais',
  'emissao-de-cluster',
  'outro',
]);

/**
 * Origem do nuclídeo:
 * - `primordial`: existe desde a formação da Terra (estável ou radioativo de vida longa);
 * - `cadeia-de-decaimento`: produzido continuamente por cadeias naturais de decaimento;
 * - `cosmogenico`: produzido por interação com raios cósmicos;
 * - `artificial`: sem ocorrência natural conhecida.
 */
export const isotopeOriginSchema = z.enum([
  'primordial',
  'cadeia-de-decaimento',
  'cosmogenico',
  'artificial',
]);

/**
 * Por que o isótopo foi incluído:
 * - `natural`: ocorre na natureza;
 * - `maior-meia-vida`: é o de maior meia-vida confirmada (define o número de massa IUPAC
 *   dos elementos sem massa atômica padrão);
 * - `representativo`: isótopo artificial representativo de um elemento sem isótopos naturais,
 *   escolhido priorizando a maior meia-vida confirmada.
 */
export const isotopeSelectionSchema = z.enum(['natural', 'maior-meia-vida', 'representativo']);

/** Meia-vida: valor em segundos, estável (observacionalmente) ou desconhecida. */
const halfLifeSchema = z.discriminatedUnion('status', [
  valueMember({
    value: z.number().positive(),
    unit: z.literal(UNITS.time),
    uncertainty: z.number().nonnegative().optional(),
  }),
  z.strictObject({
    status: z.literal('estavel'),
    provenance: provenanceSchema,
    citations: citationsSchema,
  }),
  unknownMember,
]);

export const isotopeSchema = z
  .strictObject({
    massNumber: z.number().int().min(1).max(400),
    /** Estado isomérico, quando aplicável (ex.: "m", "m2"). Sem valor = estado fundamental. */
    isomer: z
      .string()
      .regex(/^[mn]\d*$/)
      .optional(),
    origin: isotopeOriginSchema,
    selection: isotopeSelectionSchema,
    atomicMass: property(UNITS.atomicMass, z.number().positive()),
    halfLife: halfLifeSchema,
    /** Abundância isotópica natural terrestre (fração de 0 a 1). Só para nuclídeos naturais. */
    abundance: property(UNITS.fraction, z.number().min(0).max(1)).optional(),
    decayModes: z
      .array(
        z.strictObject({
          mode: decayModeSchema,
          /** Fração do decaimento por este modo (0–1). */
          branching: z.number().min(0).max(1).optional(),
          isUncertain: z.boolean().optional(),
          note: z.string().min(1).optional(),
        }),
      )
      .default([]),
    /** Spin e paridade, como publicado (ex.: "1/2+"). */
    spinParity: z.string().min(1).optional(),
    citations: citationsSchema,
  })
  .superRefine((isotope, ctx) => {
    const natural = isotope.origin !== 'artificial';
    if (isotope.selection === 'natural' && !natural) {
      ctx.addIssue({
        code: 'custom',
        path: ['selection'],
        message:
          'Seleção "natural" exige origem natural (primordial, cadeia-de-decaimento ou cosmogenico).',
      });
    }
    if (isotope.selection === 'representativo' && natural) {
      ctx.addIssue({
        code: 'custom',
        path: ['selection'],
        message: 'Seleção "representativo" é reservada a isótopos artificiais.',
      });
    }
    if (isotope.abundance && !natural) {
      ctx.addIssue({
        code: 'custom',
        path: ['abundance'],
        message: 'Abundância natural não se aplica a isótopo artificial.',
      });
    }
  });

export type Isotope = z.infer<typeof isotopeSchema>;
export type IsotopeOrigin = z.infer<typeof isotopeOriginSchema>;
