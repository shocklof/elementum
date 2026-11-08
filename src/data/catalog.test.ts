import { FIXTURE_REF, makeFixtureElement, makeFixtureReference } from '@/test/fixtures';
import {
  CatalogError,
  buildCatalog,
  catalog,
  collectCitationRefs,
  findElementBySymbol,
  findReference,
  getCompleteness,
  type CatalogRules,
} from './catalog';
import { madelungFill } from './derive';
import { FAMILIES, FAMILY_IDS, type FamilyId } from './families';
import type { Element } from './schema/element.schema';

const dataFiles = import.meta.glob('./elements/*.json', { eager: true, import: 'default' });

/** Regras sintéticas: Z=1 "Ta" e Z=2 "Tb"; o fixture usa símbolos que não existem na tabela real. */
function makeRules(): CatalogRules {
  const membership = Object.fromEntries(FAMILY_IDS.map((id) => [id, [] as number[]])) as Record<
    FamilyId,
    number[]
  >;
  membership['nao-metais'] = [1];
  membership['gases-nobres'] = [2];
  return {
    positions: [
      { atomicNumber: 1, symbol: 'Ta' },
      { atomicNumber: 2, symbol: 'Tb' },
    ],
    membership,
  };
}

const rules = makeRules();
const tb = () => makeFixtureElement({ atomicNumber: 2, symbol: 'Tb' });
const ta = (): Element => {
  const base = makeFixtureElement({ atomicNumber: 1, symbol: 'Ta', family: 'nao-metais' });
  return {
    ...base,
    electronConfiguration: {
      status: 'valor',
      subshells: [{ n: 1, l: 's', electrons: 1 }],
      provenance: 'experimental',
      citations: [{ ref: FIXTURE_REF }],
    },
  };
};
const refs = [makeFixtureReference()];

describe('arquivos de dados por família', () => {
  it('existe um arquivo JSON para cada família, e nenhum além delas', () => {
    const found = Object.keys(dataFiles)
      .map((path) => path.replace('./elements/', '').replace('.json', ''))
      .sort();
    expect(found).toEqual(FAMILIES.map((family) => family.id).sort());
  });

  it('o arquivo antigo "metais-de-transicao" não existe mais', () => {
    expect(Object.keys(dataFiles).some((path) => path.includes('metais-de-transicao'))).toBe(false);
    expect(Object.keys(dataFiles).some((path) => path.includes('metais-do-bloco-d'))).toBe(true);
  });

  it('o catálogo real carrega e valida sem erros', () => {
    expect(catalog.elements.length).toBeLessThanOrEqual(118);
    expect(getCompleteness(catalog).registered).toBe(catalog.elements.length);
    expect(Array.isArray(catalog.references)).toBe(true);
  });

  it('o catálogo real tem as duas referências iniciais e nenhum elemento cadastrado', () => {
    expect(catalog.elements).toHaveLength(0);
    expect(catalog.references.map((reference) => reference.id).sort()).toEqual([
      'ame2020-ii-artigo',
      'nubase2020-artigo',
    ]);
  });

  it('as duas referências do catálogo real ainda não foram citadas por nenhum elemento', () => {
    expect([...catalog.warnings].sort()).toEqual([
      'Referência "ame2020-ii-artigo" registrada, mas nunca citada.',
      'Referência "nubase2020-artigo" registrada, mas nunca citada.',
    ]);
  });
});

