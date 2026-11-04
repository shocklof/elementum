import { makeFixtureElement, makeFixtureIsotope } from '@/test/fixtures';
import { madelungFill } from '../derive';
import { CLASSIFICATION_REVIEW_MIN_Z, elementSchema, type Element } from './element.schema';

const citations = [{ ref: 'fonte-de-teste' }];
const valid = (element: Element) => elementSchema.safeParse(element).success;

function firstIssue(element: unknown) {
  const result = elementSchema.safeParse(element);
  expect(result.success).toBe(false);
  return result.error?.issues[0];
}

describe('elementSchema: estrutura geral', () => {
  it('aceita um elemento bem formado', () => {
    expect(valid(makeFixtureElement())).toBe(true);
  });

  it('rejeita símbolo inválido e número atômico fora de 1–118', () => {
    expect(valid(makeFixtureElement({ symbol: 'xx' }))).toBe(false);
    expect(valid(makeFixtureElement({ atomicNumber: 119 }))).toBe(false);
    expect(valid(makeFixtureElement({ atomicNumber: 0 }))).toBe(false);
  });

  it('exige nomes em português e em inglês', () => {
    expect(valid(makeFixtureElement({ names: { pt: 'Teste', en: '' } }))).toBe(false);
    expect(
      elementSchema.safeParse({ ...makeFixtureElement(), names: { pt: 'Teste' } }).success,
    ).toBe(false);
  });

  it('rejeita campos desconhecidos e campos legados', () => {
    expect(elementSchema.safeParse({ ...makeFixtureElement(), extra: true }).success).toBe(false);
    for (const legacy of ['group', 'period', 'block', 'tablePosition', 'name', 'references']) {
      expect(elementSchema.safeParse({ ...makeFixtureElement(), [legacy]: 1 }).success).toBe(false);
    }
  });

  it('rejeita família que não exista', () => {
    expect(
      elementSchema.safeParse({ ...makeFixtureElement(), family: 'metais-de-transicao' }).success,
    ).toBe(false);
  });

  it('aceita o Tier 2 opcional e valida suas unidades', () => {
    const tier2 = {
      thermalConductivity: {
        status: 'valor' as const,
        value: 10,
        unit: 'W/(m·K)' as const,
        provenance: 'experimental' as const,
        citations,
      },
      heatOfFusion: { status: 'desconhecido' as const },
    };
    expect(valid(makeFixtureElement({ tier2 }))).toBe(true);
    const wrongUnit = { thermalConductivity: { ...tier2.thermalConductivity, unit: 'W/mK' } };
    expect(elementSchema.safeParse({ ...makeFixtureElement(), tier2: wrongUnit }).success).toBe(
      false,
    );
  });
});

describe('elementSchema: propriedades com estado', () => {
  it('aceita desconhecido e não aplicável em todas as propriedades do Tier 1', () => {
    const base = makeFixtureElement();
    const element = {
      ...base,
      physical: {
        density: { status: 'desconhecido' as const },
        meltingPoint: { status: 'nao-aplicavel' as const, reason: 'Teste.' },
        boilingPoint: { status: 'desconhecido' as const },
      },
    };
    expect(valid(element)).toBe(true);
  });

  it('exige condições no estado físico', () => {
    const base = makeFixtureElement();
    if (base.phase.status !== 'valor') throw new Error('fixture inesperada');
    const { conditions, ...withoutConditions } = base.phase;
    void conditions;
    expect(elementSchema.safeParse({ ...base, phase: withoutConditions }).success).toBe(false);
  });

  it('aceita estados de oxidação até +9 e rejeita acima', () => {
    const base = makeFixtureElement();
    const withStates = (value: number): Element => ({
      ...base,
      chemical: {
        ...base.chemical,
        oxidationStates: {
          status: 'valor',
          states: [{ value, prevalence: 'condicoes-extremas', note: 'Observado em fase gasosa.' }],
          provenance: 'experimental',
          citations,
        },
      },
    });
    expect(valid(withStates(9))).toBe(true);
    expect(valid(withStates(10))).toBe(false);
    expect(valid(withStates(-5))).toBe(true);
    expect(valid(withStates(-6))).toBe(false);
  });

  it('rejeita valores fora do domínio físico', () => {
    const base = makeFixtureElement();
    const negativeDensity = {
      ...base,
      physical: {
        ...base.physical,
        density: {
          status: 'valor',
          value: -1,
          unit: 'g/cm³',
          provenance: 'experimental',
          citations,
        },
      },
    };
    expect(elementSchema.safeParse(negativeDensity).success).toBe(false);
  });
});

