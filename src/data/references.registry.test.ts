import { z } from 'zod';
import { buildCatalog, catalog } from './catalog';
import registry from './references.json';
import { referenceSchema, type Reference } from './schema/reference.schema';

/**
 * Testes do registro REAL de referências (src/data/references.json).
 *
 * Os valores esperados abaixo são os metadados aprovados na Etapa 2.3C.2. Alterar o registro
 * (incluir uma fonte ou mudar um metadado) exige atualizar deliberadamente estes testes e a
 * política em docs/convencoes-cientificas.md, seção 8.
 */

const COPYRIGHT =
  '© 2021 Chinese Physical Society, Institute of High Energy Physics of the Chinese Academy of Sciences, Institute of Modern Physics of the Chinese Academy of Sciences e IOP Publishing Ltd';
const TERMS_URL = 'https://creativecommons.org/licenses/by/3.0/';

const EXPECTED = {
  'nubase2020-artigo': {
    title: 'The NUBASE2020 evaluation of nuclear physics properties',
    authors: ['F.G. Kondev', 'M. Wang', 'W.J. Huang', 'S. Naimi', 'G. Audi'],
    doi: '10.1088/1674-1137/abddae',
    url: 'https://iopscience.iop.org/article/10.1088/1674-1137/abddae',
    edition: 'NUBASE2020',
    articleNumber: '030001',
  },
  'ame2020-ii-artigo': {
    title: 'The AME 2020 atomic mass evaluation (II). Tables, graphs and references',
    authors: ['Meng Wang', 'W.J. Huang', 'F.G. Kondev', 'G. Audi', 'S. Naimi'],
    doi: '10.1088/1674-1137/abddaf',
    url: 'https://iopscience.iop.org/article/10.1088/1674-1137/abddaf',
    edition: 'AME2020',
    articleNumber: '030003',
  },
} as const;

type ApprovedId = keyof typeof EXPECTED;
const APPROVED_IDS = Object.keys(EXPECTED) as ApprovedId[];

const references: Reference[] = z.array(referenceSchema).parse(registry);
const byId = (id: ApprovedId): Reference => {
  const found = references.find((reference) => reference.id === id);
  if (!found) throw new Error(`Referência aprovada ausente do registro: ${id}`);
  return found;
};

describe('registro real: identificação', () => {
  it('valida integralmente contra o schema de referências', () => {
    expect(referenceSchema.array().safeParse(registry).success).toBe(true);
  });

  it('contém exatamente os dois ids aprovados', () => {
    expect(references.map((reference) => reference.id).sort()).toEqual([...APPROVED_IDS].sort());
  });

  it('não repete ids nem DOIs', () => {
    const ids = references.map((reference) => reference.id);
    const dois = references.map((reference) => reference.doi?.toLowerCase());
    expect(new Set(ids).size).toBe(ids.length);
    expect(dois.every(Boolean)).toBe(true);
    expect(new Set(dois).size).toBe(dois.length);
  });

  it.each(APPROVED_IDS)('%s: DOI, título, autores e edição exatos', (id) => {
    const reference = byId(id);
    const expected = EXPECTED[id];
    expect(reference.doi).toBe(expected.doi);
    expect(reference.title).toBe(expected.title);
    expect(reference.authors).toEqual(expected.authors);
    expect(reference.edition).toBe(expected.edition);
    expect(reference.publisher).toBe('IOP Publishing');
    expect(reference.year).toBe(2021);
  });

  it.each(APPROVED_IDS)('%s: URL oficial da editora, coerente com o DOI', (id) => {
    const reference = byId(id);
    const url = new URL(reference.url ?? '');
    expect(reference.url).toBe(EXPECTED[id].url);
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('iopscience.iop.org');
    expect(url.pathname).toBe(`/article/${reference.doi}`);
  });

  it.each(APPROVED_IDS)('%s: é um artigo, compilação, de dados incorporados', (id) => {
    const reference = byId(id);
    expect(reference.kind).toBe('artigo');
    expect(reference.tier).toBe('compilacao');
    expect(reference.usage).toBe('dados-incorporados');
  });
});

describe('registro real: licença', () => {
  it.each(APPROVED_IDS)('%s: licença verificada e redistribuição permitida', (id) => {
    const { license } = byId(id);
    expect(license.status).toBe('verificada');
    expect(license.redistribution).toBe('permitida');
    expect(license.name).toBe('CC BY 3.0');
  });

  it.each(APPROVED_IDS)('%s: sem restrições (a redistribuição é permitida)', (id) => {
    expect(byId(id).license.restrictions).toBeUndefined();
  });

  it.each(APPROVED_IDS)('%s: termsUrl é a URL HTTPS da CC BY 3.0', (id) => {
    const { termsUrl } = byId(id).license;
    expect(termsUrl).toBe(TERMS_URL);
    expect(new URL(termsUrl ?? '').protocol).toBe('https:');
  });

  it.each(APPROVED_IDS)('%s: checkedAt é uma data real, sem estar no futuro', (id) => {
    const { checkedAt } = byId(id).license;
    expect(checkedAt).toBe('2026-11-07');
    const parsed = new Date(`${checkedAt}T00:00:00Z`);
    expect(Number.isNaN(parsed.getTime())).toBe(false);
    expect(parsed.toISOString().slice(0, 10)).toBe(checkedAt);
    expect(parsed.getTime()).toBeLessThanOrEqual(Date.now());
  });
});

