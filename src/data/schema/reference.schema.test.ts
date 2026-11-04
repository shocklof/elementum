import { makeFixtureReference } from '@/test/fixtures';
import { referenceSchema } from './reference.schema';

const verifiedLicense = {
  status: 'verificada' as const,
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
