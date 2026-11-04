import { makeFixtureElement } from '@/test/fixtures';
import { elementSchema } from './element.schema';

describe('elementSchema', () => {
  it('aceita um elemento bem formado', () => {
    expect(elementSchema.safeParse(makeFixtureElement()).success).toBe(true);
  });

  it('rejeita símbolo químico inválido', () => {
    const result = elementSchema.safeParse(makeFixtureElement({ symbol: 'xx' }));
    expect(result.success).toBe(false);
  });

  it('rejeita número atômico fora de 1–118', () => {
    expect(elementSchema.safeParse(makeFixtureElement({ atomicNumber: 119 })).success).toBe(false);
  });

  it('exige que a soma dos elétrons por camada seja igual ao número atômico', () => {
    const base = makeFixtureElement();
    const broken = makeFixtureElement({
      electronConfiguration: { ...base.electronConfiguration, shells: [1] },
    });
    const result = elementSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['electronConfiguration', 'shells']);
  });

  it('rejeita sourceIds que não estão declarados em references', () => {
    const base = makeFixtureElement();
    const broken = makeFixtureElement({
      summary: { ...base.summary, sourceIds: ['fonte-inexistente'] },
    });
    const result = elementSchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('fonte-inexistente');
  });

  it('rejeita dado científico sem nenhuma referência', () => {
    const base = makeFixtureElement();
    const broken = makeFixtureElement({ phase: { ...base.phase, sourceIds: [] } });
    expect(elementSchema.safeParse(broken).success).toBe(false);
  });

  it('rejeita campos desconhecidos', () => {
    const result = elementSchema.safeParse({ ...makeFixtureElement(), extra: true });
    expect(result.success).toBe(false);
  });
});
