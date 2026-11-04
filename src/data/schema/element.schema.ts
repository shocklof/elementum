import { z } from 'zod';
import { FAMILY_IDS } from '../families';

/** Número total de elementos químicos reconhecidos. */
export const ELEMENT_COUNT = 118;

/* -------------------------------------------------------------------------- */
/* Referências científicas                                                    */
/* -------------------------------------------------------------------------- */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use um identificador em kebab-case.');

export const referenceSchema = z.strictObject({
  id: slug,
  kind: z.enum(['base-de-dados', 'artigo', 'livro', 'norma-iupac', 'site-institucional']),
  title: z.string().min(1),
  authors: z.array(z.string().min(1)).optional(),
  publisher: z.string().min(1).optional(),
  year: z.number().int().min(1500).max(2100).optional(),
  url: z.url().optional(),
  /** Data de acesso à fonte, no formato AAAA-MM-DD. */
  accessedAt: z.iso.date().optional(),
});

/** Lista de ids de referências (obrigatória em todo dado científico). */
const sourceIds = z.array(slug).min(1, 'Todo dado científico precisa de ao menos uma referência.');

/* -------------------------------------------------------------------------- */
/* Blocos reutilizáveis                                                       */
/* -------------------------------------------------------------------------- */

/** Grandeza física com unidade, incerteza opcional e indicação de valor estimado. */
export const measurementSchema = z.strictObject({
  value: z.number(),
  unit: z.string().min(1),
  uncertainty: z.number().nonnegative().optional(),
  /** `true` quando o valor é previsto/estimado, não medido (ex.: elementos superpesados). */
  isEstimated: z.boolean().default(false),
  sourceIds,
});

/** `null` significa "valor desconhecido ou não determinado". */
const optionalMeasurement = measurementSchema.nullable();

const sourcedText = z.strictObject({
  text: z.string().min(1),
  sourceIds,
});

/* -------------------------------------------------------------------------- */
/* Elemento                                                                   */
/* -------------------------------------------------------------------------- */

export const elementSchema = z
  .strictObject({
    atomicNumber: z.number().int().min(1).max(ELEMENT_COUNT),
    symbol: z.string().regex(/^[A-Z][a-z]{0,2}$/, 'Símbolo químico inválido.'),
    name: z.string().min(1),
    family: z.enum(FAMILY_IDS),

    /** Grupo IUPAC (1–18). `null` quando não se aplica (ex.: série f). */
    group: z.number().int().min(1).max(18).nullable(),
    period: z.number().int().min(1).max(7),
    block: z.enum(['s', 'p', 'd', 'f']),

    /** Posição na grade de exibição (linhas 8–9 reservadas à série f). */
    tablePosition: z.strictObject({
      row: z.number().int().min(1).max(9),
      column: z.number().int().min(1).max(18),
    }),

    atomicMass: z.strictObject({
      value: z.number().positive(),
      uncertainty: z.number().nonnegative().optional(),
      /** `numero-de-massa`: isótopo mais estável, usado quando não há massa padrão. */
      kind: z.enum(['padrao', 'convencional', 'numero-de-massa']),
      unit: z.literal('u'),
      sourceIds,
    }),

    electronConfiguration: z.strictObject({
      full: z.string().min(1),
      condensed: z.string().min(1),
      /** Elétrons por camada (K, L, M, …), usado pelo visualizador atômico. */
      shells: z.array(z.number().int().positive()).min(1).max(7),
      sourceIds,
    }),

    /** Estado físico em condições ambientes. */
    phase: z.strictObject({
      value: z.enum(['solido', 'liquido', 'gasoso', 'desconhecido']),
      sourceIds,
    }),

    physical: z.strictObject({
      density: optionalMeasurement,
      meltingPoint: optionalMeasurement,
      boilingPoint: optionalMeasurement,
    }),

    chemical: z.strictObject({
      electronegativity: optionalMeasurement,
      atomicRadius: optionalMeasurement,
      firstIonizationEnergy: optionalMeasurement,
      oxidationStates: z
        .strictObject({
          values: z.array(z.number().int().min(-5).max(8)),
          sourceIds,
        })
        .nullable(),
    }),

    discovery: z.strictObject({
      /** `null` para elementos conhecidos desde a Antiguidade. */
      year: z.number().int().nullable(),
      discoverers: z.array(z.string().min(1)),
      sourceIds,
    }),

    etymology: sourcedText,
    summary: sourcedText,
    uses: z.array(sourcedText),

    /** Referências citadas pelos `sourceIds` deste elemento. */
    references: z.array(referenceSchema).min(1),
  })
  .superRefine((element, ctx) => {
    const shellTotal = element.electronConfiguration.shells.reduce((sum, n) => sum + n, 0);
    if (shellTotal !== element.atomicNumber) {
      ctx.addIssue({
        code: 'custom',
        path: ['electronConfiguration', 'shells'],
        message: `A soma dos elétrons das camadas (${shellTotal}) deve ser igual ao número atômico (${element.atomicNumber}).`,
      });
    }

    const declared = new Set<string>();
    element.references.forEach((reference, index) => {
      if (declared.has(reference.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['references', index, 'id'],
          message: `Referência duplicada: "${reference.id}".`,
        });
      }
      declared.add(reference.id);
    });

    for (const { path, ids } of collectSourceIds(element)) {
      ids.forEach((id, index) => {
        if (!declared.has(id)) {
          ctx.addIssue({
            code: 'custom',
            path: [...path, index],
            message: `Referência "${id}" não está declarada em "references".`,
          });
        }
      });
    }
  });

/** Percorre o elemento e devolve todos os `sourceIds` com o respectivo caminho. */
function collectSourceIds(
  node: unknown,
  path: (string | number)[] = [],
): { path: (string | number)[]; ids: string[] }[] {
  if (Array.isArray(node)) {
    return node.flatMap((item, index) => collectSourceIds(item, [...path, index]));
  }
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, value]) => {
      if (key === 'references') return [];
      if (key === 'sourceIds' && Array.isArray(value)) {
        return [{ path: [...path, key], ids: value as string[] }];
      }
      return collectSourceIds(value, [...path, key]);
    });
  }
  return [];
}

export type Reference = z.infer<typeof referenceSchema>;
export type Measurement = z.infer<typeof measurementSchema>;
export type Element = z.infer<typeof elementSchema>;
