import { z } from 'zod';
import { slugSchema } from './common';

/**
 * Política de licenças: nenhum dado de uma base científica pode ser incorporado
 * enquanto a licença e as condições de atribuição não forem verificadas e registradas.
 */
export const licenseSchema = z.strictObject({
  /**
   * - `verificada`: termos lidos e registrados abaixo;
   * - `pendente`: ainda não verificada (bloqueia `dados-incorporados`);
   * - `nao-aplicavel`: referência usada apenas para citação.
   */
  status: z.enum(['verificada', 'pendente', 'nao-aplicavel']),
  /** Nome da licença ou dos termos de uso (ex.: "CC BY 4.0", "domínio público (obra do governo dos EUA)"). */
  name: z.string().min(1).optional(),
  termsUrl: z.url().optional(),
  /** Texto de atribuição exigido pela fonte, se houver. */
  attribution: z.string().min(1).optional(),
  /** Data em que os termos foram verificados (AAAA-MM-DD). */
  checkedAt: z.iso.date().optional(),
  note: z.string().min(1).optional(),
});

const WIKIMEDIA_HOST = /(^|\.)(wikipedia|wikimedia|wikidata|wikibooks)\.org$/i;

export const referenceSchema = z
  .strictObject({
    id: slugSchema,
    kind: z.enum([
      'base-de-dados',
      'artigo',
      'livro',
      'norma-iupac',
      'relatorio-tecnico',
      'site-institucional',
    ]),
    title: z.string().min(1),
    authors: z.array(z.string().min(1)).optional(),
    publisher: z.string().min(1).optional(),
    year: z.number().int().min(1500).max(2100).optional(),
    doi: z
      .string()
      .regex(/^10\.\d{4,9}\/\S+$/, 'DOI inválido.')
      .optional(),
    isbn: z.string().min(1).optional(),
    url: z.url().optional(),
    /** Edição ou versão consultada (ex.: "NUBASE2020", "CIAAW 2024"). */
    edition: z.string().min(1).optional(),
    /** Data da consulta (AAAA-MM-DD). Obrigatória para bases e sites. */
    retrievedAt: z.iso.date().optional(),
    /** `primaria`: fonte original; `compilacao`: compilação curada; `secundaria`: derivada de outras. */
    tier: z.enum(['primaria', 'compilacao', 'secundaria']),
    /** `dados-incorporados`: valores desta fonte entram nos JSON; `apenas-citacao`: só é citada. */
    usage: z.enum(['dados-incorporados', 'apenas-citacao']),
    license: licenseSchema,
  })
  .superRefine((reference, ctx) => {
    if (reference.url && WIKIMEDIA_HOST.test(new URL(reference.url).hostname)) {
      ctx.addIssue({
        code: 'custom',
        path: ['url'],
        message: 'A Wikipédia e projetos Wikimedia não podem ser citados como referência.',
      });
    }

    if (
      (reference.kind === 'base-de-dados' || reference.kind === 'site-institucional') &&
      !reference.retrievedAt
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['retrievedAt'],
        message: 'Bases de dados e sites exigem a data da consulta (retrievedAt).',
      });
    }

    if (reference.usage === 'dados-incorporados') {
      const { license } = reference;
      if (license.status !== 'verificada') {
        ctx.addIssue({
          code: 'custom',
          path: ['license', 'status'],
          message: 'Dados só podem ser incorporados de fontes com licença verificada.',
        });
      } else {
        for (const field of ['name', 'termsUrl', 'attribution', 'checkedAt'] as const) {
          if (!license[field]) {
            ctx.addIssue({
              code: 'custom',
              path: ['license', field],
              message: `Licença verificada exige o campo "${field}".`,
            });
          }
        }
      }
    }
  });

export type License = z.infer<typeof licenseSchema>;
export type Reference = z.infer<typeof referenceSchema>;
