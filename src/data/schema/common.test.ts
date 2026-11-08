import { z } from 'zod';
import { CITATION_ROLES, citationSchema, property } from './common';

const density = property('g/cm³');
const citations = [{ ref: 'fonte-de-teste' }];

describe('property (valor, desconhecido, não aplicável)', () => {
  it('aceita um valor com unidade, proveniência e citações', () => {
    const result = density.safeParse({
      status: 'valor',
      value: 1.5,
      unit: 'g/cm³',
      provenance: 'experimental',
      citations,
    });
    expect(result.success).toBe(true);
  });

  it('aceita proveniência calculada e estimada', () => {
    for (const provenance of ['calculado', 'estimado']) {
      expect(
        density.safeParse({ status: 'valor', value: 1, unit: 'g/cm³', provenance, citations })
          .success,
      ).toBe(true);
    }
  });

  it('rejeita proveniência desconhecida ou ausente', () => {
    const base = { status: 'valor', value: 1, unit: 'g/cm³', citations };
    expect(density.safeParse({ ...base, provenance: 'medido' }).success).toBe(false);
    expect(density.safeParse(base).success).toBe(false);
  });

  it('rejeita unidade diferente da padronizada', () => {
    const result = density.safeParse({
      status: 'valor',
      value: 1,
      unit: 'kg/m³',
      provenance: 'experimental',
      citations,
    });
    expect(result.success).toBe(false);
  });

  it('exige ao menos uma citação em todo valor', () => {
    const result = density.safeParse({
      status: 'valor',
      value: 1,
      unit: 'g/cm³',
      provenance: 'experimental',
      citations: [],
    });
    expect(result.success).toBe(false);
  });

  it('aceita "desconhecido" com ou sem motivo', () => {
    expect(density.safeParse({ status: 'desconhecido' }).success).toBe(true);
    expect(density.safeParse({ status: 'desconhecido', reason: 'Nunca medido.' }).success).toBe(
      true,
    );
  });

  it('exige o motivo em "nao-aplicavel"', () => {
    expect(density.safeParse({ status: 'nao-aplicavel' }).success).toBe(false);
    expect(
      density.safeParse({ status: 'nao-aplicavel', reason: 'Não existe a 1 atm.' }).success,
    ).toBe(true);
  });

  it('rejeita status inexistente, null e campos extras', () => {
    expect(density.safeParse({ status: 'talvez' }).success).toBe(false);
    expect(density.safeParse(null).success).toBe(false);
    expect(density.safeParse({ status: 'desconhecido', value: 1 }).success).toBe(false);
  });

  it('valida a faixa do valor quando informada', () => {
    const positive = property('K', z.number().positive());
    const value = (n: number) => ({
      status: 'valor',
      value: n,
      unit: 'K',
      provenance: 'experimental',
      citations,
    });
    expect(positive.safeParse(value(300)).success).toBe(true);
    expect(positive.safeParse(value(-1)).success).toBe(false);
  });
});

describe('citationSchema (papel da citação)', () => {
  it('declara os dois papéis', () => {
    expect([...CITATION_ROLES]).toEqual(['origem', 'apoio']);
  });

  it('aceita "origem", "apoio" e a ausência de papel (compatibilidade)', () => {
    for (const role of ['origem', 'apoio', undefined]) {
      expect(citationSchema.safeParse({ ref: 'fonte-de-teste', role }).success).toBe(true);
    }
    expect(citationSchema.safeParse({ ref: 'fonte-de-teste' }).success).toBe(true);
  });

  it('aceita papel junto com `locator`', () => {
    const result = citationSchema.safeParse({
      ref: 'fonte-de-teste',
      role: 'origem',
      locator: 'Tabela 1',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita papéis desconhecidos ou vazios', () => {
    for (const role of ['fonte', 'Origem', '', 'origem ']) {
      expect(citationSchema.safeParse({ ref: 'fonte-de-teste', role }).success).toBe(false);
    }
  });

  it('continua rejeitando campos desconhecidos e `ref` inválido', () => {
    expect(citationSchema.safeParse({ ref: 'fonte-de-teste', papel: 'origem' }).success).toBe(
      false,
    );
    expect(citationSchema.safeParse({ ref: 'Fonte Inválida', role: 'origem' }).success).toBe(false);
  });
});