describe('elementSchema: massa atômica', () => {
  it('aceita valor com incerteza', () => {
    expect(
      valid(
        makeFixtureElement({
          atomicMass: { form: 'valor', value: 4, uncertainty: 0.002, unit: 'u', citations },
        }),
      ),
    ).toBe(true);
  });

  it('aceita intervalo com valor abreviado', () => {
    const atomicMass: Element['atomicMass'] = {
      form: 'intervalo',
      lower: 1,
      upper: 2,
      abridged: { value: 1.5, uncertainty: 0.1 },
      unit: 'u',
      citations,
    };
    expect(valid(makeFixtureElement({ atomicMass }))).toBe(true);
  });

  it('rejeita intervalo com limites invertidos', () => {
    const atomicMass: Element['atomicMass'] = {
      form: 'intervalo',
      lower: 2,
      upper: 1,
      abridged: { value: 1.5 },
      unit: 'u',
      citations,
    };
    expect(valid(makeFixtureElement({ atomicMass }))).toBe(false);
  });

  it('aceita número de massa quando o isótopo consta em "isotopes"', () => {
    const element = makeFixtureElement({
      atomicMass: { form: 'numero-de-massa', massNumber: 4, citations },
    });
    expect(valid(element)).toBe(true);
  });

  it('rejeita número de massa sem o isótopo correspondente', () => {
    const element = makeFixtureElement({
      atomicMass: { form: 'numero-de-massa', massNumber: 5, citations },
    });
    expect(firstIssue(element)?.path).toEqual(['atomicMass', 'massNumber']);
  });

  it('rejeita forma desconhecida', () => {
    const element = { ...makeFixtureElement(), atomicMass: { form: 'outra', value: 1, citations } };
    expect(elementSchema.safeParse(element).success).toBe(false);
  });
});

describe('elementSchema: configuração eletrônica', () => {
  const config = (subshells: unknown) => ({
    status: 'valor',
    subshells,
    provenance: 'experimental',
    citations,
  });

  it('exige que a soma dos elétrons seja igual ao número atômico', () => {
    const element = {
      ...makeFixtureElement(),
      electronConfiguration: config([{ n: 1, l: 's', electrons: 1 }]),
    };
    expect(firstIssue(element)?.path).toEqual(['electronConfiguration', 'subshells']);
  });

  it('rejeita subcamada acima da capacidade', () => {
    const element = {
      ...makeFixtureElement({ atomicNumber: 3 }),
      electronConfiguration: config([{ n: 1, l: 's', electrons: 3 }]),
    };
    expect(firstIssue(element)?.message).toContain('no máximo 2');
  });

  it('rejeita subcamada inexistente (1p) e subcamada repetida', () => {
    const impossible = {
      ...makeFixtureElement(),
      electronConfiguration: config([{ n: 1, l: 'p', electrons: 2 }]),
    };
    expect(firstIssue(impossible)?.message).toContain('não existe');
    const repeated = {
      ...makeFixtureElement(),
      electronConfiguration: config([
        { n: 1, l: 's', electrons: 1 },
        { n: 1, l: 's', electrons: 1 },
      ]),
    };
    expect(firstIssue(repeated)?.message).toContain('repetida');
  });

  it('aceita configuração desconhecida', () => {
    const element = { ...makeFixtureElement(), electronConfiguration: { status: 'desconhecido' } };
    expect(elementSchema.safeParse(element).success).toBe(true);
  });

  it('não aceita mais camadas ou strings armazenadas (são derivadas)', () => {
    const element = {
      ...makeFixtureElement(),
      electronConfiguration: {
        ...config([{ n: 1, l: 's', electrons: 2 }]),
        shells: [2],
        full: '1s2',
      },
    };
    expect(elementSchema.safeParse(element).success).toBe(false);
  });
});

