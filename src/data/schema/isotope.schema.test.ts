import { makeFixtureIsotope } from '@/test/fixtures';
import { isotopeSchema } from './isotope.schema';

const citations = [{ ref: 'fonte-de-teste' }];

describe('isotopeSchema', () => {
  it('aceita um isótopo natural estável', () => {
    expect(isotopeSchema.safeParse(makeFixtureIsotope()).success).toBe(true);
  });

  it('aceita meia-vida em segundos e meia-vida desconhecida', () => {
    const unstable = makeFixtureIsotope({
      halfLife: { status: 'valor', value: 1e10, unit: 's', provenance: 'experimental', citations },
    });
    expect(isotopeSchema.safeParse(unstable).success).toBe(true);
    expect(
      isotopeSchema.safeParse(makeFixtureIsotope({ halfLife: { status: 'desconhecido' } })).success,
    ).toBe(true);
  });

  it('rejeita meia-vida em outra unidade ou não positiva', () => {
    const wrongUnit = {
      status: 'valor',
      value: 1,
      unit: 'anos',
      provenance: 'experimental',
      citations,
    };
    const zero = { status: 'valor', value: 0, unit: 's', provenance: 'experimental', citations };
    expect(isotopeSchema.safeParse({ ...makeFixtureIsotope(), halfLife: wrongUnit }).success).toBe(
      false,
    );
    expect(isotopeSchema.safeParse({ ...makeFixtureIsotope(), halfLife: zero }).success).toBe(
      false,
    );
  });

  it('aceita as três origens naturais e a artificial', () => {
    for (const origin of ['primordial', 'cadeia-de-decaimento', 'cosmogenico'] as const) {
      expect(isotopeSchema.safeParse(makeFixtureIsotope({ origin })).success).toBe(true);
    }
    const artificial = makeFixtureIsotope({ origin: 'artificial', selection: 'representativo' });
    expect(isotopeSchema.safeParse(artificial).success).toBe(true);
  });

  it('rejeita seleção "natural" para isótopo artificial', () => {
    expect(isotopeSchema.safeParse(makeFixtureIsotope({ origin: 'artificial' })).success).toBe(
      false,
    );
  });

  it('rejeita seleção "representativo" para isótopo natural', () => {
    expect(
      isotopeSchema.safeParse(makeFixtureIsotope({ selection: 'representativo' })).success,
    ).toBe(false);
  });

  it('aceita "maior-meia-vida" para isótopo artificial', () => {
    const isotope = makeFixtureIsotope({ origin: 'artificial', selection: 'maior-meia-vida' });
    expect(isotopeSchema.safeParse(isotope).success).toBe(true);
  });

  it('aceita abundância natural só para isótopos naturais', () => {
    const abundance = {
      status: 'valor' as const,
      value: 0.5,
      unit: 'fracao' as const,
      provenance: 'experimental' as const,
      citations,
    };
    expect(isotopeSchema.safeParse(makeFixtureIsotope({ abundance })).success).toBe(true);
    const artificial = makeFixtureIsotope({
      origin: 'artificial',
      selection: 'representativo',
      abundance,
    });
    expect(isotopeSchema.safeParse(artificial).success).toBe(false);
    expect(
      isotopeSchema.safeParse(makeFixtureIsotope({ abundance: { ...abundance, value: 1.5 } }))
        .success,
    ).toBe(false);
  });

  it('valida modos de decaimento e ramificação', () => {
    const ok = makeFixtureIsotope({
      decayModes: [
        { mode: 'alfa', branching: 1 },
        { mode: 'fissao-espontanea', isUncertain: true },
      ],
    });
    expect(isotopeSchema.safeParse(ok).success).toBe(true);
    const bad = { ...makeFixtureIsotope(), decayModes: [{ mode: 'magia' }] };
    expect(isotopeSchema.safeParse(bad).success).toBe(false);
    const overflow = { ...makeFixtureIsotope(), decayModes: [{ mode: 'alfa', branching: 2 }] };
    expect(isotopeSchema.safeParse(overflow).success).toBe(false);
  });

  it('aceita estado isomérico e rejeita rótulo inválido', () => {
    expect(isotopeSchema.safeParse(makeFixtureIsotope({ isomer: 'm' })).success).toBe(true);
    expect(isotopeSchema.safeParse(makeFixtureIsotope({ isomer: 'm2' })).success).toBe(true);
    expect(isotopeSchema.safeParse(makeFixtureIsotope({ isomer: 'x' })).success).toBe(false);
  });

  it('exige citações no isótopo', () => {
    expect(isotopeSchema.safeParse({ ...makeFixtureIsotope(), citations: [] }).success).toBe(false);
  });
});
