import { z } from 'zod';
import { FIXTURE_CITATION_ONLY_REF, FIXTURE_REF, makeFullFixtureElement } from '@/test/fixtures';
import {
  CITATION_PATH_CATEGORIES,
  checkCitationEligibility,
  collectCitationBlocks,
  formatCitationPath,
  normalizeCitationPath,
  resolveBlockKind,
  type ReferenceUsage,
} from './citation-eligibility';
import { elementSchema } from './schema/element.schema';

/** Todos os dados abaixo são SINTÉTICOS. */

const usageByRef = new Map<string, ReferenceUsage>([
  [FIXTURE_REF, 'dados-incorporados'],
  [FIXTURE_CITATION_ONLY_REF, 'apenas-citacao'],
]);

/** Caminhos com `citations` derivados do JSON Schema do `elementSchema` (notação `a.b[]`). */
type JsonNode = {
  properties?: Record<string, JsonNode>;
  items?: JsonNode;
  anyOf?: JsonNode[];
  oneOf?: JsonNode[];
  allOf?: JsonNode[];
};

function schemaCitationPaths(node: JsonNode, path: string[] = [], out = new Set<string>()) {
  for (const [key, child] of Object.entries(node.properties ?? {})) {
    if (key === 'citations') out.add(path.join('.'));
    schemaCitationPaths(child, [...path, key], out);
  }
  if (node.items) {
    const last = path.at(-1) ?? '';
    schemaCitationPaths(node.items, [...path.slice(0, -1), `${last}[]`], out);
  }
  for (const branch of [...(node.anyOf ?? []), ...(node.oneOf ?? []), ...(node.allOf ?? [])]) {
    schemaCitationPaths(branch, path, out);
  }
  return out;
}

describe('collectCitationBlocks', () => {
  it('devolve os blocos com `citations`, com o caminho completo, inclusive os aninhados', () => {
    const node = {
      a: { citations: [] },
      b: [{ citations: [{ ref: 'x' }], inner: { citations: [] } }, { semCitacoes: true }],
      c: { citations: 'não é uma lista' },
    };
    expect(collectCitationBlocks(node).map((block) => block.path)).toEqual([
      ['a'],
      ['b', 0],
      ['b', 0, 'inner'],
    ]);
  });

  it('guarda o objeto que contém as citações (para ler o status do bloco)', () => {
    const node = { physical: { density: { status: 'valor', citations: [{ ref: 'x' }] } } };
    const [block] = collectCitationBlocks(node);
    expect(block?.container.status).toBe('valor');
    expect(block?.citations).toEqual([{ ref: 'x' }]);
  });

  it('ignora valores que não são objetos ou listas', () => {
    expect(collectCitationBlocks(null)).toEqual([]);
    expect(collectCitationBlocks('texto')).toEqual([]);
    expect(collectCitationBlocks(42)).toEqual([]);
  });
});

describe('formatação de caminhos', () => {
  it('normaliza sem índices e formata com índices', () => {
    const path = ['isotopes', 2, 'atomicMass'];
    expect(normalizeCitationPath(path)).toBe('isotopes[].atomicMass');
    expect(formatCitationPath(path)).toBe('isotopes[2].atomicMass');
    expect(normalizeCitationPath(['uses', 0])).toBe('uses[]');
    expect(formatCitationPath(['uses', 0])).toBe('uses[0]');
    expect(normalizeCitationPath([])).toBe('');
  });
});

describe('resolveBlockKind', () => {
  it('categorias fixas independem do status', () => {
    expect(resolveBlockKind('dado', {})).toBe('dado');
    expect(resolveBlockKind('autoral', { status: 'valor' })).toBe('autoral');
  });

  it('categoria "estado" depende do status do bloco', () => {
    expect(resolveBlockKind('estado', { status: 'valor' })).toBe('dado');
    expect(resolveBlockKind('estado', { status: 'estavel' })).toBe('dado');
    expect(resolveBlockKind('estado', { status: 'desconhecido' })).toBe('justificativa');
    expect(resolveBlockKind('estado', { status: 'nao-aplicavel' })).toBe('justificativa');
  });

  it('status desconhecido ou ausente não é resolvido (nunca presumido)', () => {
    expect(resolveBlockKind('estado', { status: 'talvez' })).toBeUndefined();
    expect(resolveBlockKind('estado', {})).toBeUndefined();
  });
});