describe('elementSchema: classificação', () => {
  it('exige nota quando a classificação é predita', () => {
    const element = makeFixtureElement({ classification: { status: 'predita' } });
    expect(firstIssue(element)?.path).toEqual(['classification', 'note']);
    expect(
      valid(
        makeFixtureElement({ classification: { status: 'predita', note: 'Base da previsão.' } }),
      ),
    ).toBe(true);
  });

  it(`exige nota e citações para Z ≥ ${CLASSIFICATION_REVIEW_MIN_Z}`, () => {
    const config = {
      status: 'valor' as const,
      subshells: madelungFill(CLASSIFICATION_REVIEW_MIN_Z),
      provenance: 'calculado' as const,
      citations,
    };
    const base = makeFixtureElement({
      atomicNumber: CLASSIFICATION_REVIEW_MIN_Z,
      electronConfiguration: config,
      isotopes: [
        makeFixtureIsotope({ massNumber: 252, origin: 'artificial', selection: 'representativo' }),
      ],
    });
    expect(valid(base)).toBe(false);
    expect(valid({ ...base, classification: { status: 'estabelecida', note: 'Evidência.' } })).toBe(
      false,
    );
    expect(valid({ ...base, classification: { status: 'estabelecida', citations } })).toBe(false);
    expect(
      valid({ ...base, classification: { status: 'estabelecida', note: 'Evidência.', citations } }),
    ).toBe(true);
    expect(
      valid({ ...base, classification: { status: 'predita', note: 'Cálculo.', citations } }),
    ).toBe(true);
  });

  it('não presume que superpesados sejam preditos: ambos os status são aceitos', () => {
    // Coberto acima: "estabelecida" e "predita" passam com nota e citações.
    expect(CLASSIFICATION_REVIEW_MIN_Z).toBe(99);
  });
});

