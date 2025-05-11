import { Point } from '../types';

/**
 * Calcula o raio com base em dois pontos (centro e borda)
 */
export const calculateCircleRadius = (center: Point, edgePoint: Point): number => {
  const dx = edgePoint.x - center.x;
  const dy = edgePoint.y - center.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Verifica se o polígono está pronto para ser fechado
 */
export const shouldClosePolygon = (points: Point[], newPoint: Point, threshold = 5): boolean => {
  if (points.length < 3) return false;
  
  const firstPoint = points[0];
  const distance = Math.sqrt(
    Math.pow(newPoint.x - firstPoint.x, 2) + 
    Math.pow(newPoint.y - firstPoint.y, 2)
  );
  
  return distance < threshold;
};

/**
 * Calcula os limites de um polígono
 */
export const calculatePolygonBounds = (points: Point[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} => {
  return points.reduce((bounds, point) => ({
    minX: Math.min(bounds.minX, point.x),
    minY: Math.min(bounds.minY, point.y),
    maxX: Math.max(bounds.maxX, point.x),
    maxY: Math.max(bounds.maxY, point.y),
  }), {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity
  });
};

/**
 * Gera pontos para uma forma geométrica pré-definida
 */
export const generateShapePoints = (shape: 'circle' | 'rectangle', center: Point, size: number): Point[] => {
  if (shape === 'circle') {
    return [center]; // Retorna apenas o centro para círculos
  } else {
    // Retorna os 4 cantos para retângulos
    const halfSize = size / 2;
    return [
      { x: center.x - halfSize, y: center.y - halfSize }, // Top-left
      { x: center.x + halfSize, y: center.y - halfSize }, // Top-right
      { x: center.x + halfSize, y: center.y + halfSize }, // Bottom-right
      { x: center.x - halfSize, y: center.y + halfSize }  // Bottom-left
    ];
  }
};