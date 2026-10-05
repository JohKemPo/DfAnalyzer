import type { AttributeInfo } from '../api/catalog';

/** Quais operadores fazem sentido para cada tipo de atributo. */
export interface Operator {
  /** Como aparece na interface. */
  label: string;
  /** Como entra na gramática de `selections` do backend. */
  sql: string;
  /** Quantos valores o operador consome. */
  operands: 0 | 1 | 2;
  /** Se o valor deve ir entre aspas simples na expressão. */
  quoted: boolean;
}

const IGUALDADE: Operator[] = [
  { label: 'é igual a', sql: '=', operands: 1, quoted: true },
  { label: 'é diferente de', sql: '<>', operands: 1, quoted: true },
];

const ORDEM: Operator[] = [
  { label: 'é maior que', sql: '>', operands: 1, quoted: false },
  { label: 'é maior ou igual a', sql: '>=', operands: 1, quoted: false },
  { label: 'é menor que', sql: '<', operands: 1, quoted: false },
  { label: 'é menor ou igual a', sql: '<=', operands: 1, quoted: false },
  { label: 'está entre', sql: 'BETWEEN', operands: 2, quoted: false },
];

const TEXTO: Operator[] = [
  { label: 'contém', sql: 'LIKE', operands: 1, quoted: true },
];

const PRESENCA: Operator[] = [
  { label: 'está vazio', sql: 'IS NULL', operands: 0, quoted: false },
  { label: 'não está vazio', sql: 'IS NOT NULL', operands: 0, quoted: false },
];

export function operatorsFor(type: AttributeInfo['type']): Operator[] {
  switch (type) {
    case 'NUMERIC':
      return [
        ...IGUALDADE.map((op) => ({ ...op, quoted: false })),
        ...ORDEM,
        ...PRESENCA,
      ];
    case 'FILE':
      // Caminho de arquivo: comparar magnitude não quer dizer nada.
      return [...IGUALDADE, ...TEXTO, ...PRESENCA];
    default:
      return [...IGUALDADE, ...TEXTO, ...PRESENCA];
  }
}

export interface Condition {
  /** Coluna qualificada, `dataset.atributo`. */
  column: string;
  operator: Operator;
  value: string;
  /** Segundo valor, só para BETWEEN. */
  value2: string;
}

/** Escapa uma aspa simples dobrando-a, como a gramática do backend espera. */
function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** Monta a expressão que vai em `selections`. */
export function conditionToExpression(condition: Condition): string | null {
  const { column, operator, value, value2 } = condition;
  if (!column) return null;

  const wrap = (raw: string) => (operator.quoted ? quote(raw) : raw.trim());

  switch (operator.operands) {
    case 0:
      return `${column} ${operator.sql}`;
    case 1: {
      if (!value.trim()) return null;
      // 'contém' vira LIKE com curingas nas duas pontas.
      const operand = operator.sql === 'LIKE' ? quote(`%${value}%`) : wrap(value);
      return `${column} ${operator.sql} ${operand}`;
    }
    default: {
      if (!value.trim() || !value2.trim()) return null;
      return `${column} BETWEEN ${wrap(value)} AND ${wrap(value2)}`;
    }
  }
}

/** Todas as expressões completas, na ordem. */
export function conditionsToSelections(conditions: Condition[]): string[] {
  return conditions
    .map(conditionToExpression)
    .filter((expression): expression is string => expression !== null);
}
