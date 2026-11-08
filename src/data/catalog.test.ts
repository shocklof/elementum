import {
  FIXTURE_CITATION_ONLY_REF,
  FIXTURE_REF,
  makeFixtureElement,
  makeFixtureReference,
  makeFixtureRegistry,
  makeFullFixtureElement,
  makeIncorporableFixtureReference,
} from '@/test/fixtures';
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
import {
  CITATION_PATH_CATEGORIES,
  collectCitationBlocks,
  formatCitationPath,
  normalizeCitationPath,
  resolveBlockKind,
} from './citation-eligibility';
import { madelungFill } from './derive';
import { FAMILIES, FAMILY_IDS, type FamilyId } from './families';
import type { Citation } from './schema/common';
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
      citations: [{ ref: FIXTURE_REF, role: 'origem' }],
    },
  };
};
const refs = [makeIncorporableFixtureReference()];

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
        citations: [{ ref: FIXTURE_REF, role: 'origem' }],
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

/* -------------------------------------------------------------------------- */
/* Elegibilidade bibliográfica das citações (papéis `origem` e `apoio`)       */
/* Todas as referências e elementos abaixo são SINTÉTICOS.                    */
/* -------------------------------------------------------------------------- */

describe('elegibilidade bibliográfica das citações', () => {
  const OUTRA = 'outra-incorporavel';
  const registry = [
    ...makeFixtureRegistry(),
    makeIncorporableFixtureReference({ id: OUTRA, title: 'Outra fonte sintética incorporável' }),
  ];
  const element = () => makeFullFixtureElement({ atomicNumber: 2, symbol: 'Tb' });
  const cite = (ref: string, role?: 'origem' | 'apoio'): Citation =>
    role ? { ref, role } : { ref };
  const issuesOf = (candidate: Element, references: unknown[] = registry): string[] => {
    try {
      buildCatalog({ './elements/gases-nobres.json': [candidate] }, references, rules);
      return [];
    } catch (error) {
      if (error instanceof CatalogError) return [...error.issues];
      throw error;
    }
  };
  const SO = FIXTURE_CITATION_ONLY_REF;

  const withDensity = (citations: Citation[]) => {
    const candidate = element();
    candidate.physical.density = {
      status: 'valor',
      value: 1,
      unit: 'g/cm³',
      provenance: 'experimental',
      citations,
    };
    return candidate;
  };

  /** Substitui as citações do bloco que está em `path` (caminho a partir da raiz do elemento). */
  const setCitationsAt = (
    root: Element,
    path: readonly (string | number)[],
    citations: Citation[],
  ) => {
    let node = root as unknown as Record<string | number, unknown>;
    for (const segment of path) node = node[segment] as Record<string | number, unknown>;
    node.citations = citations;
    return root;
  };

  const blocks = collectCitationBlocks(makeFullFixtureElement());
  const kindOf = (block: (typeof blocks)[number]) =>
    resolveBlockKind(
      CITATION_PATH_CATEGORIES[normalizeCitationPath(block.path)] ?? 'autoral',
      block.container,
    );
  const dataBlocks = blocks.filter((block) => kindOf(block) === 'dado');
  const nonDataBlocks = blocks.filter((block) => kindOf(block) !== 'dado');

  it('o elemento sintético completo, com origens incorporáveis, é elegível', () => {
    expect(issuesOf(element())).toEqual([]);
  });

  it('o conjunto de teste cobre blocos de dado e blocos que não são de dado', () => {
    expect(dataBlocks.length).toBeGreaterThan(15);
    expect(nonDataBlocks.length).toBeGreaterThan(5);
  });

  describe('casos positivos', () => {
    it('valor com uma origem incorporável', () => {
      expect(issuesOf(withDensity([cite(FIXTURE_REF, 'origem')]))).toEqual([]);
    });

    it('valor com múltiplas origens incorporáveis', () => {
      expect(issuesOf(withDensity([cite(FIXTURE_REF, 'origem'), cite(OUTRA, 'origem')]))).toEqual(
        [],
      );
    });

    it('valor com origem incorporável e apoio apenas para citação', () => {
      expect(issuesOf(withDensity([cite(FIXTURE_REF, 'origem'), cite(SO, 'apoio')]))).toEqual([]);
    });

    it('apoio de referência incorporável também é aceito, desde que haja origem', () => {
      expect(issuesOf(withDensity([cite(OUTRA, 'apoio'), cite(FIXTURE_REF, 'origem')]))).toEqual(
        [],
      );
    });

    it('texto autoral fundamentado por referência apenas para citação, com ou sem papel', () => {
      const candidate = element();
      candidate.summary = { text: 'Resumo sintético.', citations: [cite(SO)] };
      candidate.appearance = { text: 'Aparência sintética.', citations: [cite(SO, 'apoio')] };
      candidate.etymology = { text: 'Etimologia sintética.', citations: [cite(SO)] };
      candidate.uses = [{ text: 'Uso sintético.', citations: [cite(SO, 'apoio')] }];
      expect(issuesOf(candidate)).toEqual([]);
    });

    it('classificação fundamentada por referência apenas para citação, com ou sem papel', () => {
      for (const citation of [cite(SO), cite(SO, 'apoio')]) {
        const candidate = element();
        candidate.classification = {
          status: 'predita',
          note: 'Nota sintética.',
          citations: [citation],
        };
        expect(issuesOf(candidate)).toEqual([]);
      }
    });

    it('estado desconhecido com justificativa apenas para citação', () => {
      for (const citation of [cite(SO), cite(SO, 'apoio')]) {
        const candidate = element();
        candidate.physical.meltingPoint = {
          status: 'desconhecido',
          reason: 'Nunca medido.',
          citations: [citation],
        };
        expect(issuesOf(candidate)).toEqual([]);
      }
    });

    it('estado não aplicável com justificativa apenas para citação', () => {
      for (const citation of [cite(SO), cite(SO, 'apoio')]) {
        const candidate = element();
        candidate.chemical.vanDerWaalsRadius = {
          status: 'nao-aplicavel',
          reason: 'Não se define.',
          citations: [citation],
        };
        expect(issuesOf(candidate)).toEqual([]);
      }
    });

    it('isótopo com origem e apoio adequados, no isótopo e em suas propriedades', () => {
      const candidate = element();
      const isotope = candidate.isotopes[0];
      if (!isotope) throw new Error('fixture sem isótopo');
      isotope.citations = [cite(FIXTURE_REF, 'origem'), cite(SO, 'apoio')];
      isotope.atomicMass = {
        status: 'valor',
        value: 4,
        unit: 'u',
        provenance: 'experimental',
        citations: [cite(FIXTURE_REF, 'origem'), cite(SO, 'apoio')],
      };
      expect(issuesOf(candidate)).toEqual([]);
    });

    it('meia-vida "estavel" é dado e aceita origem incorporável com apoio', () => {
      const candidate = element();
      const isotope = candidate.isotopes[1];
      if (!isotope) throw new Error('fixture sem segundo isótopo');
      isotope.halfLife = {
        status: 'estavel',
        provenance: 'experimental',
        citations: [cite(FIXTURE_REF, 'origem'), cite(SO, 'apoio')],
      };
      expect(issuesOf(candidate)).toEqual([]);
    });
  });

  describe('casos negativos', () => {
    it('valor cuja única referência é apenas para citação (marcada como origem)', () => {
      const issues = issuesOf(withDensity([cite(SO, 'origem')]));
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('Tb: physical.density.citations[0]');
      expect(issues[0]).toContain(`ref=${SO}; role=origem; usage=apenas-citacao`);
    });

    it('origem incorporável com uma segunda referência apenas para citação marcada como origem', () => {
      const issues = issuesOf(withDensity([cite(FIXTURE_REF, 'origem'), cite(SO, 'origem')]));
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('physical.density.citations[1]');
      expect(issues[0]).toContain(`ref=${SO}; role=origem; usage=apenas-citacao`);
    });

    it('bloco composto somente por citações de apoio', () => {
      const issues = issuesOf(withDensity([cite(FIXTURE_REF, 'apoio'), cite(SO, 'apoio')]));
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('physical.density');
      expect(issues[0]).toContain('sem citação com papel "origem"');
      expect(issues[0]).toContain(`refs=${FIXTURE_REF}, ${SO}`);
    });

    it('citação de dado sem papel explícito', () => {
      const issues = issuesOf(withDensity([cite(FIXTURE_REF)]));
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('physical.density.citations[0]');
      expect(issues[0]).toContain('sem papel explícito');
      expect(issues[0]).toContain(`ref=${FIXTURE_REF}; role=ausente; usage=dados-incorporados`);
    });

    it('referência inexistente é reportada uma só vez, sem mensagens de elegibilidade', () => {
      const issues = issuesOf(withDensity([cite('nao-existe', 'origem')]));
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('não está no registro global');
    });

    it('papel "origem" em conteúdo autoral', () => {
      const candidate = element();
      candidate.summary = { text: 'Resumo sintético.', citations: [cite(FIXTURE_REF, 'origem')] };
      const issues = issuesOf(candidate);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('summary.citations[0]');
      expect(issues[0]).toContain('"origem" não se aplica a conteúdo autoral');
    });

    it('papel "origem" em classificação', () => {
      const candidate = element();
      candidate.classification = {
        status: 'predita',
        note: 'Nota sintética.',
        citations: [cite(FIXTURE_REF, 'origem')],
      };
      const issues = issuesOf(candidate);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('classification.citations[0]');
    });

    it('papel "origem" em estado desconhecido ou não aplicável', () => {
      const unknown = element();
      unknown.physical.meltingPoint = {
        status: 'desconhecido',
        citations: [cite(FIXTURE_REF, 'origem')],
      };
      expect(issuesOf(unknown)[0]).toContain('estado desconhecido ou não aplicável');
      const notApplicable = element();
      notApplicable.chemical.vanDerWaalsRadius = {
        status: 'nao-aplicavel',
        reason: 'Não se define.',
        citations: [cite(FIXTURE_REF, 'origem')],
      };
      expect(issuesOf(notApplicable)[0]).toContain('chemical.vanDerWaalsRadius.citations[0]');
    });

    it('citação no nível do isótopo sem origem incorporável', () => {
      for (const citations of [[cite(SO, 'origem')], [cite(FIXTURE_REF, 'apoio')]]) {
        const candidate = element();
        const isotope = candidate.isotopes[0];
        if (!isotope) throw new Error('fixture sem isótopo');
        isotope.citations = citations;
        const issues = issuesOf(candidate);
        expect(issues).toHaveLength(1);
        expect(issues[0]).toContain('isotopes[0]');
      }
    });

    it('discovery sem origem incorporável', () => {
      for (const citations of [[cite(SO, 'origem')], [cite(SO, 'apoio')]]) {
        const candidate = element();
        candidate.discovery = { year: 1898, discoverers: ['Fulano'], citations };
        const issues = issuesOf(candidate);
        expect(issues).toHaveLength(1);
        expect(issues[0]).toContain('discovery');
      }
    });

    it('referência condicional ou não esclarecida não é origem, mesmo com licença verificada', () => {
      const conditional = makeFixtureReference({
        id: 'fonte-condicional',
        license: {
          status: 'verificada',
          redistribution: 'condicional',
          restrictions: ['nao-comercial'],
        },
      });
      const issues = issuesOf(withDensity([cite('fonte-condicional', 'origem')]), [
        ...registry,
        conditional,
      ]);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('ref=fonte-condicional; role=origem; usage=apenas-citacao');
    });

    it.each(dataBlocks.map((block) => [formatCitationPath(block.path), block.path] as const))(
      'todo bloco de dado rejeita origem apenas para citação: %s',
      (where, path) => {
        const candidate = setCitationsAt(element(), path, [cite(SO, 'origem')]);
        const issues = issuesOf(candidate);
        expect(issues.some((issue) => issue.includes(`${where}.citations[0]`))).toBe(true);
        expect(issues.every((issue) => issue.includes('usage=apenas-citacao'))).toBe(true);
      },
    );

    it.each(nonDataBlocks.map((block) => [formatCitationPath(block.path), block.path] as const))(
      'nenhum bloco que não é de dado aceita o papel "origem": %s',
      (where, path) => {
        const candidate = setCitationsAt(element(), path, [cite(FIXTURE_REF, 'origem')]);
        const issues = issuesOf(candidate);
        expect(issues.some((issue) => issue.includes(`${where}.citations[0]`))).toBe(true);
        expect(issues.some((issue) => issue.includes('não se aplica'))).toBe(true);
      },
    );
  });

  describe('integração com o fluxo do catálogo', () => {
    it('a elegibilidade é aplicada em buildCatalog, depois da existência das referências', () => {
      const issues = issuesOf(withDensity([cite(SO, 'origem')]));
      expect(issues.some((issue) => issue.includes('physical.density.citations[0]'))).toBe(true);
    });

    it('registros de referência inválidos continuam sendo rejeitados antes', () => {
      expect(() =>
        buildCatalog({ './elements/gases-nobres.json': [element()] }, [{ id: 'x' }], rules),
      ).toThrow(CatalogError);
    });

    it('o catálogo real continua carregando, sem elementos', () => {
      expect(catalog.elements).toHaveLength(0);
      expect(catalog.references.map((reference) => reference.usage)).toEqual([
        'dados-incorporados',
        'dados-incorporados',
      ]);
    });
  });
});