describe('elementSchema: isótopos', () => {
  it('exige ao menos um isótopo', () => {
    expect(valid(makeFixtureElement({ isotopes: [] }))).toBe(false);
  });

  describe('regra de seleção por origem', () => {
    // Todos os isótopos abaixo são SINTÉTICOS (fixtures de teste), sem valor científico.
    const natural = (count: number) =>
      Array.from({ length: count }, (_, index) => makeFixtureIsotope({ massNumber: 3 + index }));
    const artificial = (massNumber: number, selection: 'representativo' | 'maior-meia-vida') =>
      makeFixtureIsotope({ massNumber, origin: 'artificial', selection });
    const withIsotopes = (isotopes: Element['isotopes']) => makeFixtureElement({ isotopes });

    it('aceita mais de três isótopos naturais, sem limite', () => {
      expect(valid(withIsotopes(natural(4)))).toBe(true);
      expect(valid(withIsotopes(natural(60)))).toBe(true);
    });

    it('aceita as três origens naturais juntas, em quantidade maior que três', () => {
      const isotopes = [
        makeFixtureIsotope({ massNumber: 3, origin: 'primordial' }),
        makeFixtureIsotope({ massNumber: 4, origin: 'primordial' }),
        makeFixtureIsotope({ massNumber: 5, origin: 'cadeia-de-decaimento' }),
        makeFixtureIsotope({ massNumber: 6, origin: 'cosmogenico' }),
        makeFixtureIsotope({ massNumber: 7, origin: 'cosmogenico' }),
      ];
      expect(valid(withIsotopes(isotopes))).toBe(true);
    });

    it('aceita de um a três isótopos artificiais representativos em elemento sem naturais', () => {
      expect(valid(withIsotopes([artificial(250, 'maior-meia-vida')]))).toBe(true);
      expect(
        valid(
          withIsotopes([artificial(250, 'maior-meia-vida'), artificial(251, 'representativo')]),
        ),
      ).toBe(true);
      expect(
        valid(
          withIsotopes([
            artificial(250, 'maior-meia-vida'),
            artificial(251, 'representativo'),
            artificial(252, 'representativo'),
          ]),
        ),
      ).toBe(true);
    });

    it('rejeita mais de três isótopos artificiais em elemento sem naturais', () => {
      const four = [
        artificial(250, 'maior-meia-vida'),
        artificial(251, 'representativo'),
        artificial(252, 'representativo'),
        artificial(253, 'representativo'),
      ];
      const issue = firstIssue(withIsotopes(four));
      expect(issue?.path).toEqual(['isotopes']);
      expect(issue?.message).toContain('no máximo 3');
    });

    it('conta isômeros artificiais como entradas do limite de três', () => {
      const isotopes = [
        artificial(250, 'maior-meia-vida'),
        makeFixtureIsotope({
          massNumber: 250,
          isomer: 'm',
          origin: 'artificial',
          selection: 'representativo',
        }),
        artificial(251, 'representativo'),
        artificial(252, 'representativo'),
      ];
      expect(valid(withIsotopes(isotopes))).toBe(false);
    });

    it('o limite de três não afeta elementos com isótopos naturais', () => {
      // Cinco naturais mais o artificial de maior meia-vida: mais de três isótopos no total.
      const isotopes = [...natural(5), artificial(250, 'maior-meia-vida')];
      expect(valid(withIsotopes(isotopes))).toBe(true);
    });

    it('rejeita isótopo artificial representativo em elemento com isótopos naturais', () => {
      const issue = firstIssue(withIsotopes([...natural(2), artificial(250, 'representativo')]));
      expect(issue?.path).toEqual(['isotopes', 2, 'selection']);
    });

    it('admite no máximo um artificial (o de maior meia-vida) em elemento com naturais', () => {
      const isotopes = [
        ...natural(2),
        artificial(250, 'maior-meia-vida'),
        artificial(251, 'maior-meia-vida'),
      ];
      expect(valid(withIsotopes(isotopes))).toBe(false);
    });

    it('continua exigindo o isótopo de maior meia-vida quando a massa é um número de massa', () => {
      const massNumber = 251;
      const atomicMass: Element['atomicMass'] = { form: 'numero-de-massa', massNumber, citations };
      const included = [
        artificial(250, 'representativo'),
        artificial(massNumber, 'maior-meia-vida'),
        artificial(252, 'representativo'),
      ];
      expect(valid(makeFixtureElement({ atomicMass, isotopes: included }))).toBe(true);

      const missing = [artificial(250, 'representativo'), artificial(252, 'representativo')];
      const issue = firstIssue(makeFixtureElement({ atomicMass, isotopes: missing }));
      expect(issue?.path).toEqual(['atomicMass', 'massNumber']);
    });

    it('aplica o limite de três mesmo quando o número de massa está entre os isótopos', () => {
      const massNumber = 250;
      const atomicMass: Element['atomicMass'] = { form: 'numero-de-massa', massNumber, citations };
      const four = [
        artificial(massNumber, 'maior-meia-vida'),
        artificial(251, 'representativo'),
        artificial(252, 'representativo'),
        artificial(253, 'representativo'),
      ];
      expect(valid(makeFixtureElement({ atomicMass, isotopes: four }))).toBe(false);
    });

    it('permite o isótopo de maior meia-vida natural sem exigir artificial', () => {
      const massNumber = 5;
      const atomicMass: Element['atomicMass'] = { form: 'numero-de-massa', massNumber, citations };
      expect(valid(makeFixtureElement({ atomicMass, isotopes: natural(4) }))).toBe(true);
    });
  });

  it('rejeita isótopo repetido, mas aceita o isômero do mesmo número de massa', () => {
    const repeated = [makeFixtureIsotope(), makeFixtureIsotope()];
    expect(valid(makeFixtureElement({ isotopes: repeated }))).toBe(false);
    const withIsomer = [makeFixtureIsotope(), makeFixtureIsotope({ isomer: 'm' })];
    expect(valid(makeFixtureElement({ isotopes: withIsomer }))).toBe(true);
  });

  it('rejeita número de massa menor que o número atômico', () => {
    const element = makeFixtureElement({ isotopes: [makeFixtureIsotope({ massNumber: 1 })] });
    expect(firstIssue(element)?.path).toEqual(['isotopes', 0, 'massNumber']);
  });
});

describe('elementSchema: textos e descoberta', () => {
  it('exige citação nos textos descritivos', () => {
    expect(valid(makeFixtureElement({ summary: { text: 'Resumo.', citations: [] } }))).toBe(false);
    expect(valid(makeFixtureElement({ appearance: { text: 'Aparência.', citations: [] } }))).toBe(
      false,
    );
  });

  it('aceita elemento conhecido desde a Antiguidade (ano nulo) e ano de descoberta', () => {
    expect(
      valid(makeFixtureElement({ discovery: { year: null, discoverers: [], citations } })),
    ).toBe(true);
    expect(
      valid(makeFixtureElement({ discovery: { year: 1898, discoverers: ['Fulano'], citations } })),
    ).toBe(true);
  });
});
