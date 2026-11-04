import {
  SHELL_LABELS,
  compareMadelung,
  deriveShells,
  formatCondensedConfiguration,
  formatFullConfiguration,
  madelungFill,
  sortMadelung,
  totalElectrons,
} from './derive';
import type { Subshell } from './schema/element.schema';

// Entradas de teste (não são dados cadastrados): configurações idealizadas e de exemplo.
const neonLike: Subshell[] = [
  { n: 1, l: 's', electrons: 2 },
  { n: 2, l: 's', electrons: 2 },
  { n: 2, l: 'p', electrons: 6 },
];

describe('derive', () => {
  it('ordena subcamadas pela regra de Madelung', () => {
    const shuffled: Subshell[] = [
      { n: 3, l: 'd', electrons: 6 },
      { n: 4, l: 's', electrons: 2 },
      { n: 1, l: 's', electrons: 2 },
      { n: 4, l: 'p', electrons: 1 },
    ];
    expect(sortMadelung(shuffled).map((s) => `${s.n}${s.l}`)).toEqual(['1s', '4s', '3d', '4p']);
    expect(compareMadelung({ n: 3, l: 'd' }, { n: 4, l: 'p' })).toBeLessThan(0);
  });

  it('soma os elétrons', () => {
    expect(totalElectrons(neonLike)).toBe(10);
  });

  it('deriva elétrons por camada', () => {
    expect(deriveShells(neonLike)).toEqual([2, 8]);
    expect(
      deriveShells([
        { n: 1, l: 's', electrons: 2 },
        { n: 2, l: 's', electrons: 2 },
        { n: 2, l: 'p', electrons: 6 },
        { n: 3, l: 's', electrons: 2 },
        { n: 3, l: 'p', electrons: 6 },
        { n: 3, l: 'd', electrons: 6 },
        { n: 4, l: 's', electrons: 2 },
      ]),
    ).toEqual([2, 8, 14, 2]);
  });

  it('formata a configuração completa, com e sem expoentes Unicode', () => {
    expect(formatFullConfiguration(neonLike)).toBe('1s² 2s² 2p⁶');
    expect(formatFullConfiguration(neonLike, { superscript: false })).toBe('1s2 2s2 2p6');
  });

  it('formata a configuração condensada com o maior núcleo de gás nobre', () => {
    const argonPlus: Subshell[] = [
      ...madelungFill(18),
      { n: 4, l: 's', electrons: 2 },
      { n: 3, l: 'd', electrons: 6 },
    ];
    expect(formatCondensedConfiguration(argonPlus)).toBe('[Ar] 4s² 3d⁶');
    expect(formatCondensedConfiguration(neonLike)).toBe('[He] 2s² 2p⁶');
  });

  it('não usa núcleo quando não há gás nobre menor contido (Z ≤ 2)', () => {
    expect(formatCondensedConfiguration([{ n: 1, l: 's', electrons: 1 }])).toBe('1s¹');
    expect(formatCondensedConfiguration([{ n: 1, l: 's', electrons: 2 }])).toBe('1s²');
  });

  it('descarta o núcleo se uma subcamada do núcleo não estiver completa', () => {
    const incomplete: Subshell[] = [
      { n: 1, l: 's', electrons: 2 },
      { n: 2, l: 's', electrons: 2 },
      { n: 2, l: 'p', electrons: 5 },
    ];
    expect(formatCondensedConfiguration(incomplete)).toBe('[He] 2s² 2p⁵');
  });

  it('gera o preenchimento idealizado de Madelung e respeita as capacidades', () => {
    expect(totalElectrons(madelungFill(36))).toBe(36);
    expect(madelungFill(118).every((s) => s.electrons <= { s: 2, p: 6, d: 10, f: 14 }[s.l])).toBe(
      true,
    );
    expect(totalElectrons(madelungFill(118))).toBe(118);
    expect(deriveShells(madelungFill(10))).toEqual([2, 8]);
  });

  it('lista os rótulos das sete camadas', () => {
    expect(SHELL_LABELS).toEqual(['K', 'L', 'M', 'N', 'O', 'P', 'Q']);
  });
});
