import type { Theme } from '../../../../constants/Themes';

/**
 * Gera uma cor aleatória para zonas
 */
export const generateRandomColor = (theme: Theme): string => {
  const colors = [
    theme.colors.primary[300],
    theme.colors.secondary[300],
    theme.colors.success[300],
    theme.colors.warning[300],
    theme.colors.error[300],
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Calcula a distância entre dois pontos
 */
interface Point {
  x: number;
  y: number;
}

export const calculateDistance = (point1: Point, point2: Point): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calcula o ponto médio entre vários pontos
 */
export const calculateMidpoint = (points: Point[]): Point => {
  const sum = points.reduce((acc, point) => ({
    x: acc.x + point.x,
    y: acc.y + point.y
  }), { x: 0, y: 0 });
  
  return {
    x: sum.x / points.length,
    y: sum.y / points.length
  };
};

/**
 * Normaliza um valor para um intervalo específico
 */
export const normalizeToRange = (
  value: number,
  min: number,
  max: number,
  newMin: number,
  newMax: number
): number => {
  return ((value - min) / (max - min)) * (newMax - newMin) + newMin;
};