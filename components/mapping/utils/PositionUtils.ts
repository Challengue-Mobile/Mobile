import { Zone, MarkerPosition, Point } from '../types';

/**
 * Converte coordenadas de pixels para porcentagem relativa ao mapa
 */
export const convertToPercentage = (
  x: number, 
  y: number, 
  mapWidth: number, 
  mapHeight: number
): Point => ({
  x: (x / mapWidth) * 100,
  y: (y / mapHeight) * 100
});

/**
 * Verifica se um ponto está dentro de uma zona
 */
export const isPointInZone = (point: Point, zone: Zone): boolean => {
  const zoneLeft = parseFloat(zone.position.left);
  const zoneTop = parseFloat(zone.position.top);
  const zoneWidth = parseFloat(zone.position.width);
  const zoneHeight = parseFloat(zone.position.height);

  return (
    point.x >= zoneLeft &&
    point.x <= zoneLeft + zoneWidth &&
    point.y >= zoneTop &&
    point.y <= zoneTop + zoneHeight
  );
};

/**
 * Encontra a zona que contém um ponto
 */
export const findZoneForPoint = (point: Point, zones: Zone[]): string | null => {
  for (const zone of zones) {
    if (isPointInZone(point, zone)) {
      return zone.id;
    }
  }
  return null;
};

/**
 * Atualiza a posição de um marcador
 */
export const updateMarkerPosition = (
  markers: MarkerPosition[],
  markerId: string,
  newPosition: Point,
  zones: Zone[]
): MarkerPosition[] => {
  return markers.map(marker => {
    if (marker.id === markerId) {
      return {
        ...marker,
        position: newPosition,
        zoneId: findZoneForPoint(newPosition, zones)
      };
    }
    return marker;
  });
};