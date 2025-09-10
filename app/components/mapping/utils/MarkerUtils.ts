import { MarkerPosition } from '../types';

/**
 * Adiciona ou atualiza um marcador
 */
export const upsertMarker = (
  markers: MarkerPosition[],
  newMarker: MarkerPosition
): MarkerPosition[] => {
  const existingIndex = markers.findIndex(m => 
    m.id === newMarker.id && m.type === newMarker.type
  );
  
  if (existingIndex >= 0) {
    const updated = [...markers];
    updated[existingIndex] = newMarker;
    return updated;
  }
  
  return [...markers, newMarker];
};

/**
 * Filtra marcadores por tipo
 */
export const filterMarkersByType = (
  markers: MarkerPosition[],
  type: 'beacon' | 'motorcycle'
): MarkerPosition[] => {
  return markers.filter(marker => marker.type === type);
};

/**
 * Encontra um marcador específico
 */
export const findMarker = (
  markers: MarkerPosition[],
  id: string,
  type: 'beacon' | 'motorcycle'
): MarkerPosition | undefined => {
  return markers.find(marker => 
    marker.id === id && marker.type === type
  );
};