import { makeFixtureReference } from '@/test/fixtures';
import {
  LICENSE_RESTRICTIONS,
  REDISTRIBUTION_STATES,
  referenceSchema,
  type License,
} from './reference.schema';

const verifiedLicense = {
  status: 'verificada' as const,
  redistribution: 'permitida' as const,
  name: 'Licença de teste',
  termsUrl: 'https://example.org/termos',
  attribution: 'Atribuição de teste.',
  checkedAt: '2026-01-01',
};

describe('referenceSchema', () => {
  it('aceita uma referência só para citação', () => {
    expect(referenceSchema.safeParse(makeFixtureReference()).success).toBe(true);
  });

  it('aceita dados incorporados com licença verificada e completa', () => {
    const reference = makeFixtureReference({
      kind: 'base-de-dados',
      usage: 'dados-incorporados',
      retrievedAt: '2026-01-01',
      license: verifiedLicense,
    });
    expect(referenceSchema.safeParse(reference).success).toBe(true);
  });

  it('bloqueia dados incorporados enquanto a licença estiver pendente', () => {
    const reference = makeFixtureReference({
      usage: 'dados-incorporados',
      license: { status: 'pendente' },
    });
    const result = referenceSchema.safeParse(reference);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['license', 'status']);
  });

  it('bloqueia dados incorporados com licença "nao-aplicavel"', () => {
    const reference = makeFixtureReference({ usage: 'dados-incorporados' });
    expect(referenceSchema.safeParse(reference).success).toBe(false);
  });

  it('exige nome, termos, atribuição e data em licença verificada', () => {
    const reference = makeFixtureReference({
      usage: 'dados-incorporados',
      license: { status: 'verificada' },
    });
    const result = referenceSchema.safeParse(reference);
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path.at(-1));
    expect(fields).toEqual(
      expect.arrayContaining(['name', 'termsUrl', 'attribution', 'checkedAt']),
    );
  });

  it('proíbe a Wikipédia e projetos Wikimedia como referência', () => {
    for (const url of [
      'https://en.wikipedia.org/wiki/Iron',
      'https://pt.wikipedia.org/wiki/Ferro',
      'https://commons.wikimedia.org/wiki/File:X.png',
      'https://www.wikidata.org/wiki/Q677',
    ]) {
      expect(referenceSchema.safeParse(makeFixtureReference({ url })).success).toBe(false);
    }
    expect(
      referenceSchema.safeParse(makeFixtureReference({ url: 'https://example.org/wikipedia' }))
        .success,
    ).toBe(true);
  });

  it('exige a data de consulta para bases de dados e sites', () => {
    expect(referenceSchema.safeParse(makeFixtureReference({ kind: 'base-de-dados' })).success).toBe(
      false,
    );
    expect(
      referenceSchema.safeParse(makeFixtureReference({ kind: 'site-institucional' })).success,
    ).toBe(false);
    expect(
      referenceSchema.safeParse(
        makeFixtureReference({ kind: 'base-de-dados', retrievedAt: '2026-01-01' }),
      ).success,
    ).toBe(true);
  });

  it('valida DOI, data e identificador', () => {
    expect(referenceSchema.safeParse(makeFixtureReference({ doi: '10.1000/abc' })).success).toBe(
      true,
    );
    expect(referenceSchema.safeParse(makeFixtureReference({ doi: 'doi-invalido' })).success).toBe(
      false,
    );
    expect(
      referenceSchema.safeParse(makeFixtureReference({ retrievedAt: '01/01/2026' })).success,
    ).toBe(false);
    expect(referenceSchema.safeParse(makeFixtureReference({ id: 'Id Inválido' })).success).toBe(
      false,
    );
  });

  it('aceita edição e rejeita campos desconhecidos', () => {
    expect(
      referenceSchema.safeParse(makeFixtureReference({ edition: 'Edição de teste' })).success,
    ).toBe(true);
    expect(referenceSchema.safeParse({ ...makeFixtureReference(), extra: 1 }).success).toBe(false);
  });
});

/* Todas as referências abaixo são SINTÉTICAS (fixtures de teste). */
const incorporated = (license: Partial<License> & Pick<License, 'status'>) =>
  makeFixtureReference({
    kind: 'base-de-dados',
    usage: 'dados-incorporados',
    retrievedAt: '2026-01-01',
    license: { ...verifiedLicense, ...license },
  });

