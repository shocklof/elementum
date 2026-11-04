import {
  FAMILIES,
  FAMILY_IDS,
  FAMILY_MARKERS,
  FAMILY_MEMBERS,
  getFamilyColorVar,
  getFamilyLabel,
  isFamilyId,
  type FamilyId,
} from './families';
import { ELEMENT_COUNT, LAYOUT } from './layout';

const membersOf = (id: FamilyId) => [...FAMILY_MEMBERS[id]];

describe('famílias', () => {
  it('são dez, com ids únicos', () => {
    expect(FAMILIES).toHaveLength(10);
    expect(new Set(FAMILY_IDS).size).toBe(10);
  });

  it('usa o id "metais-do-bloco-d" e o rótulo "Metais do bloco d"', () => {
    expect(isFamilyId('metais-do-bloco-d')).toBe(true);
    expect(isFamilyId('metais-de-transicao')).toBe(false);
    expect(getFamilyLabel('metais-do-bloco-d')).toBe('Metais do bloco d');
  });

  it('atribui um marcador geométrico exclusivo a cada família', () => {
    const markers = FAMILIES.map((family) => family.marker);
    expect(new Set(markers).size).toBe(FAMILIES.length);
    for (const marker of markers) expect(FAMILY_MARKERS).toContain(marker);
  });

  it('expõe a variável CSS da cor da família', () => {
    expect(getFamilyColorVar('gases-nobres')).toBe('var(--color-family-gases-nobres)');
  });
});

describe('pertinência canônica das famílias', () => {
  const all = FAMILY_IDS.flatMap(membersOf);

  it('cobre os 118 elementos exatamente uma vez', () => {
    expect(all).toHaveLength(ELEMENT_COUNT);
    expect(new Set(all).size).toBe(ELEMENT_COUNT);
    expect([...all].sort((a, b) => a - b)).toEqual(
      Array.from({ length: ELEMENT_COUNT }, (_, i) => i + 1),
    );
  });

  it('tem o tamanho esperado em cada família', () => {
    const sizes = Object.fromEntries(FAMILY_IDS.map((id) => [id, membersOf(id).length]));
    expect(sizes).toEqual({
      'metais-alcalinos': 6,
      'metais-alcalino-terrosos': 6,
      'metais-do-bloco-d': 38,
      'metais-de-pos-transicao': 12,
      semimetais: 6,
      'nao-metais': 7,
      halogenios: 6,
      'gases-nobres': 7,
      lantanideos: 15,
      actinideos: 15,
    });
  });

  it('inclui Zn, Cd, Hg e Cn em "Metais do bloco d" e deixa Lu e Lr nas séries f', () => {
    const blockD = membersOf('metais-do-bloco-d');
    for (const z of [30, 48, 80, 112]) expect(blockD).toContain(z);
    expect(blockD).not.toContain(71);
    expect(blockD).not.toContain(103);
    expect(membersOf('lantanideos')).toContain(71);
    expect(membersOf('actinideos')).toContain(103);
  });

  it('é independente da posição: o bloco d da grade menos Lu e Lr é a família "Metais do bloco d"', () => {
    const dBlock = LAYOUT.filter(
      (p) => p.block === 'd' && p.atomicNumber !== 71 && p.atomicNumber !== 103,
    );
    expect(dBlock.map((p) => p.atomicNumber).sort((a, b) => a - b)).toEqual(
      membersOf('metais-do-bloco-d'),
    );
  });

  it('inclui todo o bloco f em lantanídeos ou actinídeos', () => {
    const series = new Set([...membersOf('lantanideos'), ...membersOf('actinideos')]);
    for (const position of LAYOUT.filter((p) => p.block === 'f')) {
      expect(series.has(position.atomicNumber)).toBe(true);
    }
  });

  it('mantém as famílias definidas por grupo coerentes com o layout', () => {
    const groupOf = (z: number) => LAYOUT[z - 1]?.group;
    for (const z of membersOf('metais-alcalinos')) expect(groupOf(z)).toBe(1);
    for (const z of membersOf('metais-alcalino-terrosos')) expect(groupOf(z)).toBe(2);
    for (const z of membersOf('halogenios')) expect(groupOf(z)).toBe(17);
    for (const z of membersOf('gases-nobres')) expect(groupOf(z)).toBe(18);
  });

  it('lista os seis semimetais aprovados', () => {
    const symbols = membersOf('semimetais').map((z) => LAYOUT[z - 1]?.symbol);
    expect(symbols).toEqual(['B', 'Si', 'Ge', 'As', 'Sb', 'Te']);
  });
});