describe('completude da classificação dos caminhos com citações', () => {
  const full = makeFullFixtureElement();
  const fixturePaths = new Set(
    collectCitationBlocks(full).map((block) => normalizeCitationPath(block.path)),
  );
  const tableKeys = new Set(Object.keys(CITATION_PATH_CATEGORIES));

  it('o elemento sintético completo é válido no schema', () => {
    expect(elementSchema.safeParse(full).success).toBe(true);
  });

  it('todo caminho com `citations` do elemento completo está classificado', () => {
    const unclassified = [...fixturePaths].filter((path) => !tableKeys.has(path));
    expect(unclassified).toEqual([]);
  });

  it('toda entrada da tabela aparece no elemento completo (sem entradas obsoletas)', () => {
    const notExercised = [...tableKeys].filter((key) => !fixturePaths.has(key));
    expect(notExercised).toEqual([]);
  });

  it('a tabela coincide, nos dois sentidos, com os caminhos `citations` do próprio schema', () => {
    const json = z.toJSONSchema(elementSchema, {
      io: 'input',
      unrepresentable: 'any',
      reused: 'inline',
    }) as unknown as JsonNode;
    const fromSchema = schemaCitationPaths(json);
    expect(fromSchema.size).toBeGreaterThan(20);
    expect([...fromSchema].filter((path) => !tableKeys.has(path))).toEqual([]);
    expect([...tableKeys].filter((key) => !fromSchema.has(key))).toEqual([]);
  });

  it('usa só as categorias previstas', () => {
    for (const category of Object.values(CITATION_PATH_CATEGORIES)) {
      expect(['dado', 'estado', 'autoral']).toContain(category);
    }
  });

  it('dados estruturados e conteúdo autoral estão classificados como aprovado', () => {
    const keysOf = (category: string) =>
      Object.entries(CITATION_PATH_CATEGORIES)
        .filter(([, value]) => value === category)
        .map(([key]) => key)
        .sort();
    expect(keysOf('dado')).toEqual(['atomicMass', 'discovery', 'isotopes[]']);
    expect(keysOf('autoral')).toEqual([
      'appearance',
      'classification',
      'etymology',
      'summary',
      'uses[]',
    ]);
    expect(keysOf('estado')).toHaveLength(Object.keys(CITATION_PATH_CATEGORIES).length - 8);
  });
});

describe('falha segura: caminho sem categoria', () => {
  const unclassified = (citations: unknown[]) => ({ novoCampo: { text: 'x', citations } });

  it('um caminho com citações fora da tabela é erro, qualquer que seja o papel', () => {
    for (const citation of [
      { ref: FIXTURE_REF, role: 'origem' },
      { ref: FIXTURE_REF, role: 'apoio' },
      { ref: FIXTURE_CITATION_ONLY_REF },
    ]) {
      const issues = checkCitationEligibility(unclassified([citation]), usageByRef, 'Tb');
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('Tb: novoCampo.citations');
      expect(issues[0]).toContain('sem categoria de elegibilidade');
    }
  });

  it('um caminho desconhecido nunca é tratado como conteúdo autoral', () => {
    const issues = checkCitationEligibility(
      { novoTexto: { text: 'x', citations: [{ ref: FIXTURE_CITATION_ONLY_REF }] } },
      usageByRef,
      'Tb',
    );
    expect(issues).toHaveLength(1);
  });

  it('um bloco com estado não reconhecido é erro', () => {
    const element = {
      physical: { density: { status: 'talvez', citations: [{ ref: FIXTURE_REF }] } },
    };
    const issues = checkCitationEligibility(element, usageByRef, 'Tb');
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('physical.density');
    expect(issues[0]).toContain('status "talvez" não reconhecido');
  });
});

describe('checkCitationEligibility', () => {
  it('não reporta nada para o elemento sintético completo', () => {
    expect(checkCitationEligibility(makeFullFixtureElement(), usageByRef, 'Tb')).toEqual([]);
  });

  it('as mensagens trazem símbolo, caminho com índice, referência, papel e usage', () => {
    const element = makeFullFixtureElement();
    const isotope = element.isotopes[1];
    if (!isotope) throw new Error('fixture sem segundo isótopo');
    isotope.atomicMass = {
      status: 'valor',
      value: 5,
      unit: 'u',
      provenance: 'experimental',
      citations: [{ ref: FIXTURE_CITATION_ONLY_REF, role: 'origem' }],
    };
    const [message, ...rest] = checkCitationEligibility(element, usageByRef, 'Tb');
    expect(rest).toEqual([]);
    expect(message).toContain('Tb: isotopes[1].atomicMass.citations[0]');
    expect(message).toContain(
      `[ref=${FIXTURE_CITATION_ONLY_REF}; role=origem; usage=apenas-citacao]`,
    );
  });

  it('ignora citações a referências que não estão no registro (já reportadas pela existência)', () => {
    const element = {
      atomicMass: { form: 'valor', citations: [{ ref: 'nao-existe', role: 'origem' }] },
    };
    expect(checkCitationEligibility(element, usageByRef, 'Tb')).toEqual([]);
  });

  it('o critério é `usage` da referência, e não a licença', () => {
    const element = {
      atomicMass: { form: 'valor', citations: [{ ref: 'so-citacao', role: 'origem' }] },
    };
    const issues = checkCitationEligibility(
      element,
      new Map<string, ReferenceUsage>([['so-citacao', 'apenas-citacao']]),
      'Tb',
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('usage=apenas-citacao');
  });
});
