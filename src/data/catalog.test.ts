import { makeFixtureElement } from '@/test/fixtures';
import {
  buildCatalog,
  catalog,
  CatalogError,
  findElementBySymbol,
  getCompleteness,
} from './catalog';
import { FAMILIES } from './families';

const dataFiles = import.meta.glob('./elements/*.json', { eager: true, import: 'default' });

describe('arquivos de dados por família', () => {
  it('existe um arquivo JSON para cada família, e nenhum além delas', () => {
    const found = Object.keys(dataFiles)
      .map((path) => path.replace('./elements/', '').replace('.json', ''))
      .sort();
    expect(found).toEqual(FAMILIES.map((family) => family.id).sort());
  });

  it('o catálogo real carrega e valida sem erros', () => {
    expect(catalog.elements.length).toBeLessThanOrEqual(118);
    expect(getCompleteness(catalog).registered).toBe(catalog.elements.length);
  });
});

describe('buildCatalog', () => {
  it('consolida e ordena elementos por número atômico', () => {
    const result = buildCatalog({
      './elements/gases-nobres.json': [makeFixtureElement({ atomicNumber: 2, symbol: 'Tb' })],
      './elements/nao-metais.json': [
        makeFixtureElement({
          atomicNumber: 1,
          symbol: 'Ta',
          family: 'nao-metais',
          electronConfiguration: {
            full: '1s1',
            condensed: '1s1',
            shells: [1],
            sourceIds: ['fonte-de-teste'],
          },
        }),
      ],
    });
    expect(result.elements.map((e) => e.symbol)).toEqual(['Ta', 'Tb']);
  });

  it('rejeita arquivo cujo nome não é uma família conhecida', () => {
    expect(() => buildCatalog({ './elements/outros.json': [] })).toThrow(CatalogError);
  });

  it('rejeita elemento cuja família difere da do arquivo', () => {
    expect(() => buildCatalog({ './elements/halogenios.json': [makeFixtureElement()] })).toThrow(
      /declara a família/,
    );
  });

  it('rejeita números atômicos duplicados', () => {
    expect(() =>
      buildCatalog({
        './elements/gases-nobres.json': [
          makeFixtureElement({ symbol: 'Ta' }),
          makeFixtureElement({ symbol: 'Tb' }),
        ],
      }),
    ).toThrow(/duplicado/);
  });

  it('rejeita conteúdo que não segue o schema', () => {
    expect(() => buildCatalog({ './elements/gases-nobres.json': [{ symbol: 'X' }] })).toThrow(
      CatalogError,
    );
  });
});

describe('consultas', () => {
  const small = buildCatalog({ './elements/gases-nobres.json': [makeFixtureElement()] });

  it('busca elemento por símbolo ignorando maiúsculas', () => {
    expect(findElementBySymbol(small, 'tt')?.name).toBe('Teste');
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