const citationOnly = (license: License) =>
  makeFixtureReference({ usage: 'apenas-citacao', license });

const issuePaths = (reference: unknown) => {
  const result = referenceSchema.safeParse(reference);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
};

describe('referenceSchema: licença consultada não é redistribuição permitida', () => {
  it('declara os quatro estados de redistribuição e as cinco restrições', () => {
    expect([...REDISTRIBUTION_STATES]).toEqual([
      'permitida',
      'condicional',
      'nao-permitida',
      'nao-esclarecida',
    ]);
    expect([...LICENSE_RESTRICTIONS]).toEqual([
      'nao-comercial',
      'sem-derivados',
      'compartilhamento-igual',
      'uso-educacional',
      'contato-comercial',
    ]);
  });

  it('aceita dados incorporados com redistribuição "permitida"', () => {
    expect(referenceSchema.safeParse(incorporated({ status: 'verificada' })).success).toBe(true);
  });

  it('rejeita dados incorporados com redistribuição "condicional"', () => {
    const reference = incorporated({
      status: 'verificada',
      redistribution: 'condicional',
      restrictions: ['nao-comercial'],
    });
    const result = referenceSchema.safeParse(reference);
    expect(result.success).toBe(false);
    expect(issuePaths(reference)).toEqual(['license.redistribution']);
    expect(result.error?.issues[0]?.message).toContain('decisão específica documentada');
  });

  it('rejeita dados incorporados com redistribuição "nao-permitida"', () => {
    const reference = incorporated({ status: 'verificada', redistribution: 'nao-permitida' });
    expect(issuePaths(reference)).toEqual(['license.redistribution']);
    expect(referenceSchema.safeParse(reference).error?.issues[0]?.message).toContain(
      'proíbem a incorporação',
    );
  });

  it('rejeita dados incorporados com redistribuição "nao-esclarecida", sem tratá-la como proibição', () => {
    const reference = incorporated({ status: 'verificada', redistribution: 'nao-esclarecida' });
    expect(issuePaths(reference)).toEqual(['license.redistribution']);
    const message = referenceSchema.safeParse(reference).error?.issues[0]?.message ?? '';
    expect(message).toContain('não é proibição expressa');
    expect(message).not.toContain('proíbem');
  });

  it('rejeita dados incorporados sem informar a redistribuição', () => {
    const { redistribution, ...withoutRedistribution } = verifiedLicense;
    void redistribution;
    const reference = incorporated({ ...withoutRedistribution, status: 'verificada' });
    const parsed = referenceSchema.safeParse({
      ...reference,
      license: withoutRedistribution,
    });
    expect(parsed.success).toBe(false);
    expect(issuePaths({ ...reference, license: withoutRedistribution })).toEqual([
      'license.redistribution',
    ]);
    expect(parsed.error?.issues[0]?.message).toContain('não foi informado');
  });

  it('licença consultada ("verificada") com redistribuição não permitida continua sendo bloqueada', () => {
    for (const redistribution of ['condicional', 'nao-permitida', 'nao-esclarecida'] as const) {
      const reference = incorporated({
        status: 'verificada',
        redistribution,
        restrictions: redistribution === 'condicional' ? ['uso-educacional'] : undefined,
      });
      expect(referenceSchema.safeParse(reference).success).toBe(false);
    }
  });

  it('mantém todas as exigências anteriores para dados incorporados', () => {
    expect(
      referenceSchema.safeParse(incorporated({ status: 'pendente', redistribution: 'permitida' }))
        .success,
    ).toBe(false);
    for (const field of ['name', 'termsUrl', 'attribution', 'checkedAt'] as const) {
      const license = { ...verifiedLicense, [field]: undefined };
      const reference = makeFixtureReference({
        kind: 'base-de-dados',
        usage: 'dados-incorporados',
        retrievedAt: '2026-01-01',
        license,
      });
      expect(issuePaths(reference)).toEqual([`license.${field}`]);
    }
  });
});

