import { FAMILIES } from '@/data/families';
import tokens from './tokens.css?raw';

describe('tokens de design', () => {
  it('define um token de cor para cada família de elementos', () => {
    for (const family of FAMILIES) {
      expect(tokens).toContain(`--color-family-${family.id}:`);
    }
  });

  it('declara o esquema de cores dark', () => {
    expect(tokens).toContain('color-scheme: dark');
  });
});