describe('registro real: atribuição bibliográfica', () => {
  it.each(APPROVED_IDS)('%s: a atribuição é completa', (id) => {
    const reference = byId(id);
    const expected = EXPECTED[id];
    const attribution = reference.license.attribution ?? '';
    for (const author of expected.authors) expect(attribution).toContain(author);
    expect(attribution).toContain(expected.title);
    expect(attribution).toContain('Chinese Physics C');
    expect(attribution).toContain('vol. 45');
    expect(attribution).toContain('n. 3');
    expect(attribution).toContain(`artigo ${expected.articleNumber}`);
    expect(attribution).toContain('2021');
    expect(attribution).toContain(`DOI: ${expected.doi}`);
    expect(attribution).toContain('CC BY 3.0');
    expect(attribution).toContain(TERMS_URL);
  });

  it.each(APPROVED_IDS)('%s: a atribuição preserva a identificação de modificações', (id) => {
    expect(byId(id).license.attribution).toMatch(/Modificações .* devem ser identificadas/);
  });

  it.each(APPROVED_IDS)('%s: a nota registra o copyright confirmado', (id) => {
    expect(byId(id).license.note).toContain(COPYRIGHT);
  });
});

describe('registro real: escopo individual das licenças', () => {
  it('NUBASE2020: a licença é do artigo e não se estende aos arquivos ASCII do AMDC', () => {
    const note = byId('nubase2020-artigo').license.note ?? '';
    expect(note).toContain('corresponde ao artigo publicado');
    expect(note).toMatch(/não se estende aos arquivos ASCII do AMDC/);
    expect(note).toContain('outras publicações relacionadas');
  });

  it('AME2020 (II): a licença é da parte II e não se estende à parte I nem aos arquivos ASCII', () => {
    const note = byId('ame2020-ii-artigo').license.note ?? '';
    expect(note).toContain('corresponde à parte II');
    expect(note).toMatch(/não se estende à parte I/);
    expect(note).toContain('arquivos ASCII do AMDC');
    expect(note).toContain('outras publicações relacionadas');
  });

  it('nenhuma referência registrada representa a parte I ou os arquivos ASCII do AMDC', () => {
    const doisAprovados = new Set<string>(APPROVED_IDS.map((id) => EXPECTED[id].doi));
    for (const reference of references) {
      expect(reference.kind).not.toBe('base-de-dados');
      expect(reference.doi && doisAprovados.has(reference.doi)).toBe(true);
      expect(reference.doi).not.toBe('10.1088/1674-1137/abddb0');
    }
  });
});

describe('registro real: trava de política', () => {
  it('somente as duas referências aprovadas são "dados-incorporados"', () => {
    // Incluir uma nova fonte como `dados-incorporados` exige atualizar este teste
    // e a política de licenciamento de forma deliberada (docs/convencoes-cientificas.md, seção 8).
    const incorporated = references
      .filter((reference) => reference.usage === 'dados-incorporados')
      .map((reference) => reference.id)
      .sort();
    expect(incorporated).toEqual([...APPROVED_IDS].sort());
  });

  it('toda referência incorporada tem redistribuição "permitida"', () => {
    for (const reference of references.filter((item) => item.usage === 'dados-incorporados')) {
      expect(reference.license.redistribution).toBe('permitida');
    }
  });
});

describe('registro real: integridade da regra de redistribuição', () => {
  const withoutRedistribution = (id: ApprovedId): unknown[] => {
    const copy = structuredClone(registry) as { id: string; license: Record<string, unknown> }[];
    const target = copy.find((reference) => reference.id === id);
    if (!target) throw new Error(`Referência ausente: ${id}`);
    delete target.license.redistribution;
    return copy;
  };

  it('controle: o registro íntegro é aceito pelo schema e pelo catálogo', () => {
    expect(z.array(referenceSchema).safeParse(registry).success).toBe(true);
    expect(() => buildCatalog({}, registry)).not.toThrow();
  });

  it.each(APPROVED_IDS)(
    '%s: sem `redistribution`, falha exatamente pela regra de redistribuição',
    (id) => {
      const mutated = withoutRedistribution(id);
      const result = z.array(referenceSchema).safeParse(mutated);
      expect(result.success).toBe(false);
      const index = references.findIndex((reference) => reference.id === id);
      expect(result.error?.issues.map((issue) => issue.path.join('.'))).toEqual([
        `${index}.license.redistribution`,
      ]);
      expect(result.error?.issues[0]?.message).toContain('o campo não foi informado');
    },
  );

  it.each(APPROVED_IDS)('%s: o catálogo recusa o registro sem `redistribution`', (id) => {
    expect(() => buildCatalog({}, withoutRedistribution(id))).toThrow(/license\.redistribution/);
  });
});

describe('registro real: catálogo', () => {
  it('o catálogo carrega as duas referências e nenhum elemento', () => {
    expect(catalog.references).toHaveLength(2);
    expect(catalog.elements).toHaveLength(0);
  });
});
