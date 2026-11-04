import {
  ELEMENT_COUNT,
  GRID_COLUMNS,
  GRID_ROWS,
  LAYOUT,
  getElementAt,
  getPosition,
  getPositionBySymbol,
} from './layout';

const countBy = <T>(items: readonly T[], key: (item: T) => string | number) => {
  const counts = new Map<string | number, number>();
  for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  return counts;
};

describe('layout dos 118 elementos', () => {
  it('contém exatamente os números atômicos de 1 a 118, sem omissão nem duplicação', () => {
    expect(LAYOUT).toHaveLength(ELEMENT_COUNT);
    expect(LAYOUT.map((position) => position.atomicNumber)).toEqual(
      Array.from({ length: ELEMENT_COUNT }, (_, index) => index + 1),
    );
  });

  it('tem símbolos únicos e bem formados', () => {
    const symbols = LAYOUT.map((position) => position.symbol);
    expect(new Set(symbols).size).toBe(ELEMENT_COUNT);
    for (const symbol of symbols) expect(symbol).toMatch(/^[A-Z][a-z]{0,2}$/);
  });

  it('ocupa 118 células distintas, todas dentro da grade', () => {
    const cells = LAYOUT.map((position) => `${position.row}:${position.column}`);
    expect(new Set(cells).size).toBe(ELEMENT_COUNT);
    for (const { row, column } of LAYOUT) {
      expect(row).toBeGreaterThanOrEqual(1);
      expect(row).toBeLessThanOrEqual(GRID_ROWS);
      expect(column).toBeGreaterThanOrEqual(1);
      expect(column).toBeLessThanOrEqual(GRID_COLUMNS);
    }
  });

  it('respeita o tamanho dos períodos (2, 8, 8, 18, 18, 32, 32)', () => {
    const counts = countBy(LAYOUT, (position) => position.period);
    expect([1, 2, 3, 4, 5, 6, 7].map((period) => counts.get(period))).toEqual([
      2, 8, 8, 18, 18, 32, 32,
    ]);
  });

  it('respeita o tamanho dos blocos (s=14, p=36, d=40, f=28)', () => {
    const counts = countBy(LAYOUT, (position) => position.block);
    expect([counts.get('s'), counts.get('p'), counts.get('d'), counts.get('f')]).toEqual([
      14, 36, 40, 28,
    ]);
  });

  it('adota o grupo 3 como Sc, Y, Lu e Lr (convenção do projeto)', () => {
    const group3 = LAYOUT.filter((position) => position.group === 3).map(
      (position) => position.symbol,
    );
    expect(group3).toEqual(['Sc', 'Y', 'Lu', 'Lr']);
    expect(getPositionBySymbol('Lu')).toMatchObject({ row: 6, column: 3, block: 'd' });
    expect(getPositionBySymbol('Lr')).toMatchObject({ row: 7, column: 3, block: 'd' });
  });

  it('organiza o bloco f em duas séries de 14 elementos, sem grupo, nas colunas 3–16', () => {
    const fBlock = LAYOUT.filter((position) => position.block === 'f');
    expect(fBlock).toHaveLength(28);
    for (const position of fBlock) {
      expect(position.group).toBeNull();
      expect(position.column).toBeGreaterThanOrEqual(3);
      expect(position.column).toBeLessThanOrEqual(16);
    }
    const lanthanoids = fBlock
      .filter((position) => position.row === 8)
      .map((position) => position.atomicNumber);
    const actinoids = fBlock
      .filter((position) => position.row === 9)
      .map((position) => position.atomicNumber);
    expect(lanthanoids).toEqual(Array.from({ length: 14 }, (_, index) => 57 + index));
    expect(actinoids).toEqual(Array.from({ length: 14 }, (_, index) => 89 + index));
  });

  it('mantém a coerência entre grupo, coluna, período, linha e bloco fora do bloco f', () => {
    for (const position of LAYOUT.filter((candidate) => candidate.block !== 'f')) {
      expect(position.group).not.toBeNull();
      expect(position.column).toBe(position.group);
      expect(position.row).toBe(position.period);
      const group = position.group as number;
      if (position.symbol === 'He') expect(position.block).toBe('s');
      else if (group <= 2) expect(position.block).toBe('s');
      else if (group <= 12) expect(position.block).toBe('d');
      else expect(position.block).toBe('p');
    }
  });

  it('posiciona os extremos da tabela', () => {
    expect(getPosition(1)).toMatchObject({ symbol: 'H', group: 1, row: 1, column: 1 });
    expect(getPosition(2)).toMatchObject({ symbol: 'He', group: 18, row: 1, column: 18 });
    expect(getPosition(118)).toMatchObject({ symbol: 'Og', group: 18, row: 7, column: 18 });
  });

  it('oferece consultas por número, símbolo e célula', () => {
    expect(getPosition(26)?.symbol).toBe('Fe');
    expect(getPosition(0)).toBeUndefined();
    expect(getPosition(119)).toBeUndefined();
    expect(getPositionBySymbol('fe')?.atomicNumber).toBe(26);
    expect(getPositionBySymbol('Zz')).toBeUndefined();
    expect(getElementAt(8, 3)?.symbol).toBe('La');
    expect(getElementAt(1, 2)).toBeUndefined();
  });
});
