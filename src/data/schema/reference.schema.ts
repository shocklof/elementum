import { z } from 'zod';
import { slugSchema } from './common';

/**
 * Situação da redistribuição dos dados da fonte (independente de a licença ter sido consultada):
 * - `permitida`: a redistribuição dos dados em JSON é permitida, sem restrições além da atribuição;
 * - `condicional`: permitida apenas sob as restrições registradas em `restrictions`;
 * - `nao-permitida`: proibida de forma expressa pelos termos da fonte;
 * - `nao-esclarecida`: nenhuma autorização foi encontrada, mas também não há proibição
 *   expressa. Ausência de autorização não é proibição, mas também não autoriza.
 */
export const REDISTRIBUTION_STATES = [
  'permitida',
  'condicional',
  'nao-permitida',
  'nao-esclarecida',
] as const;

/**
 * Restrições impostas pela fonte:
 * - `nao-comercial`: proíbe uso comercial (ex.: CC BY-NC);
 * - `sem-derivados`: proíbe obras derivadas (ex.: CC BY-ND);
 * - `compartilhamento-igual`: derivados devem manter a mesma licença (ex.: CC BY-SA);
 * - `uso-educacional`: uso livre apenas para fins educacionais;
 * - `contato-comercial`: uso comercial exige contato com o titular dos direitos.
 */
export const LICENSE_RESTRICTIONS = [
  'nao-comercial',
  'sem-derivados',
  'compartilhamento-igual',
  'uso-educacional',
  'contato-comercial',
] as const;

/**
 * Política de licenças: nenhum dado de uma base científica pode ser incorporado
 * enquanto a licença e as condições de atribuição não forem verificadas e registradas
 * **e** a redistribuição não for confirmada como `permitida`.
 *
 * `status: verificada` significa apenas que os termos foram consultados e registrados.
 * Quem autoriza ou não a redistribuição é `redistribution`. Fontes `condicional`,
 * `nao-permitida` ou `nao-esclarecida` podem ser registradas e citadas, mas não fornecem
 * dados incorporados sem uma decisão específica documentada.
 *
 * A licença do código (MIT) é independente das licenças dos dados científicos.
 */
export const licenseSchema = z
  .strictObject({
    /**
     * - `verificada`: termos lidos e registrados abaixo;
     * - `pendente`: ainda não verificada (bloqueia `dados-incorporados`);
     * - `nao-aplicavel`: referência usada apenas para citação.
     */
    status: z.enum(['verificada', 'pendente', 'nao-aplicavel']),
    /** Situação da redistribuição. Obrigatória (`permitida`) para `dados-incorporados`. */
    redistribution: z.enum(REDISTRIBUTION_STATES).optional(),
    /** Restrições da fonte. Sem repetição; incompatíveis com `permitida`. */
    restrictions: z.array(z.enum(LICENSE_RESTRICTIONS)).optional(),
    /** Nome da licença ou dos termos de uso (ex.: "CC BY 4.0", "domínio público (obra do governo dos EUA)"). */
    name: z.string().min(1).optional(),
    termsUrl: z.url().optional(),
    /** Texto de atribuição exigido pela fonte, se houver. */
    attribution: z.string().min(1).optional(),
    /** Data em que os termos foram verificados (AAAA-MM-DD). */
    checkedAt: z.iso.date().optional(),
    note: z.string().min(1).optional(),
  })
  .superRefine((license, ctx) => {
    const restrictions = license.restrictions ?? [];

    if (new Set(restrictions).size !== restrictions.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['restrictions'],
        message: 'Restrições repetidas.',
      });
    }

    if (license.redistribution === 'permitida' && restrictions.length > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['restrictions'],
        message:
          'Redistribuição "permitida" não admite restrições; se há restrições, use "condicional".',
      });
    }

    if (license.redistribution === 'condicional' && restrictions.length === 0 && !license.note) {
      ctx.addIssue({
        code: 'custom',
        path: ['restrictions'],
        message:
          'Redistribuição "condicional" exige ao menos uma restrição (ou uma nota explicando a condição).',
      });
    }
  });

const WIKIMEDIA_HOST = /(^|\.)(wikipedia|wikimedia|wikidata|wikibooks)\.org$/i;

/** Mensagens de bloqueio da incorporação, por situação da redistribuição. */
const INCORPORATION_BLOCKED_MESSAGES = {
  ausente:
    'Dados incorporados exigem license.redistribution = "permitida"; o campo não foi informado.',
  condicional:
    'Redistribuição "condicional": a fonte pode ser citada, mas não fornece dados incorporados sem uma decisão específica documentada.',
  'nao-permitida': 'Redistribuição "nao-permitida": os termos da fonte proíbem a incorporação.',
  'nao-esclarecida':
    'Redistribuição "nao-esclarecida": a ausência de autorização encontrada não é proibição expressa, mas também não autoriza a incorporação.',
  permitida: 'Redistribuição "permitida".',
} as const;

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

      // Licença consultada não é redistribuição permitida: só `permitida` libera a incorporação.
      if (license.redistribution !== 'permitida') {
        ctx.addIssue({
          code: 'custom',
          path: ['license', 'redistribution'],
          message: INCORPORATION_BLOCKED_MESSAGES[license.redistribution ?? 'ausente'],
        });
      }
    }
  });

export type License = z.infer<typeof licenseSchema>;
export type Redistribution = (typeof REDISTRIBUTION_STATES)[number];
export type LicenseRestriction = (typeof LICENSE_RESTRICTIONS)[number];
export type Reference = z.infer<typeof referenceSchema>;