describe('buildCatalog', () => {
  it('consolida e ordena elementos por número atômico', () => {
    const result = buildCatalog(
      { './elements/gases-nobres.json': [tb()], './elements/nao-metais.json': [ta()] },
      refs,
      rules,
    );
    expect(result.elements.map((e) => e.symbol)).toEqual(['Ta', 'Tb']);
    expect(result.references).toHaveLength(1);
    expect(result.warnings).toEqual([]);
  });

  it('aceita catálogo vazio', () => {
    expect(buildCatalog({}, [], rules).elements).toEqual([]);
  });

  it('rejeita arquivo cujo nome não é uma família conhecida', () => {
    expect(() => buildCatalog({ './elements/outros.json': [] }, [], rules)).toThrow(CatalogError);
  });

  it('rejeita elemento cuja família difere da do arquivo', () => {
    expect(() => buildCatalog({ './elements/halogenios.json': [tb()] }, refs, rules)).toThrow(
      /declara a família/,
    );
  });

  it('rejeita elemento fora da pertinência canônica da família', () => {
    const wrong = makeFixtureElement({ atomicNumber: 2, symbol: 'Tb', family: 'halogenios' });
    expect(() => buildCatalog({ './elements/halogenios.json': [wrong] }, refs, rules)).toThrow(
      /pertence à família "gases-nobres"/,
    );
  });

  it('rejeita símbolo diferente do layout e número atômico inexistente no layout', () => {
    expect(() =>
      buildCatalog({ './elements/gases-nobres.json': [makeFixtureElement()] }, refs, rules),
    ).toThrow(/difere do layout/);
    const outside = makeFixtureElement({
      atomicNumber: 3,
      symbol: 'Tc',
      electronConfiguration: {
        status: 'valor',
        subshells: madelungFill(3),
        provenance: 'experimental',
        citations: [{ ref: FIXTURE_REF }],
      },
    });
    expect(() => buildCatalog({ './elements/gases-nobres.json': [outside] }, refs, rules)).toThrow(
      /não existe no layout/,
    );
  });

  it('confere símbolo e família com o layout e a pertinência reais por padrão', () => {
    const wrongSymbol = makeFixtureElement({ atomicNumber: 2, symbol: 'Tt' });
    expect(() => buildCatalog({ './elements/gases-nobres.json': [wrongSymbol] }, refs)).toThrow(
      /difere do layout \("He"\)/,
    );
  });

  it('rejeita números atômicos e símbolos duplicados', () => {
    expect(() =>
      buildCatalog({ './elements/gases-nobres.json': [tb(), tb()] }, refs, rules),
    ).toThrow(/duplicado/);
  });

  it('rejeita conteúdo que não segue o schema', () => {
    expect(() =>
      buildCatalog({ './elements/gases-nobres.json': [{ symbol: 'X' }] }, refs, rules),
    ).toThrow(CatalogError);
  });

  it('reúne todos os problemas em um único erro', () => {
    try {
      buildCatalog(
        { './elements/outros.json': [], './elements/halogenios.json': [tb()] },
        refs,
        rules,
      );
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(CatalogError);
      expect((error as CatalogError).issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('referências no catálogo', () => {
  it('rejeita citação de referência ausente do registro global', () => {
    expect(() => buildCatalog({ './elements/gases-nobres.json': [tb()] }, [], rules)).toThrow(
      /não está no registro global/,
    );
  });

  it('avisa (sem falhar) sobre referências registradas e nunca citadas', () => {
    const unused = makeFixtureReference({ id: 'fonte-sem-uso' });
    const result = buildCatalog(
      { './elements/gases-nobres.json': [tb()] },
      [...refs, unused],
      rules,
    );
    expect(result.warnings).toEqual(['Referência "fonte-sem-uso" registrada, mas nunca citada.']);
  });

  it('rejeita ids de referência duplicados e referências inválidas', () => {
    expect(() => buildCatalog({}, [makeFixtureReference(), makeFixtureReference()], rules)).toThrow(
      /duplicada/,
    );
    expect(() => buildCatalog({}, [{ id: 'x' }], rules)).toThrow(CatalogError);
    expect(() => buildCatalog({}, 'não é lista', rules)).toThrow(CatalogError);
  });

  it('bloqueia dados incorporados de fonte sem licença verificada', () => {
    const pending = makeFixtureReference({
      usage: 'dados-incorporados',
      license: { status: 'pendente' },
    });
    expect(() => buildCatalog({}, [pending], rules)).toThrow(/licença verificada/);
  });

  it('bloqueia dados incorporados de fonte com redistribuição condicional, mas aceita a mesma fonte só para citação', () => {
    const license = {
      status: 'verificada' as const,
      redistribution: 'condicional' as const,
      restrictions: ['nao-comercial' as const],
      name: 'Licença sintética de teste',
      termsUrl: 'https://example.org/termos',
      attribution: 'Atribuição de teste.',
      checkedAt: '2026-01-01',
    };
    const incorporated = makeFixtureReference({ usage: 'dados-incorporados', license });
    expect(() => buildCatalog({}, [incorporated], rules)).toThrow(/decisão específica documentada/);
    const citationOnly = makeFixtureReference({ usage: 'apenas-citacao', license });
    expect(() => buildCatalog({}, [citationOnly], rules)).not.toThrow();
  });

  it('aceita dados incorporados de fonte com redistribuição permitida', () => {
    const permitted = makeFixtureReference({
      usage: 'dados-incorporados',
      license: {
        status: 'verificada',
        redistribution: 'permitida',
        name: 'Licença sintética de teste',
        termsUrl: 'https://example.org/termos',
        attribution: 'Atribuição de teste.',
        checkedAt: '2026-01-01',
      },
    });
    expect(buildCatalog({}, [permitted], rules).references).toHaveLength(1);
  });

  it('coleta as citações de todo o elemento, inclusive as de isótopos e classificação', () => {
    const element = makeFixtureElement({
      classification: { status: 'predita', note: 'x', citations: [{ ref: 'outra-fonte' }] },
    });
    const found = new Set(collectCitationRefs(element));
    expect(found).toEqual(new Set([FIXTURE_REF, 'outra-fonte']));
  });

  it('encontra referências por id', () => {
    const result = buildCatalog({}, refs, rules);
    expect(findReference(result, FIXTURE_REF)?.title).toBe('Fonte sintética de teste');
    expect(findReference(result, 'nao-existe')).toBeUndefined();
  });
});

describe('consultas', () => {
  const small = buildCatalog({ './elements/gases-nobres.json': [tb()] }, refs, rules);

  it('busca elemento por símbolo ignorando maiúsculas', () => {
    expect(findElementBySymbol(small, 'tb')?.names.pt).toBe('Teste');
    expect(findElementBySymbol(small, 'zz')).toBeUndefined();
  });

  it('informa a completude do catálogo', () => {
    const completeness = getCompleteness(small);
    expect(completeness.expected).toBe(118);
    expect(completeness.registered).toBe(1);
    expect(completeness.missing).toHaveLength(117);
    expect(completeness.missing).not.toContain(2);
  });
});