describe('referenceSchema: referências usadas somente para citação', () => {
  it('são aceitas independentemente do estado de redistribuição', () => {
    const cases: License[] = [
      { status: 'nao-aplicavel' },
      { status: 'nao-aplicavel', redistribution: 'permitida' },
      { status: 'verificada', redistribution: 'condicional', restrictions: ['nao-comercial'] },
      { status: 'verificada', redistribution: 'nao-permitida' },
      { status: 'pendente', redistribution: 'nao-esclarecida' },
      { status: 'pendente' },
    ];
    for (const license of cases) {
      expect(referenceSchema.safeParse(citationOnly(license)).success).toBe(true);
    }
  });

  it('continuam sujeitas às demais regras (ex.: data de consulta de bases e Wikipédia)', () => {
    const base = citationOnly({ status: 'nao-aplicavel', redistribution: 'nao-permitida' });
    expect(referenceSchema.safeParse({ ...base, kind: 'base-de-dados' }).success).toBe(false);
    expect(
      referenceSchema.safeParse({ ...base, url: 'https://en.wikipedia.org/wiki/Iron' }).success,
    ).toBe(false);
  });
});

describe('referenceSchema: restrições de licença', () => {
  const conditional = (restrictions: unknown) => ({
    ...makeFixtureReference(),
    license: { status: 'verificada', redistribution: 'condicional', restrictions },
  });

  it('aceita cada uma das cinco restrições, isoladamente e em conjunto', () => {
    for (const restriction of LICENSE_RESTRICTIONS) {
      expect(referenceSchema.safeParse(conditional([restriction])).success).toBe(true);
    }
    expect(referenceSchema.safeParse(conditional([...LICENSE_RESTRICTIONS])).success).toBe(true);
  });

  it('rejeita restrição desconhecida', () => {
    expect(referenceSchema.safeParse(conditional(['so-para-amigos'])).success).toBe(false);
    expect(
      referenceSchema.safeParse(conditional(['nao-comercial', 'so-para-amigos'])).success,
    ).toBe(false);
  });

  it('rejeita restrições repetidas', () => {
    const result = referenceSchema.safeParse(conditional(['nao-comercial', 'nao-comercial']));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Restrições repetidas.');
  });

  it('rejeita valor que não seja uma lista', () => {
    expect(referenceSchema.safeParse(conditional('nao-comercial')).success).toBe(false);
  });

  it('não admite restrições com redistribuição "permitida"', () => {
    const reference = {
      ...makeFixtureReference(),
      license: {
        status: 'verificada',
        redistribution: 'permitida',
        restrictions: ['sem-derivados'],
      },
    };
    const result = referenceSchema.safeParse(reference);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('use "condicional"');
  });

  it('aceita lista vazia ou ausente com "permitida"', () => {
    for (const restrictions of [[], undefined]) {
      const reference = {
        ...makeFixtureReference(),
        license: { status: 'verificada', redistribution: 'permitida', restrictions },
      };
      expect(referenceSchema.safeParse(reference).success).toBe(true);
    }
  });

  it('exige uma restrição ou uma nota para "condicional"', () => {
    expect(referenceSchema.safeParse(conditional([])).success).toBe(false);
    expect(referenceSchema.safeParse(conditional(undefined)).success).toBe(false);
    const withNote = {
      ...makeFixtureReference(),
      license: { status: 'verificada', redistribution: 'condicional', note: 'Condição descrita.' },
    };
    expect(referenceSchema.safeParse(withNote).success).toBe(true);
  });

  it('rejeita redistribuição desconhecida e campos extras na licença', () => {
    const unknownState = {
      ...makeFixtureReference(),
      license: { status: 'verificada', redistribution: 'talvez' },
    };
    expect(referenceSchema.safeParse(unknownState).success).toBe(false);
    const extra = { ...makeFixtureReference(), license: { status: 'nao-aplicavel', extra: true } };
    expect(referenceSchema.safeParse(extra).success).toBe(false);
  });

  it('trata a ausência de campos obrigatórios da licença', () => {
    expect(referenceSchema.safeParse({ ...makeFixtureReference(), license: {} }).success).toBe(
      false,
    );
    const { license, ...withoutLicense } = makeFixtureReference();
    void license;
    expect(referenceSchema.safeParse(withoutLicense).success).toBe(false);
  });
});
