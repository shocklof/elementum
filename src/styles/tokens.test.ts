import { FAMILIES } from '@/data/families';
import tokens from './tokens.css?raw';

describe('tokens de design', () => {
  it('define um token de cor para cada família de elementos', () => {
    for (const family of FAMILIES) {
      expect(tokens).toContain(`--color-family-${family.id}:`);
    }
  });

  it('usa o token renomeado de "Metais do bloco d" e não mantém o antigo', () => {
    expect(tokens).toContain('--color-family-metais-do-bloco-d:');
    expect(tokens).not.toContain('metais-de-transicao');
  });

  it('mantém as dez cores das famílias, sem repetição', () => {
    const colors = FAMILIES.map((family) => {
      const match = new RegExp(`--color-family-${family.id}:\\s*(#[0-9a-f]{6})`).exec(tokens);
      return match?.[1];
    });
    expect(colors.every(Boolean)).toBe(true);
    expect(new Set(colors).size).toBe(10);
  });

  it('declara o esquema de cores dark', () => {
    expect(tokens).toContain('color-scheme: dark');
  });

  it('define os tokens dos marcadores e dos estados de dados', () => {
    for (const token of [
      '--marker-size',
      '--marker-size-lg',
      '--border-predicted-style',
      '--hatch-predicted',
      '--color-unknown',
      '--opacity-dimmed',
    ]) {
      expect(tokens).toContain(`${token}:`);
    }
  });
});
